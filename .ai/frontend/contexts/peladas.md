# Context: Peladas (Jogos/Eventos)

## Objetivo

CRUD das "peladas" — o evento/jogo em si (data, local, quantidade de times, jogadores por time, goleiros).

## Arquivos envolvidos

- `src/views/AdminPeladasView.vue` — tela admin de CRUD.
- `src/views/PeladasListView.vue` (a partir de 2026-08-20) — equivalente **público** e somente leitura de `AdminPeladasView.vue`: mesma listagem/busca por data/paginação, sem form de criação nem coluna de ações; clicar numa linha navega pra `/peladas/:id` (`PeladaDetailView.vue`, já pública). Rota `/peladas` (sem `meta.requiresAuth`), listada no menu público (`SidebarComponent.vue`) e na barra inferior mobile.
- `src/services/peladaService.ts` — CRUD focado em pelada (`getAllPeladas`, `getPeladasByDate`, `getPelada`, `updatePelada`, `deletePelada`, `createPelada`). `getAllPeladas`/`getPeladasByDate` batem em rotas públicas (`/peladas`, `/peladas/date/{date}`) — por isso `PeladasListView.vue` reaproveita exatamente os mesmos métodos que `AdminPeladasView.vue` usa pra listar, sem precisar de endpoint novo.
- `src/services/adminService.ts` — também expõe `createPelada`/`updatePelada`/`deletePelada` (duplicado com `peladaService.ts` — ver "Pontos de atenção").
- `src/types/index.ts` — `Pelada`, `CreatePeladaRequest`.

## Modelo

`Pelada { id, date, division: 'quinta' | 'sabado', location, qtd_times, qtd_jogadores_por_time, qtd_goleiros }`.

Esses três campos numéricos (`qtd_times`, `qtd_jogadores_por_time`, `qtd_goleiros`) definem a "forma" da pelada e são usados depois pela organização de times (ver `.ai/frontend/contexts/teams.md`) para calcular quantos times/campos existem.

### `division` — obrigatória, derivada da data, não escolhida pelo usuário

O backend exige `division` (`required|in:quinta,sabado`) na criação e valida que ela bate com o dia da semana de `date` (quinta-feira → `quinta`, sábado → `sabado`) — qualquer outra combinação retorna 422. Como essa regra é 1:1 (não existe pelada de quinta com `division: sabado`), `AdminPeladasView.vue` **não** expõe um seletor: um `computed` (`divisionByDate`) calcula o valor a partir de `form.date.getDay()` e mostra um badge de confirmação ("Quinta-feira"/"Sábado") ou aviso de erro se a data não cair numa dessas duas — o botão "Criar pelada" fica desabilitado nesse caso. Se o backend um dia aceitar mais divisões, essa lógica de derivação (e a validação correspondente no backend) precisam mudar juntas.

## Fluxo

- Admin cria/edita/remove peladas em `AdminPeladasView`.
- `getPeladasByDate` trata 404 como lista vazia (`[]`) em vez de erro — comportamento intencional para buscas por data sem resultado.
- Uma pelada criada é o pré-requisito para: registrar estatísticas de partida (`match-players`) e organizar times (`teams`).
- Leitura (`GET /peladas`, `/peladas/:id`, `/peladas/date/:date`) é **pública** — não exige token. Só escrita (`POST/PUT/DELETE /admin/peladas...`) exige admin. Isso já causou um bug real: o frontend apontava as leituras para `/admin/peladas/...` (caminho antigo, removido num refactor do backend), o que quebrava silenciosamente a listagem — corrigido em `peladaService.ts`.

## Pontos de atenção

- **Duplicação de responsabilidade**: `PeladaService` e `AdminService` implementam os mesmos três métodos (`createPelada`, `updatePelada`, `deletePelada`) apontando para as mesmas rotas. Antes de "corrigir" isso removendo um dos dois, confirmar com o usuário qual é o service realmente usado pelas views atuais (checar imports em `AdminPeladasView.vue`) — remover o errado quebra a tela silenciosamente.
- Exclusão de pelada provavelmente cascade-deleta estatísticas associadas no backend — tratar como ação destrutiva, sempre confirmar com o usuário antes de implementar remoção sem diálogo de confirmação.
