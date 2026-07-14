# CLAUDE.md — Red Devils (Sistema de Estatísticas de Futebol)

## LEITURA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO

Esta instrução se aplica a **todo e qualquer pedido** feito no chat ou no terminal — sem exceção.

Antes de criar, alterar, remover, mover ou refatorar qualquer arquivo, leia os arquivos abaixo na ordem indicada.

Este repositório contém **apenas o frontend** (Vue 3 + TypeScript). O backend (Laravel + Sanctum) vive em outro repositório e é consumido via API HTTP — não crie nem edite código de backend aqui.

---

### Sempre — toda ação neste repositório

| # | Arquivo | Por quê |
|---|---------|---------|
| 1 | `.ai/ai-rules.md` | Regras gerais e ordem de prioridade |
| 2 | `.ai/project-context.md` | Stack, modelos de dados, endpoints consumidos |
| 3 | `.ai/feature-index.md` | Índice de funcionalidades e caminhos dos contexts |
| 4 | `.ai/frontend/LEIA-ME.md` | Regras obrigatórias específicas do frontend |
| 5 | `.ai/frontend/overview.md` | Estrutura, componentes, stores, roteamento |
| 6 | `.ai/frontend/coding-standards.md` | Padrões de código Vue 3 / TypeScript / Bootstrap |
| 7 | Context da funcionalidade em `.ai/frontend/contexts/` | Fluxos, regras de negócio, arquivos envolvidos |

---

## REGRAS OBRIGATÓRIAS

1. **Explique antes de executar** — informe o que será feito, o objetivo, os arquivos que serão alterados e os impactos.
2. **Sempre pergunte:** _"Deseja que eu execute esta alteração?"_ — nunca assuma autorização.
3. **Nunca altere regra de negócio, apague, mova ou renomeie arquivos sem autorização explícita.**
4. **Nunca altere o contrato com a API** (rotas, payloads, formato de resposta) sem confirmar — o backend é um repositório separado e mudanças aqui podem quebrar a integração silenciosamente.
5. **Após qualquer alteração**, apresente resumo com: arquivos modificados, funcionalidades afetadas e próximos passos sugeridos.

---

## Estrutura de Contexto

```
.ai/
├── frontend/                ← regras e contextos do frontend (Vue 3 / TS / Pinia / Bootstrap)
│   ├── LEIA-ME.md
│   ├── overview.md
│   ├── coding-standards.md
│   └── contexts/
│       ├── auth.md
│       ├── players.md
│       ├── peladas.md
│       ├── match-players.md
│       ├── teams.md
│       └── rankings.md
├── ai-rules.md              ← regras gerais e ordem de prioridade
├── project-context.md       ← contexto geral, stack, modelos, endpoints
└── feature-index.md         ← índice de todas as funcionalidades
```
