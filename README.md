## Synth Demo

Projeto Next.js com Web Audio API e fluxo de monetizacao com Stripe (Plano Pro).

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variaveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `PRO_COOKIE_SECRET` (opcional)

## Stripe

- `POST /api/stripe/checkout-session`: cria sessao de checkout
- `POST /api/stripe/confirm`: confirma sessao paga e ativa cookie Pro
- `POST /api/stripe/webhook`: recebe eventos Stripe
- `GET /api/pro/status`: retorna status do plano do usuario atual

Para testar webhook localmente com Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Qualidade

```bash
npm run lint
npm run test
npm run build
```

## Docker

Build e execucao local com containers:

```bash
docker compose build
docker compose up -d
```

## Deploy VPS (Nginx + SSL)

Pre-requisitos:
- Docker e Docker Compose instalados no VPS
- DNS do dominio apontando para IP do VPS
- portas `80` e `443` liberadas no firewall

Passos:
1. Copie o projeto para o servidor e configure `.env`.
2. Ajuste permissoes do script:
```bash
chmod +x infra/scripts/init-letsencrypt.sh
```
3. Gere certificado inicial e configure nginx:
```bash
./infra/scripts/init-letsencrypt.sh seu-dominio.com seu-email@dominio.com
```
4. Suba stack completa:
```bash
docker compose up -d
```

Observacoes:
- O arquivo [infra/nginx/conf.d/app.conf](infra/nginx/conf.d/app.conf) faz proxy para o app Next em `app:3000`.
- O servico `certbot` no `compose.yaml` executa renovacao periodica dos certificados.
