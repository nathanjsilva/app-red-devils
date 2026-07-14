# Red Devils — Sistema de Estatísticas de Futebol

Frontend (SPA) para gerenciar peladas (partidas amadoras de futebol), jogadores, estatísticas por partida, organização de times e rankings/gráficos da temporada.

Este repositório é **só o frontend**. O backend (Laravel + Sanctum) vive em outro repositório (`api-red-devils`) e é consumido via API REST — ver `.ai/project-context.md` para o contrato completo de endpoints.

## 🚀 Tecnologias

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript**
- **Pinia** — estado (`auth`, `rankings`)
- **Vue Router 4**
- **Bootstrap 5** + Bootstrap Icons — sistema visual base
- **Chart.js** + **vue-chartjs** — gráficos da página `/estatisticas`
- **Axios** — cliente HTTP
- **vue-toastification** — feedback de erro/sucesso
- **Vite** — build e dev server

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── SidebarComponent.vue   # Navegação: sidebar (desktop) + barra de abas fixa (mobile)
│   └── charts/                 # Wrappers vue-chartjs (linha, barras, radar)
├── views/                      # Páginas roteadas (1 por rota)
├── stores/                     # Pinia: auth.ts, rankings.ts
├── services/                   # 1 classe por recurso da API (métodos static async)
├── composables/                 # useAuth, useForm, useResponsive, useSEO
├── utils/                       # constants.ts, validation.ts, chartSetup.ts
├── types/                       # Contratos TypeScript espelhando a API Laravel
├── assets/                      # 1 CSS por página + estilos globais, logo
└── router/index.js              # Rotas + guards de auth/admin
```

## 🗺️ Páginas

| Rota | Acesso | Descrição |
|---|---|---|
| `/home` | Público | Dashboard com os 5 rankings da temporada |
| `/players-overview` | Público | Tabela paginada de estatísticas por jogador |
| `/estatisticas` | Público | KPIs da temporada, evolução mensal, rankings em gráfico de barras, comparador de jogadores (radar) |
| `/login` | Público | Login de administrador |
| `/admin/players` | Admin | Cadastro de jogadores |
| `/admin/peladas` | Admin | Cadastro de peladas |
| `/admin/match-players` | Admin | Lançamento de estatísticas por partida |
| `/admin/organize-teams` | Admin | Organização manual de times por pelada |

## 🛠️ Instalação e uso

```bash
npm install
npm run dev        # http://localhost:3000
npm run build       # build de produção em dist/
npm run preview     # servir o build localmente
```

Não há tokens de ambiente (`.env`) hoje — `API_BASE_URL` fica hardcoded em `src/utils/constants.ts`. **Confira esse valor antes de buildar**: durante desenvolvimento local ele pode estar apontando para `http://localhost/api` (API rodando via Docker); em produção precisa apontar para a URL real do backend.

## 🧪 Testes

O projeto usa **Vitest** + **Vue Test Utils** (`npm run test`, `npm run test:ui`, `npm run test:coverage`), mas hoje **não há testes escritos** em `src/` — a suíte está configurada (`vitest.config.js`) e pronta para receber testes, sem cobertura ainda.

## 🎨 Design system

- Paleta ancorada em vermelho (`--red-devils` e derivados, `src/assets/global.css`) + gradientes escuros — mantida deliberadamente em todo o app.
- Mobile-first: sidebar completa só no desktop (≥1024px); em telas menores a navegação principal é uma barra de abas fixa no rodapé.
- Tabelas de dados usam um sistema único (`.data-table`, `global.css`) que vira lista de cards empilhados em telas ≤640px (`.stack-mobile`), em vez de rolagem horizontal.
- Gráficos (`components/charts/`) seguem a mesma paleta vermelha + tons de apoio neutros.

## 📄 Documentação para IA / onboarding

Antes de alterar qualquer coisa neste repositório, leia `CLAUDE.md` (raiz) e os arquivos em `.ai/` — regras do projeto, contexto de cada funcionalidade e o contrato de endpoints consumidos da API.

## 📄 Licença

Este projeto está sob a licença MIT.
