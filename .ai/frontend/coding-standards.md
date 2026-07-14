# Padrões de Código — Vue 3 / TypeScript

## Componentes

- `<script setup lang="ts">` (Composition API) — não usar Options API em código novo.
- Nome de arquivo de view em PascalCase terminando em `View` (ex.: `AdminPlayersView.vue`); componentes reutilizáveis terminam em `Component` quando fizer sentido (ex.: `SidebarComponent.vue`), mas isso não é uma regra rígida — siga o padrão do arquivo mais próximo.
- Sem TypeScript em templates além do necessário; tipagem fica no `<script setup>`.

## Services (`src/services/*.ts`)

- Uma classe por recurso, métodos `static async`, nome terminando em `Service` (ex.: `PlayerService`, `AdminService`).
- Sempre importar a instância `api` de `./api` — nunca instanciar Axios direto em um service ou view.
- Padrão de retorno: `return (response as any).data?.data ?? response.data` — mantenha esse padrão em métodos novos para compatibilidade com o envelope de resposta do Laravel.
- Tratamento de 404 como "vazio"/`null` é feito localmente quando faz sentido de negócio (ex.: `PeladaService.getPeladasByDate`, `TeamService.getOrganizedTeams`) — outros erros devem propagar (`throw error`) para o interceptor global tratar.

## Stores (Pinia)

- Usar a API de composição: `defineStore('id', () => { ... return {...} })`, não a API de opções (`{ state, actions }`).
- Estado que precisa sobreviver a reload de página é persistido manualmente em `localStorage` (ver `stores/auth.ts`) — não introduzir uma lib de persistência nova sem discutir.

## Tipos (`src/types/index.ts`)

- Um arquivo único para todos os tipos que espelham a API. Não fragmentar em múltiplos arquivos sem necessidade.
- Requests e Responses são tipos explícitos e nomeados (`CreateXRequest`, `XResponse`), não `any` nem inline.

## Validação e formulários

- `useForm<T>` (composable genérico) centraliza estado de formulário + erros + loading; usar suas funções (`validateRequired`, `validateEmail`, `validatePassword`, `validate`) em vez de validar manualmente dentro da view.
- `utils/validation.ts` contém validadores standalone usados fora do contexto de formulário reativo (ex.: checagens pontuais). Regra de senha forte (8+ caracteres, maiúscula, minúscula, número, especial) já está implementada ali — reutilizar, não duplicar.
- Mensagens de erro/validação sempre em português, sem acentos nos textos internos de erro (padrão observado no código atual — mantenha consistência com o arquivo que está editando).

## Erros e feedback ao usuário

- `vue-toastification` é o único mecanismo de feedback de erro/sucesso. Erros de API 401/403/422/500 já dão toast automaticamente via interceptor (`services/api.ts`) — não duplicar toast para o mesmo erro na view.
- 401 já limpa `localStorage` e redireciona; não reimplementar esse fluxo em views.

## Estilo

- Bootstrap 5 (classes utilitárias + `btn-*`, `surface-card`, etc. definidos em `assets/styles`) é o sistema visual — não introduzir outro framework CSS (Tailwind, etc.) sem alinhar com o usuário.
- Ícones via `bootstrap-icons` (classe `bi bi-*`).

## Testes

- Vitest + `@vue/test-utils` + `@pinia/testing`. Ambiente `jsdom`.
- Testes ficam a par do que estão testando (ver `vitest.config.js` para paths); ao adicionar lógica de negócio nova em service/composable, adicionar/verificar teste correspondente.

## Import paths

- Usar alias `@/` para `src/` quando o arquivo já estiver em uma pasta profunda; imports relativos (`../services/api`) são aceitos e é o padrão atual predominante — não migrar em massa para `@/` sem pedido explícito.
