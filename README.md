# Simplethyzer

Synth web com Web Audio API, monetizacao via Stripe e deploy em Docker.

## Visao geral

Objetivo do projeto:
- Audio em tempo real no navegador
- Fluxo de pagamento com Stripe
- Plano Pro com recurso premium real (2o oscilador)
- Deploy reproduzivel em VPS

Stack principal:
- Next.js 16 + TypeScript
- Web Audio API
- Stripe API
- Docker + Docker Compose
- Traefik (reverse proxy/TLS no servidor)
- Vitest + ESLint

## Funcionalidades

- Oscilador principal com waveform, ADSR, low-pass e volume
- Teclado com `noteOn`/`noteOff` (ADSR por tecla)
- Upgrade para Plano Pro via Stripe Checkout
- Confirmacao de pagamento e status Pro
- Segundo oscilador habilitado somente para Pro

## Arquitetura

Diagrama e fluxo tecnico:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Variaveis de ambiente

Copie `.env.example` para `.env`:

- `NEXT_PUBLIC_APP_URL`
- `TRAEFIK_HOST`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `PRO_COOKIE_SECRET` (recomendado em producao)

## Rodar local

```bash
npm install
npm run dev
```

Qualidade:

```bash
npm run lint
npm run test
npm run build
```

## Endpoints

- `POST /api/stripe/checkout-session`
- `POST /api/stripe/confirm`
- `POST /api/stripe/webhook`
- `GET /api/pro/status`

## Deploy manual no VPS

Pre-requisitos:
- Docker e Docker Compose instalados
- DNS apontando para o IP do VPS
- Traefik global no servidor com `websecure` + `letsencrypt`

Passos:

1. Clonar o projeto no servidor:
```bash
git clone https://github.com/<owner>/<repo>.git /root/Simplethyzer
cd /root/Simplethyzer
```

2. Criar `.env`:
```bash
cp .env.example .env
```

3. Ajustar valores de producao no `.env`:
- `NEXT_PUBLIC_APP_URL=https://simplethyzer.seudominio.com`
- `TRAEFIK_HOST=simplethyzer.seudominio.com`
- chaves Stripe de producao/teste conforme ambiente

4. Subir:
```bash
docker compose up -d --build
```

5. Verificar:
```bash
docker compose ps
docker logs apps-traefik-1 --since=5m | grep -Ei "simplethyzer|acme|letsencrypt|error"
```

## CI/CD (GitHub Actions -> VPS)

Workflow:
- `.github/workflows/deploy.yml`

Fluxo:
1. Trigger em `push` na `main` e PR mergeada na `main`
2. Executa `npm ci` + `npm run lint`
3. Se passar, conecta via SSH no VPS
4. Executa `git pull` + `docker compose up -d --build`

Secrets necessarios no GitHub:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY` (chave privada completa, multiline)
- `VPS_PORT` (opcional, default 22)

## Evitar conflitos de configuracao no servidor

Para nao quebrar deploy com mudancas locais:

1. Nunca editar `.env.example` no servidor
2. Manter segredos somente em `.env` (ja ignorado pelo git)
3. Se precisar override local de compose, criar `compose.server.yaml` no VPS
4. Rodar deploy com:
```bash
docker compose -f compose.yaml -f compose.server.yaml up -d --build
```

`compose.server.yaml` esta no `.gitignore`, entao nao sobe para o repositorio.

## Decisoes tecnicas

1. Estrutura por feature (`synth`, `billing`) para escalabilidade.
2. Engine de audio separada da UI para testabilidade.
3. Hook customizado para coordenar estado e efeitos de audio.
4. Plano Pro com desbloqueio real no engine (nao apenas visual).
5. Pipeline de deploy simples com validacao de lint antes de publicar.

## Pendencias conhecidas

- `proStore` em memoria e suficiente para demo, nao para alta disponibilidade.
- Em ambiente de producao robusto, usar persistencia externa (Redis/Postgres).
- Se credenciais forem expostas, revogar e gerar novas imediatamente.
