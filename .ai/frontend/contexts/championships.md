# Contexto — Campeonato

## Objetivo

O módulo de campeonato é independente das peladas existentes. Ele administra uma competição com cinco equipes, inscrições próprias, classificação por Pedra, primeira fase em turno único, eliminatórias, estatísticas, odds informativas, premiações e votação.

## Arquivos envolvidos

- `src/views/ChampionshipView.vue`: tela pública com classificação, partidas, odds, chaveamento, rankings, estatísticas e premiações.
- `src/views/AdminChampionshipView.vue`: painel administrativo de configuração e operação da competição.
- `src/services/championshipService.ts`: chamadas à API do campeonato e tipos das respostas.
- `src/router/index.js`: rotas `/campeonatos` e `/admin/championships`.
- `src/components/SidebarComponent.vue`: links públicos e administrativos.

## Fluxo administrativo

1. Criar o campeonato; a API cria as cinco equipes padrão e as quinze categorias de premiação.
2. Inscrever 25 jogadores de linha e cinco goleiros vindos do cadastro global. Cada jogador só pode ser inscrito uma vez; cada goleiro é vinculado a uma única equipe no cadastro.
3. Definir uma Pedra de cada grupo em cada equipe e editar nomes e brasões.
4. Gerar os dez confrontos da primeira fase e validar/iniciar a competição.
5. Marcar os participantes de cada partida, escolher o MVP, registrar gols, assistências e gols contra. O placar é recalculado pela API a partir dos eventos.
6. Calcular odds informativas, registrar desempates quando necessário e finalizar partidas. Eliminatórias empatadas exigem placares de pênaltis.
7. Gerar os playoffs após os dez jogos da fase de grupos, manter as categorias disponíveis para votação, encerrar todas as votações em uma única ação administrativa e publicar os resultados após a Grande Final.

## Regras de negócio

- São cinco equipes com cinco jogadores de linha e um goleiro cada.
- Cada equipe precisa ter exatamente uma inscrição de linha de cada Pedra (1 a 5).
- A vitória vale 3 pontos, empate 1 e derrota 0. O desempate segue pontos, vitórias, saldo, gols marcados, confronto direto e sorteio registrado.
- A classificação é congelada quando os playoffs são gerados.
- A segunda colocada enfrenta a quinta; a terceira enfrenta a quarta. Os vencedores jogam a Final dos Desafiantes contra o primeiro colocado na Grande Final.
- Pênaltis não entram na artilharia. Gol contra altera o placar para o adversário e não conta para o autor como gol.
- Assistências devem ser dadas por outro participante da mesma equipe do autor do gol. Apenas participantes da partida podem receber eventos ou MVP.
- Estatísticas consideram somente partidas finalizadas e válidas.
- Existem quinze premiações. Artilheiro e Garçom são automáticos; as outras categorias são votadas.
- Votação fica disponível até o administrador encerrar todas as categorias, exige conta autenticada vinculada a jogador inscrito, permite um voto por categoria, impede auto-voto e respeita a elegibilidade de goleiros/defensores. Resultados ficam ocultos até publicação.
- Odds são apenas informação esportiva e usam o modelo Poisson persistido pela API; não há apostas financeiras.

## Endpoints específicos

As rotas públicas começam em `/championships`. As operações administrativas começam em `/admin` e exigem usuário administrador. A votação usa `POST /championship-awards/:category/votes` e exige autenticação; o encerramento global usa `PUT /admin/championships/:championship/awards/voting-state`.

Não criar ou editar backend neste repositório. Se o contrato da API mudar, confirmar a mudança antes de alterar os serviços do frontend.

## Pontos de atenção

- O Laravel serializa relacionamentos em snake_case, por exemplo `home_team` e `away_team`.
- `home_score` e `away_score` devem refletir os eventos registrados; os inputs administrativos exibem o placar calculado e só permitem informar pênaltis quando a eliminatória termina empatada.
- O serviço usa `response.data` e aceita também o envelope `{ data: ... }`, pois as respostas do backend do campeonato são mistas.
