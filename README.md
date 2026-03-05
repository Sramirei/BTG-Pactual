# BTG-Pactual
Prueba tecnica

## Despliegue AWS (back + front)
Comando unico desde la raiz:

```bash
./deploy-aws.sh dev
```

Opcional:
- cambiar stage: `./deploy-aws.sh prod`
- cambiar region: `AWS_REGION=us-east-1 ./deploy-aws.sh dev`
- desplegar en limpio (borra stack previo y recrea): `./deploy-aws.sh dev --clean`
