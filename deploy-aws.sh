#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_REGION="${AWS_REGION:-us-east-1}"
BACK_ENV_FILE="${ROOT_DIR}/back/.env"
SERVICE_NAME="${SERVICE_NAME:-btg-funds-platform}"
CLEAN_DEPLOY="false"
STAGE="dev"

for arg in "$@"; do
  case "${arg}" in
    --clean)
      CLEAN_DEPLOY="true"
      ;;
    *)
      STAGE="${arg}"
      ;;
  esac
done

STACK_NAME="${SERVICE_NAME}-${STAGE}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no esta instalado."
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI no esta instalado."
  exit 1
fi

echo "==> Stage: ${STAGE}"
echo "==> Region: ${AWS_REGION}"
echo "==> Clean deploy: ${CLEAN_DEPLOY}"
echo "==> Stack: ${STACK_NAME}"

if [[ -f "${BACK_ENV_FILE}" ]]; then
  echo "==> Cargando variables desde back/.env"
  set -a
  # shellcheck disable=SC1090
  source "${BACK_ENV_FILE}"
  set +a
else
  echo "==> back/.env no existe. Continuando con variables del entorno actual."
fi

if [[ -z "${JWT_SECRET:-}" ]]; then
  echo "JWT_SECRET no esta definido. Configuralo en back/.env o exportalo en tu shell."
  exit 1
fi

stack_exists() {
  aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    >/dev/null 2>&1
}

get_frontend_bucket_name() {
  aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text 2>/dev/null || true
}

empty_versioned_bucket() {
  local bucket_name="$1"

  if [[ -z "${bucket_name}" || "${bucket_name}" == "None" ]]; then
    return
  fi

  echo "==> Limpiando bucket S3 versionado: s3://${bucket_name}"
  aws s3 rm "s3://${bucket_name}" --recursive --region "${AWS_REGION}" >/dev/null 2>&1 || true

  while true; do
    local versions
    local markers

    versions="$(
      aws s3api list-object-versions \
        --bucket "${bucket_name}" \
        --region "${AWS_REGION}" \
        --query "Versions[].[Key,VersionId]" \
        --output text 2>/dev/null || true
    )"

    markers="$(
      aws s3api list-object-versions \
        --bucket "${bucket_name}" \
        --region "${AWS_REGION}" \
        --query "DeleteMarkers[].[Key,VersionId]" \
        --output text 2>/dev/null || true
    )"

    if [[ "${versions}" == "None" ]]; then
      versions=""
    fi

    if [[ "${markers}" == "None" ]]; then
      markers=""
    fi

    if [[ -z "${versions}" && -z "${markers}" ]]; then
      break
    fi

    if [[ -n "${versions}" ]]; then
      while IFS=$'\t' read -r key version_id; do
        [[ -z "${key}" || -z "${version_id}" ]] && continue
        aws s3api delete-object \
          --bucket "${bucket_name}" \
          --key "${key}" \
          --version-id "${version_id}" \
          --region "${AWS_REGION}" >/dev/null
      done <<< "${versions}"
    fi

    if [[ -n "${markers}" ]]; then
      while IFS=$'\t' read -r key version_id; do
        [[ -z "${key}" || -z "${version_id}" ]] && continue
        aws s3api delete-object \
          --bucket "${bucket_name}" \
          --key "${key}" \
          --version-id "${version_id}" \
          --region "${AWS_REGION}" >/dev/null
      done <<< "${markers}"
    fi
  done
}

force_delete_stack_if_exists() {
  if ! stack_exists; then
    return
  fi

  echo "==> Solicitando borrado del stack ${STACK_NAME}"
  aws cloudformation delete-stack \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}"

  echo "==> Esperando eliminacion completa del stack"
  if ! aws cloudformation wait stack-delete-complete \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" 2>/dev/null; then
    echo "No fue posible eliminar el stack automaticamente."
    echo "Revisa CloudFormation y vuelve a ejecutar el deploy."
    exit 1
  fi
}

if [[ "${CLEAN_DEPLOY}" == "true" ]]; then
  if stack_exists; then
    FRONTEND_BUCKET_NAME="$(get_frontend_bucket_name)"
    empty_versioned_bucket "${FRONTEND_BUCKET_NAME}"

    echo "==> Limpiando infraestructura previa (serverless remove)"
    set +e
    (
      cd "${ROOT_DIR}/back"
      npm run remove -- --stage "${STAGE}" --region "${AWS_REGION}"
    )
    REMOVE_EXIT_CODE=$?
    set -e

    if [[ ${REMOVE_EXIT_CODE} -ne 0 ]]; then
      echo "serverless remove fallo. Se intentara eliminacion forzada del stack."
      force_delete_stack_if_exists
    fi

    if stack_exists; then
      # Si remove no borro completamente el stack, forzamos borrado final.
      force_delete_stack_if_exists
    fi
  else
    echo "==> No existe stack previo para limpiar."
  fi
fi

echo "==> Desplegando backend (Serverless)"
(
  cd "${ROOT_DIR}/back"
  set +e
  DEPLOY_OUTPUT="$(npm run deploy -- --stage "${STAGE}" --region "${AWS_REGION}" 2>&1)"
  DEPLOY_EXIT_CODE=$?
  set -e

  if [[ ${DEPLOY_EXIT_CODE} -ne 0 ]]; then
    echo "${DEPLOY_OUTPUT}"
    if [[ "${DEPLOY_OUTPUT}" == *"Deployment bucket has been removed manually"* ]]; then
      echo ""
      echo "El bucket de despliegue fue eliminado manualmente."
      echo "Ejecuta nuevamente con limpieza completa:"
      echo "  ./deploy-aws.sh ${STAGE} --clean"
    fi
    exit ${DEPLOY_EXIT_CODE}
  fi

  echo "${DEPLOY_OUTPUT}"
)

echo "==> Desplegando frontend (S3 static site)"
(
  cd "${ROOT_DIR}/front"
  AWS_REGION="${AWS_REGION}" npm run deploy:aws -- "${STAGE}"
)

echo "==> Despliegue completo (back + front)."
