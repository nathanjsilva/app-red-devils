# Context: Peladas (Jogos/Eventos)

## Objetivo

CRUD das "peladas" — o evento/jogo em si (data, local, quantidade de times, jogadores por time, goleiros).

## Arquivos envolvidos

- `src/views/AdminPeladasView.vue` — tela admin de CRUD.
- `src/services/peladaService.ts` — CRUD focado em pelada (`getAllPeladas`, `getPeladasByDate`, `getPelada`, `updatePelada`, `deletePelada`, `createPelada`).
- `src/services/adminService.ts` — também expõe `createPelada`/`updatePelada`/`deletePelada` (duplicado com `peladaService.ts` — ver "Pontos de atenção").
- `src/types/index.ts` — `Pelada`, `CreatePeladaRequest`.

## Modelo

`Pelada { id, date, location, qtd_times, qtd_jogadores_por_time, qtd_goleiros }`.

Esses três campos numéricos (`qtd_times`, `qtd_jogadores_por_time`, `qtd_goleiros`) definem a "forma" da pelada e são usados depois pela organização de times (ver `.ai/frontend/contexts/teams.md`) para calcular quantos times/campos existem.

## Fluxo

- Admin cria/edita/remove peladas em `AdminPeladasView`.
- `getPeladasByDate` trata 404 como lista vazia (`[]`) em vez de erro — comportamento intencional para buscas por data sem resultado.
- Uma pelada criada é o pré-requisito para: registrar estatísticas de partida (`match-players`) e organizar times (`teams`).

## Pontos de atenção

- **Duplicação de responsabilidade**: `PeladaService` e `AdminService` implementam os mesmos três métodos (`createPelada`, `updatePelada`, `deletePelada`) apontando para as mesmas rotas. Antes de "corrigir" isso removendo um dos dois, confirmar com o usuário qual é o service realmente usado pelas views atuais (checar imports em `AdminPeladasView.vue`) — remover o errado quebra a tela silenciosamente.
- Exclusão de pelada provavelmente cascade-deleta estatísticas associadas no backend — tratar como ação destrutiva, sempre confirmar com o usuário antes de implementar remoção sem diálogo de confirmação.
