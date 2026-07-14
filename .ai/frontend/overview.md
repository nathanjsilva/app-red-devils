# Visão Geral do Frontend

## Estrutura de pastas (`src/`)

```
src/
├── components/       # Componentes reutilizáveis (ex.: SidebarComponent.vue)
├── views/            # Páginas roteadas (uma por rota em router/index.js)
├── stores/           # Pinia: auth.ts, rankings.ts
├── services/         # Cliente API + services por recurso (classes estáticas)
├── composables/       # useAuth, useForm, useResponsive, useSEO
├── utils/             # constants.ts (config/enums), validation.ts
├── types/             # Contratos TypeScript espelhando a API Laravel
├── assets/            # Estilos, logo
├── router/index.js    # Rotas + guards de auth/admin
├── App.vue            # Root: monta SidebarComponent + router-view
└── main.js            # Bootstrap: Pinia, Router, Toast, Bootstrap CSS/Icons
```

## Roteamento (`router/index.js`)

- `/` redireciona para `/home`.
- `/login`, `/players-overview`, `/home` — acesso público.
- `/admin/players`, `/admin/peladas`, `/admin/match-players`, `/admin/organize-teams` — `meta: { requiresAuth: true, requiresAdmin: true }`.
- Guard global (`router.beforeEach`) lê token/usuário do `localStorage` (via `STORAGE_KEYS`), valida `user.profile === 'admin'` para rotas admin.
- **Atenção**: o guard funciona pelo estado salvo em `localStorage`, não pela store Pinia diretamente — se alterar o formato salvo em `stores/auth.ts`, o guard também deve ser atualizado.

## Views e responsabilidade

| View | Rota | Papel |
|---|---|---|
| `LoginView.vue` | `/login` | Formulário de login |
| `HomeView.vue` | `/home` | Dashboard público com resumo de rankings |
| `PlayersOverviewView.vue` | `/players-overview` | Visão geral pública de estatísticas por jogador |
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

`App.vue` monta `SidebarComponent.vue` (navegação + toggle mobile) e `<router-view>`. O menu do sidebar é dirigido por um array de itens (`MenuItem`), provavelmente filtrado por perfil — confirmar em `SidebarComponent.vue` antes de adicionar itens de menu novos.
