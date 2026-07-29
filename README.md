# Quick Capture

> Capture an idea, a task, or schedule a commitment in seconds — without opening five different apps to do it.

**Live app:** https://dashboard-captureinsight.netlify.app

---

## 🌐 Language / Idioma

This document is written in both Portuguese and English. Click a section below to expand it.

<details open>
<summary><strong>🇧🇷 Português</strong></summary>

## Sobre o projeto

Quick Capture nasceu de um problema simples e comum: pessoas com rotina agitada — desenvolvedores, empreendedores, quem automatiza processos no dia a dia — vivem tendo ideias, tarefas ou compromissos de última hora e não têm tempo (nem paciência) de abrir um app de notas, depois o calendário, depois o Telegram, pra organizar tudo em três lugares diferentes.

A proposta é reduzir isso a um único gesto: abre o dashboard, escreve o insight, escolhe a categoria, e — se for o caso — marca data e horário. O resto é automático.

Não é um gerenciador de tarefas completo. É deliberadamente minimalista: um único campo de texto, uma categoria, e um agendamento opcional. A ideia é que o atrito de registrar algo seja menor que o risco de esquecer.

## Como funciona

1. O usuário preenche o formulário no dashboard (texto, categoria, e opcionalmente data/hora de início e término).
2. O frontend envia esse payload via `POST` para um webhook do n8n.
3. O n8n valida os dados (texto obrigatório, categoria reconhecida), roteia pela categoria escolhida, e:
   - Envia sempre uma notificação pro Telegram confirmando o registro.
   - Se houver agendamento, cria um evento no Google Calendar e envia uma segunda mensagem de confirmação com data/hora formatada.
4. O dashboard mostra um toast de sucesso (ou erro, com mensagem clara) — sem alerts nativos do navegador.

Categorias disponíveis: **Desenvolvimento**, **Automação**, **Empreendedorismo** e **Pessoal** — todas com o mesmo comportamento, incluindo agendamento opcional.

## Arquitetura

```
┌──────────────────┐      HTTPS POST       ┌───────────────────┐
│   Dashboard       │ ────────────────────▶ │   Webhook (n8n)     │
│  (Netlify,        │                        │  valida payload     │
│   HTML/JS/Bootstrap)│ ◀──────────────────── │  roteia por categoria│
└──────────────────┘      JSON response     └─────────┬──────────┘
                                                        │
                                       ┌────────────────┼────────────────┐
                                       ▼                                 ▼
                              ┌─────────────────┐              ┌──────────────────┐
                              │  Telegram Bot API │              │ Google Calendar API│
                              │  (notificação)     │              │  (se houver agenda) │
                              └─────────────────┘              └──────────────────┘
```

A automação roda numa instância self-hosted do n8n (Docker + Traefik), com rate limiting configurado no proxy reverso e validação de payload em múltiplas camadas antes de qualquer chamada externa.

## Stack técnica

- **Frontend**: HTML5, JavaScript vanilla (Fetch API), Bootstrap 5, Bootstrap Icons
- **Hospedagem do frontend**: Netlify
- **Automação/backend**: n8n (self-hosted, Docker + Traefik)
- **Integrações**: Telegram Bot API, Google Calendar API (OAuth2)
- **Infraestrutura**: VPS Hostinger, rate limiting via Traefik middleware

## Estrutura do projeto

```
quick-capture/
├── frontend/
│   ├── index.html      # Interface do dashboard
│   └── script.js        # Lógica de submissão e feedback visual
├── n8n/
│   └── quick-capture-workflow.json   # Export do workflow de automação
└── README.md
```

## Segurança e validação

- CORS restrito à origem de produção do dashboard.
- Validação de payload em múltiplas camadas (texto obrigatório, categoria reconhecida, datas consistentes) antes de qualquer chamada às APIs externas.
- Resposta síncrona estruturada (`{"success": boolean, "error"?: string}`), sem depender do modo "responde antes de processar".
- Rate limiting no proxy reverso (Traefik) especificamente no endpoint do webhook, para conter abuso de volume.
- Timezone tratado via parsing real (Luxon) em vez de concatenação de string, evitando datas inválidas.

## Ferramentas utilizadas no desenvolvimento

Esse projeto foi construído com apoio de três ferramentas de IA, cada uma numa frente diferente:

- **Antigravity**: usado para desenvolver toda a interface (frontend) — HTML, CSS e a lógica de submissão em JavaScript.
- **n8n**: usado tanto como motor de automação em produção quanto como ambiente de desenvolvimento da integração com as APIs (Telegram e Google Calendar).
- **Claude (modo Workspace/Cowork)**: usado para conectar as pontas — auditar o fluxo ponta a ponta, entender e corrigir a lógica entre frontend e backend, e atuar como par técnico ao longo do desenvolvimento, incluindo diagnóstico de falhas e ajustes de segurança.

O uso dessas ferramentas seguiu princípios de uso ético e de segurança da informação: nenhuma credencial, token ou segredo foi exposto durante o processo, e as decisões de arquitetura (validação de payload, CORS, rate limiting) foram tomadas com o objetivo de proteger o serviço contra abuso, preservando ao mesmo tempo a simplicidade do produto final.

</details>

<details>
<summary><strong>🇺🇸 English</strong></summary>

## About the project

Quick Capture was born from a simple, common problem: people with a busy routine — developers, entrepreneurs, anyone who automates their day-to-day — constantly have ideas, tasks, or last-minute commitments, and don't have the time (or patience) to open a notes app, then a calendar, then Telegram, just to organize everything across three different places.

The idea is to reduce all of that to a single gesture: open the dashboard, write the insight, pick a category, and — if it applies — set a date and time. Everything else happens automatically.

It's not a full task manager. It's deliberately minimal: a single text field, a category, and optional scheduling. The goal is for the friction of capturing something to be lower than the risk of forgetting it.

## How it works

1. The user fills out the form on the dashboard (text, category, and optionally a start/end date and time).
2. The frontend sends this payload via `POST` to an n8n webhook.
3. n8n validates the data (text is required, category must be recognized), routes based on the chosen category, and:
   - Always sends a Telegram notification confirming the capture.
   - If scheduling was provided, creates a Google Calendar event and sends a second confirmation message with the formatted date/time.
4. The dashboard shows a success toast (or an error toast with a clear message) — no native browser alerts involved.

Available categories: **Desenvolvimento** (Development), **Automação** (Automation), **Empreendedorismo** (Entrepreneurship), and **Pessoal** (Personal) — all sharing the same behavior, including optional scheduling.

## Architecture

```
┌──────────────────┐      HTTPS POST       ┌───────────────────┐
│    Dashboard       │ ────────────────────▶ │   Webhook (n8n)     │
│  (Netlify,          │                        │  validates payload   │
│   HTML/JS/Bootstrap)│ ◀──────────────────── │  routes by category   │
└──────────────────┘      JSON response     └─────────┬──────────┘
                                                        │
                                       ┌────────────────┼────────────────┐
                                       ▼                                 ▼
                              ┌─────────────────┐              ┌──────────────────┐
                              │  Telegram Bot API │              │ Google Calendar API│
                              │  (notification)     │              │  (when scheduled)    │
                              └─────────────────┘              └──────────────────┘
```

The automation runs on a self-hosted n8n instance (Docker + Traefik), with rate limiting configured at the reverse proxy level and multi-layer payload validation before any external API call.

## Tech stack

- **Frontend**: HTML5, vanilla JavaScript (Fetch API), Bootstrap 5, Bootstrap Icons
- **Frontend hosting**: Netlify
- **Automation/backend**: n8n (self-hosted, Docker + Traefik)
- **Integrations**: Telegram Bot API, Google Calendar API (OAuth2)
- **Infrastructure**: Hostinger VPS, rate limiting via Traefik middleware

## Project structure

```
quick-capture/
├── frontend/
│   ├── index.html      # Dashboard interface
│   └── script.js        # Submission logic and visual feedback
├── n8n/
│   └── quick-capture-workflow.json   # Automation workflow export
└── README.md
```

## Security and validation

- CORS restricted to the dashboard's production origin.
- Multi-layer payload validation (required text, recognized category, consistent dates) before any call to external APIs.
- Structured synchronous response (`{"success": boolean, "error"?: string}`), instead of relying on a "respond before processing" mode.
- Rate limiting at the reverse proxy (Traefik), scoped specifically to the webhook endpoint, to contain volume abuse.
- Timezone handled through real parsing (Luxon) instead of string concatenation, avoiding invalid dates.

## Tools used in development

This project was built with the support of three AI tools, each covering a different front:

- **Antigravity**: used to develop the entire interface (frontend) — HTML, CSS, and the JavaScript submission logic.
- **n8n**: used both as the production automation engine and as the development environment for the API integrations (Telegram and Google Calendar).
- **Claude (Workspace/Cowork mode)**: used to connect the pieces — auditing the end-to-end flow, understanding and fixing the logic between frontend and backend, and acting as a technical pair throughout development, including failure diagnosis and security adjustments.

The use of these tools followed principles of ethical use and information security: no credential, token, or secret was ever exposed during the process, and architectural decisions (payload validation, CORS, rate limiting) were made with the goal of protecting the service against abuse while preserving the simplicity of the final product.

</details>

---

<sub>Built for people who have five seconds to spare, not five minutes.</sub>
