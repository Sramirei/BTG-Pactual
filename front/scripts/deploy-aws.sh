#!/usr/bin/env bash
set -euo pipefail

STAGE="${1:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
SERVICE_NAME="${SERVICE_NAME:-btg-funds-platform}"
STACK_NAME="${SERVICE_NAME}-${STAGE}"

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI no esta instalado. Instala AWS CLI para desplegar el frontend."
  exit 1
fi

echo "Leyendo outputs del stack ${STACK_NAME}..."
API_ENDPOINT="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text)"

FRONTEND_BUCKET_NAME="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)"

FRONTEND_WEBSITE_URL="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteUrl'].OutputValue" \
  --output text)"

if [[ -z "${FRONTEND_BUCKET_NAME}" || "${FRONTEND_BUCKET_NAME}" == "None" ]]; then
  echo "No se encontro el output FrontendBucketName en ${STACK_NAME}."
  exit 1
fi

if [[ -z "${API_ENDPOINT}" || "${API_ENDPOINT}" == "None" ]]; then
  echo "No se encontro el output ApiEndpoint en ${STACK_NAME}."
  exit 1
fi

export VITE_API_BASE_URL="${API_ENDPOINT%/}/api/v1"
echo "Construyendo frontend con VITE_API_BASE_URL=${VITE_API_BASE_URL}"
npm run build

echo "Subiendo archivos a s3://${FRONTEND_BUCKET_NAME}..."
aws s3 sync dist "s3://${FRONTEND_BUCKET_NAME}" --delete --region "${AWS_REGION}"

echo "Actualizando cache-control de index.html..."
aws s3 cp "dist/index.html" "s3://${FRONTEND_BUCKET_NAME}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --region "${AWS_REGION}"

if [[ -n "${FRONTEND_WEBSITE_URL}" && "${FRONTEND_WEBSITE_URL}" != "None" ]]; then
  echo "Frontend desplegado: ${FRONTEND_WEBSITE_URL}"
else
  echo "Frontend desplegado en bucket: s3://${FRONTEND_BUCKET_NAME}"
fi
