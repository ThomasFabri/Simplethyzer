# Simplethyzer

Synth web com Web Audio API, monetizacao via Stripe e deploy em Docker.

## Objetivo do projeto

Demonstrar capacidade de entregar produto full-stack:
- Frontend interativo de audio em tempo real
- Backend de pagamentos com Stripe
- Feature gating real (Plano Pro)
- Deploy em producao com reverse proxy TLS

## Stack

- Next.js 16 (App Router, TypeScript)
- Web Audio API
- Stripe API (checkout + webhook)
- Docker + Docker Compose
- Traefik (no servidor atual) para TLS e roteamento
- Vitest (testes unitarios basicos)

## Funcionalidades

- Oscilador principal com:
  - Waveform (`sine`, `square`, `sawtooth`, `triangle`)
  - ADSR (`attack`, `decay`, `sustain`, `release`)
  - Filtro low-pass
  - Volume
- Teclado de notas com ADSR por tecla (`noteOn` / `noteOff`)
- Plano Pro:
  - Checkout Stripe
  - Confirmacao de sessao paga
  - Cookie assinado de autorizacao
  - Segundo oscilador habilitado para usuarios Pro

## Arquitetura (alto nivel)

```mermaid
flowchart TD
  U[Usuario] --> UI[Next.js UI]
  UI --> S[useSynth Hook]
  S --> E[Synth Engine Web Audio]
  UI --> P[useProPlan Hook]
  P --> API1[/api/pro/status]
  P --> API2[/api/stripe/checkout-session]
  P --> API3[/api/stripe/confirm]
  Stripe[Stripe Checkout + Webhook] --> API4[/api/stripe/webhook]
  API3 --> C[Cookie Pro assinado]
  API4 --> M[Marcacao de sessao paga]
  C --> API1
  API1 --> P
  P --> S
  S --> E2[Oscilador 2 Pro]
```

Diagrama em arquivo separado: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Estrutura de pastas (resumo)

```txt
app/
  api/
    pro/status
    stripe/checkout-session
    stripe/confirm
    stripe/webhook
  features/
    synth/
      audio/
      components/
      hooks/
      types.ts
    billing/
      components/
      hooks/
      server/
```

## Variaveis de ambiente

Copie `.env.example` para `.env`:

- `NEXT_PUBLIC_APP_URL` (em producao: `https://seu-dominio`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `PRO_COOKIE_SECRET` (recomendado em producao)

## Rodando local

```bash
npm install
npm run dev
```

## Testes e qualidade

```bash
npm run lint
npm run test
npm run build
```

## Endpoints principais

- `POST /api/stripe/checkout-session`
- `POST /api/stripe/confirm`
- `POST /api/stripe/webhook`
- `GET /api/pro/status`

## Deploy (servidor atual com Traefik)

No servidor atual, as portas `80/443` ja sao gerenciadas por Traefik global.
Por isso, o `compose.yaml` deste projeto sobe apenas o `app` com labels Traefik.

Passos:

1. Clonar projeto no servidor
2. Configurar `.env`
3. Subir:

```bash
docker compose up -d --build
```

4. Verificar:

```bash
docker compose ps
docker logs apps-traefik-1 --since=5m | grep -Ei "simplethyzer|acme|letsencrypt|error"
```

## CI/CD simples (GitHub Actions -> VPS)

Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

Comportamento:
- Roda `npm ci` + `npm run lint`
- Se passar, conecta via SSH no VPS
- Executa `git pull` e `docker compose up -d --build`

Secrets necessarios no GitHub (Repository Secrets):
- `VPS_HOST` (IP ou dominio do servidor)
- `VPS_USER` (ex.: `root` ou usuario de deploy)
- `VPS_SSH_KEY` (chave privada SSH em formato PEM/OpenSSH)
- `VPS_PORT` (opcional, default 22)

Script executado no servidor:
- [scripts/deploy.sh](scripts/deploy.sh)

## Decisoes tecnicas

1. **Feature-first structure**
   - Separacao por dominio (`synth`, `billing`) facilita evolucao e defesa tecnica.
2. **Audio engine desacoplado da UI**
   - Web Audio em modulo dedicado + hook `useSynth` para coordenar estado da interface.
3. **Monetizacao com desbloqueio real**
   - Pro nao e apenas visual; segundo oscilador depende de status de plano confirmado.
4. **Cookie assinado para status Pro**
   - Evita confiar apenas em estado client-side.
5. **Deploy conteinerizado**
   - Entrega reproduzivel em VPS e padrao de mercado.

## Justificativa de uso de IA

IA foi usada para acelerar:
- ideacao de arquitetura inicial
- checklist de entregas por dia
- refinamentos de copy/documentacao

Nao foi usada para substituir validacao tecnica:
- logica de audio, fluxo de pagamento e deploy foram criados e testados manualmente
- lint/test/build executados a cada etapa
- bugs de infraestrutura (TLS, rede e proxy) foram tratados via diagnostico real

## Pendencias conhecidas

- Sessao paga atualmente persistida em memoria no processo (`proStore`): suficiente para demo, nao para alta disponibilidade.
- Producao robusta pede persistencia externa (Redis/Postgres) para eventos de pagamento.
- Se credenciais forem expostas, revogar e gerar novas imediatamente.
