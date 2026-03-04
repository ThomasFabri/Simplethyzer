# Arquitetura Simplethyzer

## Visao geral

```mermaid
flowchart LR
  subgraph Frontend
    UI[app/page.tsx]
    SH[useSynth]
    PH[useProPlan]
    SC[SynthControls]
    KB[Keyboard]
  end

  subgraph Audio
    ENG[synthEngine.ts]
  end

  subgraph Backend
    CS[/stripe/checkout-session]
    CF[/stripe/confirm]
    WB[/stripe/webhook]
    PS[/pro/status]
    CK[Pro Cookie Assinado]
    ST[proStore in-memory]
  end

  subgraph Stripe
    CH[Checkout Session]
    EV[Webhook Event]
  end

  UI --> SC
  UI --> KB
  UI --> SH
  UI --> PH
  SH --> ENG
  PH --> CS
  PH --> CF
  PH --> PS
  CS --> CH
  EV --> WB
  CH --> CF
  CF --> CK
  WB --> ST
  CK --> PS
  PS --> PH
```

## Fluxo do Plano Pro

1. Usuario clica em "Fazer upgrade".
2. Front chama `POST /api/stripe/checkout-session`.
3. Usuario paga no Stripe Checkout.
4. Retorno para `/?checkout=success&session_id=...`.
5. Front chama `POST /api/stripe/confirm`.
6. Backend valida sessao com Stripe e grava cookie Pro assinado.
7. Front chama `GET /api/pro/status`.
8. `useSynth` recebe `isPro=true` e habilita 2o oscilador.

## Fluxo de audio

1. `Keyboard` dispara `noteOn`/`noteOff`.
2. `useSynth` chama engine e atualiza estado de UI.
3. Engine cria cadeia:
   `Osc1 (+ Osc2 Pro) -> Low-pass -> Envelope ADSR -> Master Gain -> destination`.

## Riscos e proximos passos

- Persistencia de pagamentos em memoria deve migrar para banco/redis.
- Observabilidade: adicionar logs estruturados e monitoramento de erros.
- Testes E2E para checkout e onboarding Pro.
