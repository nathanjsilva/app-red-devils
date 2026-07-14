# Visão Geral do Frontend

## Estrutura de pastas (`src/`)

```
src/
├── components/
│   ├── SidebarComponent.vue  # Sidebar (desktop) + barra de abas fixa (mobile/tablet)
│   └── charts/                # Wrappers vue-chartjs: EvolutionChart, RankingBarChart, ComparisonRadarChart
├── views/            # Páginas roteadas (uma por rota em router/index.js)
├── stores/           # Pinia: auth.ts, rankings.ts
├── services/         # Cliente API + services por recurso (classes estáticas)
├── composables/       # useAuth, useForm, useResponsive, useSEO
├── utils/             # constants.ts (config/enums), validation.ts, chartSetup.ts (registro Chart.js)
├── types/             # Contratos TypeScript espelhando a API Laravel
├── assets/            # Estilos (1 css por página, importados em main.js), logo
├── router/index.js    # Rotas + guards de auth/admin
├── App.vue            # Root: monta SidebarComponent + router-view
└── main.js            # Bootstrap: Pinia, Router, Toast, Bootstrap CSS/Icons, Chart.js
```

## Roteamento (`router/index.js`)

- `/` redireciona para `/home`.
- `/login`, `/players-overview`, `/home`, `/estatisticas` — acesso público.
- `/admin/players`, `/admin/peladas`, `/admin/match-players`, `/admin/organize-teams` — `meta: { requiresAuth: true, requiresAdmin: true }`.
- Guard global (`router.beforeEach`) lê token/usuário do `localStorage` (via `STORAGE_KEYS`), valida `user.profile === 'admin'` para rotas admin.
- **Atenção**: o guard funciona pelo estado salvo em `localStorage`, não pela store Pinia diretamente — se alterar o formato salvo em `stores/auth.ts`, o guard também deve ser atualizado.

## Views e responsabilidade

| View | Rota | Papel |
|---|---|---|
| `LoginView.vue` | `/login` | Formulário de login |
| `HomeView.vue` | `/home` | Dashboard público com resumo de rankings |
| `PlayersOverviewView.vue` | `/players-overview` | Visão geral pública de estatísticas por jogador |
| `StatisticsView.vue` | `/estatisticas` | Central de estatísticas pública: KPIs da temporada, evolução (gráfico de linha), rankings em gráfico de barras por categoria, comparador de jogadores (radar) |
| `AdminPlayersView.vue` | `/admin/players` | CRUD de jogadores (admin) |
| `AdminPeladasView.vue` | `/admin/peladas` | CRUD de peladas/jogos (admin) |
| `AdminMatchPlayersView.vue` | `/admin/match-players` | Registro de estatísticas por jogador/pelada (admin) |
| `AdminOrganizeTeamsView.vue` | `/admin/organize-teams` | Organização de times por pelada (admin) |

## Stores (Pinia, Composition API style — `defineStore(id, () => {...})`)

- **auth** (`stores/auth.ts`): `user`, `token`, `isAuthenticated`, `login`, `logout`, `initializeAuth`, `updateUser`. Persiste em `localStorage`.
- **rankings** (`stores/rankings.ts`): estado dos rankings usados no dashboard.

## Services

Classes estáticas, um método por chamada de API, sempre via instância `api` (`services/api.ts`, Axios com interceptors de auth e tratamento global de erro). Ver tabela completa de endpoints em `.ai/project-context.md`.

## Composables

- `useAuth`: wrapper de conveniência sobre a store `auth`.
- `useForm`: helpers de estado/validação de formulário.
- `useResponsive`: detecção mobile/desktop (usado no `SidebarComponent`).
- `useSEO`: gerenciamento de meta tags por view.

## Layout

`App.vue` monta `SidebarComponent.vue` e `<router-view>`. O menu é um array de `MenuItem` (computed em `SidebarComponent.vue`), com itens extras adicionados quando `user.profile === 'admin'` — confirmar ali antes de adicionar itens de menu novos.

**Navegação responsiva (mobile-first)**: `useResponsive().isDesktop` (breakpoint 1024px) decide o padrão:
- **Desktop**: sidebar fixa lateral, sempre visível, com o menu completo + botão de logout.
- **Mobile/tablet**: sidebar vira um drawer (overlay, fora da tela por padrão) e a navegação principal passa a ser uma **barra de abas fixa no rodapé** (`.bottom-tab-bar`): Home, Jogadores, Estatísticas, e um 4º botão que é "Mais" (abre o drawer com o menu completo + logout, se autenticado) ou "Entrar" (link pra `/login`, se visitante). `app-main` ganha padding inferior (`--bottom-nav-height`) pra não ficar atrás da barra.
