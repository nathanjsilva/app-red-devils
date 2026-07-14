# Context: Autenticação e Permissões

## Objetivo

Login de usuário, persistência de sessão, e controle de acesso admin/comum nas rotas.

## Arquivos envolvidos

- `src/views/LoginView.vue` — formulário de login.
- `src/stores/auth.ts` — estado (`user`, `token`, `isAuthenticated`), ações (`login`, `logout`, `initializeAuth`, `updateUser`).
- `src/services/authService.ts` — `POST /login`, `GET /admin/me`, `POST /admin/logout`.
- `src/composables/useAuth.ts` — wrapper de conveniência sobre a store.
- `src/router/index.js` — guard global de rota.
- `src/utils/constants.ts` — `STORAGE_KEYS` (`token`, `user`).

## Fluxo

1. `LoginView` chama `authStore.login({ username, password })`.
2. `AuthService.login` faz `POST /login`, retorna `{ access_token, token_type, user }`.
3. Store monta `token = "${token_type} ${access_token}"`, salva em `localStorage` (`token`, `user`).
4. Store tenta atualizar o usuário com `GET /admin/me` (não bloqueia o login se falhar — só loga warning).
5. No boot da app, `initializeAuth()` lê `localStorage` e tenta revalidar via `GET /admin/me`; se falhar, faz logout local.
6. Guard de rota (`router.beforeEach`) lê **diretamente do `localStorage`** (não da store) se a rota tem `requiresAuth`/`requiresAdmin`. Verifica `user.profile === 'admin'` para rotas admin.

## Regras de negócio

- Perfis válidos: `admin` e `common` (campo `User.profile`).
- Só rotas com `meta.requiresAdmin` checam perfil; rotas com só `meta.requiresAuth` aceitam qualquer usuário autenticado.
- Token é sempre prefixado com o `token_type` retornado pela API (default `Bearer`) antes de ir no header `Authorization` (ver interceptor em `services/api.ts`).
- 401 em qualquer chamada limpa a sessão e força redirect (tratado globalmente, não aqui).

## Pontos de atenção

- **Duplicação de fonte de verdade**: o guard de rota lê `localStorage` diretamente, enquanto a store Pinia é a fonte "oficial" durante a sessão da SPA. Se mudar o formato salvo em `stores/auth.ts` (chaves, shape do `user`), o guard em `router/index.js` precisa ser atualizado junto — são dois lugares acoplados.
- `initializeAuth` engole erros de revalidação (`try/catch` com `console.warn`) — uma falha de rede não derruba a sessão, só a mantém sem revalidar. Ao debugar "sessão não atualiza", olhar aqui primeiro.
- Não há fluxo de "esqueci minha senha" nem "cadastro público de admin" implementado nas rotas atuais (`router/index.js` não tem `/setup-admin` nem `/register`) — se o `TUTORIAL_COMPLETO.md` mencionar essas telas, elas podem estar desatualizadas ou ter sido removidas; confirmar com o usuário antes de assumir que existem.
