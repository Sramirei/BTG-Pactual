# Guia Rapida - Backend BTG Pactual

## Como funciona
- Autenticacion con JWT: el cliente se registra o hace login y usa `Bearer token`.
- Al iniciar, se cargan los 5 fondos base si no existen.
- Suscripcion a fondo:
  - valida fondo, monto minimo y saldo disponible;
  - descuenta saldo, crea suscripcion y registra transaccion en DynamoDB (operacion atomica).
- Cancelacion:
  - elimina la suscripcion activa;
  - devuelve el dinero al saldo del cliente;
  - registra transaccion de cancelacion.
- Historial:
  - lista aperturas y cancelaciones por usuario con paginacion por cursor.
- Notificaciones:
  - SMS directo por SNS si el usuario eligio SMS;
  - Email por SNS Topic si el usuario eligio EMAIL.

## Despliegue corto (AWS + Serverless)
1. Prerrequisitos:
   - Node.js 20+
   - credenciales AWS configuradas (`aws configure`)
2. Configura variables:
   ```bash
   cd back
   cp .env.example .env
   ```
   Actualiza al menos `JWT_SECRET` y, si aplica, `SNS_TOPIC_ARN`.
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Despliega:
   ```bash
   npm run deploy -- --stage dev
   ```
5. Consulta el endpoint:
   ```bash
   npx serverless info --stage dev
   ```

## Ejecucion local
```bash
cd back
cp .env.example .env
npm install
npm run dev
```

## Frontend (React + Vite) en AWS
1. Despliega backend (crea API + bucket frontend):
   ```bash
   cd back
   npm run deploy -- --stage dev
   ```
2. Despliega frontend al bucket del mismo stack:
   ```bash
   cd ../front
   cp .env.example .env
   npm install
   npm run deploy:aws -- dev
   ```
