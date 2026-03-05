# BTG Pactual - Frontend

Frontend en React + Vite + Bootstrap/React-Bootstrap para operar el flujo completo:
- Registro y login
- Perfil del usuario
- Listado de fondos
- Apertura y cancelacion de suscripciones
- Historial de transacciones con paginacion
- Creacion de fondo (endpoint admin)

## Ejecutar local
```bash
cd front
cp .env.example .env
npm install
npm run dev
```

Por defecto el frontend consume:
`VITE_API_BASE_URL=http://localhost:4000/api/v1`

## Endpoints usados
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /funds`
- `POST /funds`
- `GET /subscriptions`
- `POST /subscriptions`
- `DELETE /subscriptions/:fundId`
- `GET /transactions`

## Despliegue en AWS (con el mismo stack backend)
1. Despliega backend primero:
   ```bash
   cd back
   npm run deploy -- --stage dev
   ```
2. Despliega frontend:
   ```bash
   cd ../front
   npm install
   npm run deploy:aws -- dev
   ```

El script `scripts/deploy-aws.sh` obtiene automáticamente `ApiEndpoint` y `FrontendBucketName` del stack CloudFormation.
