# LEIA-ME — Regras do Frontend

Aplicável a toda alteração dentro de `src/`.

## Antes de codar

1. Releia `.ai/frontend/overview.md` para confirmar onde a mudança se encaixa (view, componente, store, service, composable).
2. Releia `.ai/frontend/coding-standards.md`.
3. Leia o context específico em `.ai/frontend/contexts/` da funcionalidade tocada (ver `.ai/feature-index.md`).

## Regras específicas do frontend

1. **Services só falam com a API** — nenhuma lógica de UI dentro de `src/services/*`. Toda a normalização de resposta (`response.data?.data ?? response.data`) já segue um padrão; mantenha-o ao criar métodos novos.
2. **Stores Pinia guardam estado compartilhado entre views** (ex.: `auth`, `rankings`). Estado local de uma única view fica no `<script setup>` da própria view, não em uma store nova.
3. **Autenticação e permissão de rota são resolvidas no `router/index.js`** (`requiresAuth`, `requiresAdmin`) — não duplique essa checagem dentro das views além do necessário para esconder/mostrar botões.
4. **Erros de API já são tratados globalmente** pelo interceptor em `services/api.ts` (toasts de 401/403/422/500). Não adicione tratamento de erro redundante nas views a menos que precise de uma ação específica além do toast.
5. **Todo texto visível ao usuário é em português (pt-BR).**
6. **Não crie uma pasta `backend/`** neste repositório — mudanças de backend pertencem a outro repositório.

## Ao alterar tipos (`src/types/index.ts`)

Esses tipos espelham o contrato da API Laravel. Alterar um tipo existente sem confirmar com o backend real pode quebrar o parsing de resposta silenciosamente (os serviços fazem cast implícito). Confirme com o usuário antes de alterar campos existentes; adicionar campos opcionais novos é mais seguro que remover ou renomear.
