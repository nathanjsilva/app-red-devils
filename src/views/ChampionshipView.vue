<template>
  <section class="page-shell championship-page">
    <header class="page-header championship-header">
      <div class="championship-heading">
        <span class="eyebrow">Campeonato</span>
        <div class="title-row">
          <h1 class="page-title">{{ details?.championship.name || 'Campeonatos' }}</h1>
          <span v-if="details" class="pill-badge" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <p v-if="details" class="page-subtitle championship-phase">
          <i class="bi bi-broadcast-pin" aria-hidden="true"></i>
          {{ phaseLabel(details.championship.phase) }}
          <span class="header-separator">•</span>
          {{ details.standings.length }} equipes acompanhadas
        </p>
      </div>
      <label v-if="championships.length" class="championship-picker">
        <span>Temporada</span>
        <select v-model="selectedId" class="form-select" @change="loadDetails">
          <option v-for="item in championships" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
    </header>

    <div v-if="isLoading" class="surface-card state-card" role="status"><i class="bi bi-arrow-repeat spin" aria-hidden="true"></i><span>Carregando campeonato...</span></div>
    <div v-else-if="loadError" class="surface-card state-card state-card--error" role="alert"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><span>{{ loadError }}</span><button type="button" class="btn btn-outline-secondary btn-sm" @click="loadDetails">Tentar novamente</button></div>
    <div v-else-if="!details" class="surface-card state-card empty-state"><i class="bi bi-trophy" aria-hidden="true"></i><h2>Nenhum campeonato cadastrado</h2><p>O painel público será preenchido depois que um administrador criar o primeiro campeonato.</p></div>

    <template v-else>
      <nav class="championship-tabs" aria-label="Seções do campeonato" role="tablist">
        <button v-for="tab in publicTabs" :key="tab.id" type="button" class="championship-tab" :class="{ active: publicTab === tab.id }" role="tab" :aria-selected="publicTab === tab.id" @click="publicTab = tab.id">
          <i :class="tab.icon" aria-hidden="true"></i><span>{{ tab.label }}</span><small>{{ tab.meta }}</small>
        </button>
      </nav>

      <section v-if="publicTab === 'overview'" class="championship-section" role="tabpanel">
        <article v-if="details.champion" class="surface-card champion-banner">
          <div class="team-crest team-crest--winner">
            <img v-if="details.champion.crest_url" :src="details.champion.crest_url" :alt="'Brasão do ' + details.champion.name">
            <span v-else>{{ initials(details.champion.name) }}</span>
          </div>
          <div class="champion-copy"><span class="eyebrow">Campeão</span><h2>{{ details.champion.name }}</h2><p>Grande Final concluída</p><small v-if="details.champion.campaign">{{ details.champion.campaign.points }} pontos <span>•</span> {{ details.champion.campaign.wins }} vitórias <span>•</span> saldo {{ details.champion.campaign.goal_difference }}</small></div>
          <i class="bi bi-trophy-fill champion-icon" aria-hidden="true"></i>
        </article>

        <section class="championship-team-grid" aria-label="Equipes participantes">
          <button v-for="team in details.championship.teams" :key="team.id" type="button" class="surface-card team-card team-card--interactive" :aria-label="'Abrir detalhes do time ' + team.name" @click="openChampionshipTeam(team)">
            <div class="team-crest"><img v-if="team.crest_url" :src="team.crest_url" :alt="'Brasão do ' + team.name"><span v-else>{{ initials(team.name) }}</span></div>
            <div class="team-card-copy"><strong>{{ team.name }}</strong><span>{{ team.players?.length || 0 }} participantes</span></div><i class="bi bi-chevron-right team-card-arrow" aria-hidden="true"></i>
          </button>
        </section>

        <article class="surface-card panel-card standings-card">
          <div class="section-toolbar"><div><span class="eyebrow">Fase atual</span><h2 class="section-title mb-0">Classificação</h2></div><span class="section-context"><i class="bi bi-arrow-down-up" aria-hidden="true"></i> Arraste para ver todas as colunas</span></div>
          <div class="table-wrap standings-table-wrap">
            <table class="data-table standings-table">
              <thead><tr><th class="sticky-col sticky-position">#</th><th class="sticky-col sticky-team">Equipe</th><th class="points-col">Pts</th><th>PJ</th><th>VIT</th><th>E</th><th>DER</th><th>GM</th><th>GC</th><th>SG</th><th>Últimas 5</th></tr></thead>
              <tbody>
                <tr v-for="row in details.standings" :key="row.team_id" :class="{ 'standings-leader': row.position === 1, 'standings-qualified': row.position <= 4 }">
                  <td class="sticky-col sticky-position position-cell"><strong>{{ row.position }}</strong></td>
                  <td class="sticky-col sticky-team team-cell"><button type="button" class="standing-team-button" :aria-label="'Abrir detalhes do time ' + row.name" @click="openChampionshipTeamById(row.team_id)"><div class="standing-team"><div class="team-crest team-crest--table"><img v-if="teamForStanding(row.team_id)?.crest_url" :src="teamForStanding(row.team_id)?.crest_url || ''" :alt="'Brasão do ' + row.name"><span v-else>{{ initials(row.name) }}</span></div><strong>{{ row.name }}</strong></div><i class="bi bi-arrow-up-right" aria-hidden="true"></i></button></td>
                  <td class="points-col"><strong>{{ row.points }}</strong></td><td>{{ row.played }}</td><td>{{ row.wins }}</td><td>{{ row.draws }}</td><td>{{ row.losses }}</td><td>{{ row.goals_for }}</td><td>{{ row.goals_against }}</td><td>{{ row.goal_difference > 0 ? '+' + row.goal_difference : row.goal_difference }}</td>
                  <td><div class="form-results" :aria-label="'Últimos resultados de ' + row.name"><span v-for="(result, index) in recentResults(row.team_id)" :key="row.team_id + '-' + index" class="result-dot" :class="'result-' + result" :title="resultLabel(result)">{{ resultSymbol(result) }}</span><span v-if="!recentResults(row.team_id).length" class="result-empty">—</span></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-legend"><span><i class="qualification-dot"></i> Classificado para as eliminatórias</span><span><b class="legend-win">V</b> Vitória</span><span><b class="legend-draw">E</b> Empate</span><span><b class="legend-loss">D</b> Derrota</span></div>
          <p class="table-note">Desempate: pontos, vitórias, saldo, gols marcados, confronto direto e sorteio registrado.</p>
        </article>
      </section>

      <section v-if="publicTab === 'matches'" class="championship-section" role="tabpanel">
        <div class="championship-columns">
          <article class="surface-card panel-card">
            <div class="section-toolbar"><div><span class="eyebrow">Calendário</span><h2 class="section-title mb-0">Partidas</h2></div><span class="pill-badge pill-muted">{{ details.matches.length }} jogos</span></div>
            <div v-if="!details.matches.length" class="empty-inline">Nenhum confronto gerado ainda.</div>
            <div v-for="match in details.matches" :key="match.id" class="match-row" role="button" tabindex="0" :aria-label="'Abrir detalhes de ' + match.home_team.name + ' contra ' + match.away_team.name" @click="openChampionshipMatch(match)" @keydown.enter="openChampionshipMatch(match)" @keydown.space.prevent="openChampionshipMatch(match)">
              <button type="button" class="match-team match-team-button" @click.stop="openChampionshipTeam(match.home_team)">{{ match.home_team.name }}</button><div class="match-score-box"><strong class="match-score" :class="{ pending: match.status !== 'finished' }">{{ score(match) }}</strong><small>{{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }} • {{ phaseLabel(match.phase) }}</small></div><button type="button" class="match-team match-team--away match-team-button" @click.stop="openChampionshipTeam(match.away_team)">{{ match.away_team.name }}</button>
              <div v-if="match.odds" class="odds-inline" :title="'Modelo ' + (match.odds.parameters?.model || 'informativo')"><span>Odds informativas</span><strong>Casa {{ formatOdd(match.odds.home_odd) }} • Empate {{ formatOdd(match.odds.draw_odd) }} • Fora {{ formatOdd(match.odds.away_odd) }}</strong></div>
            </div>
          </article>
          <article class="surface-card panel-card match-summary-card">
            <div class="section-toolbar"><div><span class="eyebrow">Leitura rápida</span><h2 class="section-title mb-0">Resumo da fase</h2></div></div>
            <div class="phase-summary-list"><div><span>Jogos realizados</span><strong>{{ finishedMatchesCount }}</strong></div><div><span>Jogos agendados</span><strong>{{ details.matches.length - finishedMatchesCount }}</strong></div><div><span>Eliminatórias</span><strong>{{ knockoutMatchesCount }}</strong></div></div>
            <p class="summary-note">Os placares e as odds informativas são atualizados pela organização do campeonato.</p>
          </article>
        </div>
        <article class="surface-card panel-card bracket">
          <div class="section-toolbar"><div><span class="eyebrow">Fase eliminatória</span><h2 class="section-title mb-0">Chaveamento</h2></div><span class="text-muted small">Pênaltis decidem eliminatórias empatadas</span></div>
          <div class="bracket-grid"><div v-for="phase in ['semi_final', 'challenger_final', 'final']" :key="phase" class="bracket-stage"><h3>{{ phaseLabel(phase) }}</h3><div v-for="match in matchesByPhase(phase)" :key="match.id" class="bracket-match" role="button" tabindex="0" @click="openChampionshipMatch(match)" @keydown.enter="openChampionshipMatch(match)" @keydown.space.prevent="openChampionshipMatch(match)"><span>{{ match.home_team.name }}</span><strong>{{ score(match) }}</strong><span>{{ match.away_team.name }}</span></div><span v-if="!matchesByPhase(phase).length" class="empty-inline">Aguardando fase anterior</span></div></div>
        </article>
      </section>

      <section v-if="publicTab === 'stats'" class="championship-section" role="tabpanel">
        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Desempenho</span><h2 class="section-title mb-0">Rankings</h2></div><select v-model="phaseFilter" class="form-select compact-select" @change="loadRankings"><option value="all">Campeonato completo</option><option value="group">Classificatória</option><option value="semi_final">Semifinais</option><option value="challenger_final">Final dos Desafiantes</option><option value="final">Grande Final</option></select></div>
          <div class="ranking-columns"><div class="ranking-block"><h3>Artilharia</h3><RankingList :rows="rankings.scorers" value-label="gols" value-key="goals" @select="openChampionshipPlayer" /></div><div class="ranking-block"><h3>Assistências</h3><RankingList :rows="rankings.assists" value-label="assistências" value-key="assists" @select="openChampionshipPlayer" /></div><div class="ranking-block"><h3>MVP</h3><RankingList :rows="rankings.mvp" value-label="prêmios" value-key="mvp" @select="openChampionshipPlayer" /></div><div class="ranking-block"><h3>Goleiros</h3><RankingList :rows="rankings.goalkeepers" value-label="SG sofridos" value-key="goals_conceded" :ascending="true" @select="openChampionshipPlayer" /></div></div>
        </article>
        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Estatísticas</span><h2 class="section-title mb-0">Desempenho individual</h2></div><span class="text-muted small">Somente partidas válidas e finalizadas</span></div>
          <div class="table-wrap stats-table-wrap"><table class="data-table compact-table stats-table"><thead><tr><th>Jogador</th><th>J</th><th>V</th><th>G</th><th>A</th><th>PG</th><th>MVP</th><th v-if="hasGoalkeepers">GS / SG</th></tr></thead><tbody><tr v-for="row in statistics" :key="row.participant_id"><td><button type="button" class="championship-player-link" @click="openChampionshipPlayer(row)"><strong>{{ row.player.name }}</strong><small class="table-subline">{{ row.position === 'goalkeeper' ? 'Goleiro' : 'Linha' }}</small></button></td><td>{{ row.played }}</td><td>{{ row.wins }}</td><td>{{ row.goals }}</td><td>{{ row.assists }}</td><td>{{ row.goal_participations }}</td><td>{{ row.mvp }}</td><td v-if="hasGoalkeepers">{{ row.position === 'goalkeeper' ? row.goals_conceded + ' / ' + row.clean_sheets : '—' }}</td></tr></tbody></table></div>
          <div v-if="!statistics.length" class="empty-inline">As estatísticas aparecerão após os jogos finalizados.</div>
        </article>
      </section>

      <section v-if="publicTab === 'awards'" class="championship-section" role="tabpanel">
        <article class="surface-card panel-card awards-card">
          <div class="section-toolbar"><div><span class="eyebrow">Reconhecimento</span><h2 class="section-title mb-0">Premiações</h2></div><span class="text-muted small">Vote em uma categoria elegível</span></div>
          <div class="awards-grid">
            <article v-for="award in awards" :key="award.id" class="award-block">
              <div class="award-heading"><div><h3>{{ award.name }}</h3><p v-if="award.description">{{ award.description }}</p></div><span class="pill-badge" :class="award.type === 'vote' ? 'pill-info' : 'pill-muted'">{{ award.type === 'vote' ? 'Votação' : 'Automática' }}</span></div>
              <div v-if="award.published" class="award-results"><div v-for="result in award.results" :key="result.id" class="award-result"><span>{{ result.winner?.player?.name || 'Resultado automático' }}</span><strong>{{ result.votes }} votos • {{ result.percentage }}%</strong></div></div>
              <div v-else-if="award.type === 'vote' && award.voting_open && isAuthenticated" class="candidate-list"><button v-for="candidate in award.candidates" :key="candidate.id" type="button" class="candidate-button" @click="vote(award.id, candidate.id)">{{ candidate.player?.name }}<i class="bi bi-check2" aria-hidden="true"></i></button></div>
              <p v-else-if="award.type === 'vote' && award.voting_open" class="award-status">Faça login com uma conta vinculada a um participante para votar.</p>
              <p v-else-if="award.type === 'vote'" class="award-status">Votação encerrada. O resultado será publicado pela organização.</p>
            </article>
          </div>
          <div v-if="!awards.length" class="empty-inline">As premiações serão disponibilizadas ao longo do campeonato.</div>
        </article>
      </section>
    </template>

    <Teleport to="body">
      <div v-if="selectedChampionshipTeam || selectedChampionshipPlayer || selectedChampionshipMatch" class="championship-modal-backdrop" role="presentation" @click.self="closeChampionshipOverlay">
        <section v-if="selectedChampionshipTeam" class="championship-modal championship-team-panel" role="dialog" aria-modal="true" aria-labelledby="championship-team-modal-title-complete">
          <div class="section-toolbar"><div><span class="eyebrow">Time no campeonato</span><h2 id="championship-team-modal-title-complete" class="section-title mb-0">{{ selectedChampionshipTeam.name }}</h2></div><button type="button" class="championship-detail-close" aria-label="Fechar detalhes do time" @click="closeChampionshipTeam"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
          <div class="championship-team-hero"><div class="team-crest team-crest--winner"><img v-if="selectedChampionshipTeam.crest_url" :src="selectedChampionshipTeam.crest_url" :alt="'Brasao do ' + selectedChampionshipTeam.name"><span v-else>{{ initials(selectedChampionshipTeam.name) }}</span></div><div><p class="championship-player-context">{{ selectedTeamStanding ? selectedTeamStanding.position + ' colocado' : 'Equipe inscrita' }} <span>•</span> {{ selectedChampionshipTeam.players?.length || 0 }} participantes</p><p class="championship-player-period">Dados exclusivamente deste campeonato</p></div></div>
          <div class="championship-team-metrics"><div><span>Pontos</span><strong>{{ selectedTeamStanding?.points ?? 0 }}</strong></div><div><span>Partidas</span><strong>{{ selectedTeamStanding?.played ?? 0 }}</strong></div><div><span>Vitorias</span><strong>{{ selectedTeamStanding?.wins ?? 0 }}</strong></div><div><span>Saldo</span><strong>{{ (selectedTeamStanding?.goal_difference ?? 0) > 0 ? '+' + selectedTeamStanding?.goal_difference : selectedTeamStanding?.goal_difference ?? 0 }}</strong></div></div>
          <div class="championship-detail-tabs" role="tablist" aria-label="Detalhes do time"><button v-for="tab in teamDetailTabs" :key="tab.id" type="button" :class="{ active: teamModalTab === tab.id }" role="tab" :aria-selected="teamModalTab === tab.id" @click="teamModalTab = tab.id">{{ tab.label }}</button></div>
          <div v-if="teamModalTab === 'overview'" class="championship-detail-overview"><div class="championship-form-panel"><div class="section-toolbar"><div><span class="eyebrow">Momento</span><h3 class="section-title mb-0">Ultimos resultados</h3></div><span class="text-muted small">Fase classificatoria</span></div><div class="form-results form-results--large"><span v-for="(result, index) in recentResults(selectedChampionshipTeam.id)" :key="selectedChampionshipTeam.id + '-modal-' + index" class="result-dot" :class="'result-' + result" :title="resultLabel(result)">{{ resultSymbol(result) }}</span><span v-if="!recentResults(selectedChampionshipTeam.id).length" class="empty-inline">Sem partidas finalizadas</span></div></div><div class="championship-detail-stat-grid"><div><span>Gols marcados</span><strong>{{ selectedTeamStanding?.goals_for ?? 0 }}</strong></div><div><span>Gols sofridos</span><strong>{{ selectedTeamStanding?.goals_against ?? 0 }}</strong></div><div><span>Empates</span><strong>{{ selectedTeamStanding?.draws ?? 0 }}</strong></div><div><span>Derrotas</span><strong>{{ selectedTeamStanding?.losses ?? 0 }}</strong></div></div></div>
          <div v-else-if="teamModalTab === 'matches'" class="championship-detail-list"><div class="section-toolbar"><div><span class="eyebrow">Calendario do time</span><h3 class="section-title mb-0">Partidas</h3></div><span class="text-muted small">Clique para abrir o jogo</span></div><div class="championship-team-match-list"><button v-for="match in selectedTeamMatches" :key="match.id" type="button" class="championship-team-match" @click="openChampionshipMatch(match)"><span><strong>{{ match.home_team.name }} <small>{{ score(match) }}</small> {{ match.away_team.name }}</strong><small>{{ phaseLabel(match.phase) }} · {{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }}</small></span><i class="bi bi-chevron-right" aria-hidden="true"></i></button><div v-if="!selectedTeamMatches.length" class="empty-inline">Nenhuma partida encontrada para este time.</div></div></div>
          <div v-else class="championship-team-roster"><div class="section-toolbar"><div><span class="eyebrow">Elenco</span><h3 class="section-title mb-0">Jogadores do time</h3></div><span class="text-muted small">Clique para ver os numeros do campeonato</span></div><div class="championship-team-player-list"><button v-for="entry in selectedChampionshipTeam.players || []" :key="entry.id" type="button" class="championship-team-player" :disabled="!teamPlayerStatistics(entry)" @click="openChampionshipTeamPlayer(entry)"><span><strong>{{ championshipPlayerName(entry) }}</strong><small>{{ entry.player_type === 'goalkeeper' ? 'Goleiro' : 'Jogador de linha' }}</small></span><i class="bi bi-arrow-up-right" aria-hidden="true"></i></button><div v-if="!(selectedChampionshipTeam.players || []).length" class="empty-inline">Nenhum jogador inscrito neste time.</div></div></div>
        </section>
        <section v-else-if="selectedChampionshipPlayer" class="championship-modal championship-player-panel" role="dialog" aria-modal="true" aria-labelledby="championship-player-modal-title-complete">
          <div class="section-toolbar"><div><span class="eyebrow">Perfil no campeonato</span><h2 id="championship-player-modal-title-complete" class="section-title mb-0">{{ selectedChampionshipPlayer.player.name }}</h2></div><button type="button" class="championship-detail-close" aria-label="Fechar detalhes do jogador" @click="closeChampionshipPlayer"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
          <div class="championship-player-hero"><div class="team-crest team-crest--winner">{{ initials(selectedChampionshipPlayer.player.name) }}</div><div><p class="championship-player-context">{{ selectedPlayerTeam?.name || 'Jogador inscrito no campeonato' }} <span>•</span> {{ selectedChampionshipPlayer.position === 'goalkeeper' ? 'Goleiro' : 'Jogador de linha' }}</p><p class="championship-player-period">Numeros da fase selecionada: {{ phaseFilter === 'all' ? 'campeonato completo' : phaseLabel(phaseFilter) }}</p></div></div>
          <div class="championship-detail-tabs" role="tablist" aria-label="Detalhes do jogador"><button v-for="tab in playerDetailTabs" :key="tab.id" type="button" :class="{ active: playerModalTab === tab.id }" role="tab" :aria-selected="playerModalTab === tab.id" @click="playerModalTab = tab.id">{{ tab.label }}</button></div>
          <div v-if="playerModalTab === 'overview'" class="championship-player-metrics"><div v-for="metric in selectedPlayerRankings" :key="metric.label" class="championship-player-metric"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small v-if="metric.position">{{ metric.position }} no ranking</small></div><div class="championship-player-metric"><span>Partidas</span><strong>{{ selectedChampionshipPlayer.played }}</strong><small>{{ selectedChampionshipPlayer.wins }} vitorias</small></div></div>
          <div v-else class="championship-detail-list"><div class="section-toolbar"><div><span class="eyebrow">Desempenho</span><h3 class="section-title mb-0">Partidas do campeonato</h3></div><span class="text-muted small">Somente dados do campeonato</span></div><p v-if="!playerMatchData.hasParticipationData && playerMatchData.matches.length" class="championship-data-note"><i class="bi bi-info-circle" aria-hidden="true"></i> A API publica nao informa a participacao individual por partida; os jogos abaixo sao os confrontos do time.</p><div class="championship-team-match-list"><button v-for="match in playerMatchData.matches" :key="match.id" type="button" class="championship-team-match" @click="openChampionshipMatch(match)"><span><strong>{{ match.home_team.name }} <small>{{ score(match) }}</small> {{ match.away_team.name }}</strong><small>{{ phaseLabel(match.phase) }} · {{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }}</small></span><i class="bi bi-chevron-right" aria-hidden="true"></i></button><div v-if="!playerMatchData.matches.length" class="empty-inline">Nenhuma partida do time encontrada.</div></div></div>
        </section>
        <section v-else-if="selectedChampionshipMatch" class="championship-modal championship-match-panel" role="dialog" aria-modal="true" aria-labelledby="championship-match-modal-title">
          <div class="section-toolbar"><div><span class="eyebrow">Partida do campeonato</span><h2 id="championship-match-modal-title" class="section-title mb-0">{{ selectedChampionshipMatch.home_team.name }} x {{ selectedChampionshipMatch.away_team.name }}</h2></div><button type="button" class="championship-detail-close" aria-label="Fechar detalhes da partida" @click="closeChampionshipMatch"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
          <div class="championship-match-hero"><button type="button" class="championship-match-team" @click="openChampionshipTeam(selectedChampionshipMatch.home_team)"><div class="team-crest team-crest--winner"><img v-if="selectedChampionshipMatch.home_team.crest_url" :src="selectedChampionshipMatch.home_team.crest_url" :alt="'Brasao do ' + selectedChampionshipMatch.home_team.name"><span v-else>{{ initials(selectedChampionshipMatch.home_team.name) }}</span></div><strong>{{ selectedChampionshipMatch.home_team.name }}</strong></button><div class="championship-match-score"><strong :class="{ pending: selectedChampionshipMatch.status !== 'finished' }">{{ score(selectedChampionshipMatch) }}</strong><span>{{ selectedChampionshipMatch.status === 'finished' ? 'Finalizado' : selectedChampionshipMatch.status === 'cancelled' ? 'Cancelado' : 'Agendado' }}</span><small>{{ phaseLabel(selectedChampionshipMatch.phase) }} · rodada {{ selectedChampionshipMatch.round || '—' }}</small></div><button type="button" class="championship-match-team" @click="openChampionshipTeam(selectedChampionshipMatch.away_team)"><div class="team-crest team-crest--winner"><img v-if="selectedChampionshipMatch.away_team.crest_url" :src="selectedChampionshipMatch.away_team.crest_url" :alt="'Brasao do ' + selectedChampionshipMatch.away_team.name"><span v-else>{{ initials(selectedChampionshipMatch.away_team.name) }}</span></div><strong>{{ selectedChampionshipMatch.away_team.name }}</strong></button></div>
          <div class="championship-detail-tabs" role="tablist" aria-label="Detalhes da partida"><button v-for="tab in matchDetailTabs" :key="tab.id" type="button" :class="{ active: matchModalTab === tab.id }" role="tab" :aria-selected="matchModalTab === tab.id" @click="matchModalTab = tab.id">{{ tab.label }}</button></div>
          <div v-if="matchModalTab === 'overview'" class="championship-match-overview"><div class="championship-match-metrics"><div><span>Modelo de odds</span><strong>{{ selectedChampionshipMatch.odds?.parameters?.model || 'Informativo' }}</strong></div><div><span>Casa</span><strong>{{ selectedChampionshipMatch.odds ? formatOdd(selectedChampionshipMatch.odds.home_odd) : '—' }}</strong></div><div><span>Empate</span><strong>{{ selectedChampionshipMatch.odds ? formatOdd(selectedChampionshipMatch.odds.draw_odd) : '—' }}</strong></div><div><span>Fora</span><strong>{{ selectedChampionshipMatch.odds ? formatOdd(selectedChampionshipMatch.odds.away_odd) : '—' }}</strong></div></div><div class="championship-event-panel"><div class="section-toolbar"><div><span class="eyebrow">Linha do tempo</span><h3 class="section-title mb-0">Eventos da partida</h3></div></div><div v-if="selectedChampionshipMatch.events?.length" class="championship-event-list"><div v-for="event in selectedChampionshipMatch.events" :key="event.id" class="championship-event"><strong>{{ event.minute ?? '—' }}'</strong><span>{{ event.scorer?.name || event.player?.name || 'Evento registrado' }}<small v-if="event.assist">Assistencia: {{ event.assist.name }}</small></span></div></div><p v-else class="championship-data-note"><i class="bi bi-info-circle" aria-hidden="true"></i> A API publica do campeonato ainda nao disponibiliza a linha do tempo desta partida.</p></div></div>
          <div v-else-if="matchModalTab === 'lineups'" class="championship-detail-list"><div class="section-toolbar"><div><span class="eyebrow">Escalacoes</span><h3 class="section-title mb-0">Jogadores relacionados</h3></div><span class="text-muted small">Numeros deste campeonato</span></div><div class="championship-lineups"><div><h3>{{ selectedChampionshipMatch.home_team.name }}</h3><button v-for="entry in selectedChampionshipMatch.home_team.players || []" :key="entry.id" type="button" class="championship-lineup-player" :disabled="!teamPlayerStatistics(entry)" @click="openChampionshipTeamPlayer(entry)"><span>{{ championshipPlayerName(entry) }}</span><small>{{ teamPlayerStatistics(entry)?.played ?? 0 }} jogos · {{ teamPlayerStatistics(entry)?.goals ?? 0 }} gols</small></button><p v-if="!(selectedChampionshipMatch.home_team.players || []).length" class="empty-inline">Escalacao nao publicada.</p></div><div><h3>{{ selectedChampionshipMatch.away_team.name }}</h3><button v-for="entry in selectedChampionshipMatch.away_team.players || []" :key="entry.id" type="button" class="championship-lineup-player" :disabled="!teamPlayerStatistics(entry)" @click="openChampionshipTeamPlayer(entry)"><span>{{ championshipPlayerName(entry) }}</span><small>{{ teamPlayerStatistics(entry)?.played ?? 0 }} jogos · {{ teamPlayerStatistics(entry)?.goals ?? 0 }} gols</small></button><p v-if="!(selectedChampionshipMatch.away_team.players || []).length" class="empty-inline">Escalacao nao publicada.</p></div></div></div>
          <div v-else class="championship-detail-list"><div class="section-toolbar"><div><span class="eyebrow">Historico</span><h3 class="section-title mb-0">Confrontos no campeonato</h3></div><span class="text-muted small">Ultimos jogos entre os times</span></div><div class="championship-team-match-list"><button v-for="match in selectedMatchHistory" :key="match.id" type="button" class="championship-team-match" @click="openChampionshipMatch(match)"><span><strong>{{ match.home_team.name }} <small>{{ score(match) }}</small> {{ match.away_team.name }}</strong><small>{{ phaseLabel(match.phase) }} · {{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }}</small></span><i class="bi bi-chevron-right" aria-hidden="true"></i></button><div v-if="!selectedMatchHistory.length" class="empty-inline">Nao ha outro confronto entre os times neste campeonato.</div></div></div>
        </section>
        <section v-if="false" class="championship-modal championship-team-panel" role="dialog" aria-modal="true" aria-labelledby="championship-team-modal-title">
          <div class="section-toolbar"><div><span class="eyebrow">Time no campeonato</span><h2 id="championship-team-modal-title" class="section-title mb-0">{{ selectedChampionshipTeam.name }}</h2></div><button type="button" class="championship-detail-close" aria-label="Fechar detalhes do time" @click="closeChampionshipTeam"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
          <div class="championship-team-hero"><div class="team-crest team-crest--winner"><img v-if="selectedChampionshipTeam.crest_url" :src="selectedChampionshipTeam.crest_url" :alt="'Brasão do ' + selectedChampionshipTeam.name"><span v-else>{{ initials(selectedChampionshipTeam.name) }}</span></div><div><p class="championship-player-context">{{ selectedTeamStanding ? selectedTeamStanding.position + 'º colocado' : 'Equipe inscrita' }} <span>•</span> {{ selectedChampionshipTeam.players?.length || 0 }} participantes</p><p class="championship-player-period">Campanha e jogadores deste campeonato</p></div></div>
          <div class="championship-team-metrics"><div><span>Pontos</span><strong>{{ selectedTeamStanding?.points ?? 0 }}</strong></div><div><span>Partidas</span><strong>{{ selectedTeamStanding?.played ?? 0 }}</strong></div><div><span>Vitórias</span><strong>{{ selectedTeamStanding?.wins ?? 0 }}</strong></div><div><span>Saldo</span><strong>{{ (selectedTeamStanding?.goal_difference ?? 0) > 0 ? '+' + selectedTeamStanding?.goal_difference : selectedTeamStanding?.goal_difference ?? 0 }}</strong></div></div>
          <div class="championship-team-roster"><div class="section-toolbar"><div><span class="eyebrow">Elenco</span><h3 class="section-title mb-0">Jogadores do time</h3></div><span class="text-muted small">Clique para ver os números do campeonato</span></div><div class="championship-team-player-list"><button v-for="entry in selectedChampionshipTeam.players || []" :key="entry.id" type="button" class="championship-team-player" :disabled="!teamPlayerStatistics(entry)" @click="openChampionshipTeamPlayer(entry)"><span><strong>{{ championshipPlayerName(entry) }}</strong><small>{{ entry.player_type === 'goalkeeper' ? 'Goleiro' : 'Jogador de linha' }}</small></span><i class="bi bi-arrow-up-right" aria-hidden="true"></i></button><div v-if="!(selectedChampionshipTeam.players || []).length" class="empty-inline">Nenhum jogador inscrito neste time.</div></div></div>
        </section>
        <section v-else-if="false" class="championship-modal championship-player-panel" role="dialog" aria-modal="true" aria-labelledby="championship-player-modal-title">
          <div class="section-toolbar"><div><span class="eyebrow">Perfil no campeonato</span><h2 id="championship-player-modal-title" class="section-title mb-0">{{ selectedChampionshipPlayer.player.name }}</h2></div><button type="button" class="championship-detail-close" aria-label="Fechar detalhes do jogador" @click="closeChampionshipPlayer"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
          <div class="championship-player-hero"><div class="team-crest team-crest--winner">{{ initials(selectedChampionshipPlayer.player.name) }}</div><div><p class="championship-player-context">{{ selectedPlayerTeam?.name || 'Jogador inscrito no campeonato' }} <span>•</span> {{ selectedChampionshipPlayer.position === 'goalkeeper' ? 'Goleiro' : 'Jogador de linha' }}</p><p class="championship-player-period">Números da fase selecionada: {{ phaseFilter === 'all' ? 'campeonato completo' : phaseLabel(phaseFilter) }}</p></div></div>
          <div class="championship-player-metrics"><div v-for="metric in selectedPlayerRankings" :key="metric.label" class="championship-player-metric"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small v-if="metric.position">{{ metric.position }}º no ranking</small></div><div class="championship-player-metric"><span>Partidas</span><strong>{{ selectedChampionshipPlayer.played }}</strong><small>{{ selectedChampionshipPlayer.wins }} vitórias</small></div></div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import { ChampionshipService, type ChampionshipMatch, type ChampionshipPlayer, type ChampionshipStatisticsRow, type ChampionshipTeam } from '../services/championshipService'

type PublicTab = 'overview' | 'matches' | 'stats' | 'awards'
type FormResult = 'win' | 'draw' | 'loss'
type TeamDetailTab = 'overview' | 'matches' | 'squad'
type PlayerDetailTab = 'overview' | 'matches'
type MatchDetailTab = 'overview' | 'lineups' | 'history'
const teamDetailTabs: Array<{ id: TeamDetailTab; label: string }> = [
  { id: 'overview', label: 'Resumo' },
  { id: 'matches', label: 'Partidas' },
  { id: 'squad', label: 'Elenco' },
]
const playerDetailTabs: Array<{ id: PlayerDetailTab; label: string }> = [
  { id: 'overview', label: 'Numeros' },
  { id: 'matches', label: 'Partidas' },
]
const matchDetailTabs: Array<{ id: MatchDetailTab; label: string }> = [
  { id: 'overview', label: 'Resumo' },
  { id: 'lineups', label: 'Escalacoes' },
  { id: 'history', label: 'Historico' },
]
const publicTabs: Array<{ id: PublicTab; label: string; meta: string; icon: string }> = [
  { id: 'overview', label: 'Classificação', meta: 'Tabela e equipes', icon: 'bi bi-list-ol' },
  { id: 'matches', label: 'Partidas', meta: 'Calendário e chave', icon: 'bi bi-calendar3' },
  { id: 'stats', label: 'Estatísticas', meta: 'Rankings individuais', icon: 'bi bi-bar-chart-line' },
  { id: 'awards', label: 'Premiações', meta: 'Votação e resultados', icon: 'bi bi-award' },
]

const RankingList = defineComponent({
  props: { rows: { type: Array, default: () => [] }, valueLabel: { type: String, required: true }, valueKey: { type: String, required: true }, ascending: { type: Boolean, default: false } },
  emits: ['select'],
  setup(props: { rows: ChampionshipStatisticsRow[]; valueLabel: string; valueKey: string; ascending: boolean }, { emit }) {
    return () => {
      const rows = [...props.rows].sort((left, right) => {
        const leftValue = Number((left as unknown as Record<string, number>)[props.valueKey] || 0)
        const rightValue = Number((right as unknown as Record<string, number>)[props.valueKey] || 0)
        return props.ascending ? leftValue - rightValue : rightValue - leftValue
      })

      return h('div', { class: 'championship-ranking-list' }, rows.map((row, index) => h('button', {
        type: 'button',
        class: 'championship-ranking-row',
        key: row.participant_id,
        onClick: () => emit('select', row),
        'aria-label': `Abrir números de campeonato de ${row.player.name}`,
      }, [
        h('span', { class: 'championship-ranking-player' }, [
          h('b', { class: 'championship-ranking-position' }, String(index + 1)),
          h('span', { class: 'championship-ranking-name' }, row.player.name),
        ]),
        h('strong', { class: 'championship-ranking-value' }, `${Number((row as unknown as Record<string, number>)[props.valueKey] || 0)} ${props.valueLabel}`),
      ])))
    }
  },
})

const authStore = useAuthStore()
const toast = useToast()
const championships = ref<Awaited<ReturnType<typeof ChampionshipService.list>>>([])
const selectedId = ref<number>()
const details = ref<Awaited<ReturnType<typeof ChampionshipService.details>> | null>(null)
const rankings = ref<Awaited<ReturnType<typeof ChampionshipService.rankings>>>({ scorers: [], assists: [], mvp: [], goalkeepers: [] })
const statistics = ref<ChampionshipStatisticsRow[]>([])
const selectedChampionshipTeam = ref<ChampionshipTeam | null>(null)
const selectedChampionshipPlayer = ref<ChampionshipStatisticsRow | null>(null)
const selectedChampionshipMatch = ref<ChampionshipMatch | null>(null)
const awards = ref<Awaited<ReturnType<typeof ChampionshipService.awards>>>([])
const phaseFilter = ref('all')
const publicTab = ref<PublicTab>('overview')
const teamModalTab = ref<TeamDetailTab>('overview')
const playerModalTab = ref<PlayerDetailTab>('overview')
const matchModalTab = ref<MatchDetailTab>('overview')
const isLoading = ref(true)
const loadError = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasGoalkeepers = computed(() => statistics.value.some((row) => row.position === 'goalkeeper'))
const finishedMatchesCount = computed(() => details.value?.matches.filter((match) => match.status === 'finished').length || 0)
const knockoutMatchesCount = computed(() => details.value?.matches.filter((match) => match.phase !== 'group').length || 0)
const statusLabel = computed(() => ({ draft: 'Configuração', active: 'Em andamento', playoffs: 'Eliminatórias', finished: 'Encerrado' } as Record<string, string>)[details.value?.championship.status || ''] || 'Sem status')
const statusClass = computed(() => details.value?.championship.status === 'finished' ? 'pill-ok' : details.value?.championship.status === 'draft' ? 'pill-muted' : 'pill-info')
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
const phaseLabel = (phase: string) => ({ draft: 'Configuração', group: 'Classificatória', playoffs: 'Eliminatórias', semi_final: 'Semifinal', challenger_final: 'Final dos Desafiantes', final: 'Grande Final', finished: 'Encerrado' } as Record<string, string>)[phase] || phase
const score = (match: ChampionshipMatch) => {
  if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return 'vs'
  const normal = String(match.home_score) + ' × ' + String(match.away_score)
  return match.home_score === match.away_score && match.home_penalty_score !== null && match.home_penalty_score !== undefined ? normal + ' (' + match.home_penalty_score + ' × ' + match.away_penalty_score + ' pen.)' : normal
}
const formatOdd = (value: number) => Number(value || 0).toFixed(2)
const matchesByPhase = (phase: string) => details.value?.matches.filter((match) => match.phase === phase) || []
const teamForStanding = (teamId: number) => details.value?.championship.teams.find((team) => team.id === teamId)
const selectedTeamStanding = computed(() => details.value?.standings.find((row) => row.team_id === selectedChampionshipTeam.value?.id))
const selectedTeamMatches = computed(() => {
  const teamId = selectedChampionshipTeam.value?.id
  if (!teamId) return []
  return [...(details.value?.matches || [])].filter((match) => match.home_team.id === teamId || match.away_team.id === teamId).sort((left, right) => (right.round || 0) - (left.round || 0) || right.id - left.id)
})
const teamPlayerStatistics = (entry: ChampionshipPlayer) => statistics.value.find((row) => row.player.id === entry.player_id || row.player.id === entry.player?.id)
const championshipPlayerName = (entry: ChampionshipPlayer) => entry.player?.name || teamPlayerStatistics(entry)?.player.name || `Participante #${entry.player_id}`
const openChampionshipTeam = (team: ChampionshipTeam) => {
  selectedChampionshipTeam.value = team
  selectedChampionshipPlayer.value = null
  selectedChampionshipMatch.value = null
  teamModalTab.value = 'overview'
  publicTab.value = 'overview'
}
const openChampionshipTeamById = (teamId: number) => {
  const team = teamForStanding(teamId)
  if (team) openChampionshipTeam(team)
}
const closeChampionshipTeam = () => {
  selectedChampionshipTeam.value = null
}
const openChampionshipTeamPlayer = (entry: ChampionshipPlayer) => {
  const playerStatistics = teamPlayerStatistics(entry)
  if (!playerStatistics) {
    toast.info('Este jogador ainda não possui números registrados nesta fase.')
    return
  }
  selectedChampionshipTeam.value = null
  openChampionshipPlayer(playerStatistics)
}
const selectedPlayerTeam = computed(() => {
  const playerId = selectedChampionshipPlayer.value?.player.id
  if (!playerId) return undefined
  return details.value?.championship.teams.find((team) => team.players?.some((entry) => entry.player_id === playerId || entry.player?.id === playerId))
})
const playerMatchData = computed(() => {
  const player = selectedChampionshipPlayer.value
  const team = selectedPlayerTeam.value
  if (!player || !team) return { matches: [] as ChampionshipMatch[], hasParticipationData: false }
  const teamMatches = (details.value?.matches || []).filter((match) => match.home_team.id === team.id || match.away_team.id === team.id)
  const hasParticipationData = teamMatches.some((match) => Array.isArray(match.participations))
  const matches = hasParticipationData
    ? teamMatches.filter((match) => match.participations?.some((participation) => participation.championship_player_id === player.participant_id))
    : teamMatches
  return {
    matches: [...matches].sort((left, right) => (right.round || 0) - (left.round || 0) || right.id - left.id),
    hasParticipationData,
  }
})
const selectedMatchHistory = computed(() => {
  const current = selectedChampionshipMatch.value
  if (!current) return []
  const teamIds = [current.home_team.id, current.away_team.id]
  return [...(details.value?.matches || [])].filter((match) => match.id !== current.id && [match.home_team.id, match.away_team.id].includes(teamIds[0]) && [match.home_team.id, match.away_team.id].includes(teamIds[1])).sort((left, right) => (right.round || 0) - (left.round || 0) || right.id - left.id)
})
const rankingPosition = (rows: ChampionshipStatisticsRow[], valueKey: keyof ChampionshipStatisticsRow, playerId: number, ascending = false) => {
  const sorted = [...rows].sort((left, right) => {
    const leftValue = Number(left[valueKey] || 0)
    const rightValue = Number(right[valueKey] || 0)
    return ascending ? leftValue - rightValue : rightValue - leftValue
  })
  const position = sorted.findIndex((row) => row.player.id === playerId)
  return position >= 0 ? position + 1 : null
}
const selectedPlayerRankings = computed(() => {
  const player = selectedChampionshipPlayer.value
  if (!player) return []
  const metrics = [
    { label: 'Gols', value: player.goals, position: rankingPosition(rankings.value.scorers, 'goals', player.player.id) },
    { label: 'Assistências', value: player.assists, position: rankingPosition(rankings.value.assists, 'assists', player.player.id) },
    { label: 'MVP', value: player.mvp, position: rankingPosition(rankings.value.mvp, 'mvp', player.player.id) },
  ]
  if (player.position === 'goalkeeper') metrics.unshift({ label: 'Gols sofridos', value: player.goals_conceded, position: rankingPosition(rankings.value.goalkeepers, 'goals_conceded', player.player.id, true) })
  return metrics
})
const openChampionshipPlayer = (player: ChampionshipStatisticsRow) => {
  selectedChampionshipPlayer.value = player
  selectedChampionshipTeam.value = null
  selectedChampionshipMatch.value = null
  playerModalTab.value = 'overview'
  publicTab.value = 'stats'
}
const closeChampionshipPlayer = () => {
  selectedChampionshipPlayer.value = null
}
const openChampionshipMatch = (match: ChampionshipMatch) => {
  selectedChampionshipTeam.value = null
  selectedChampionshipPlayer.value = null
  selectedChampionshipMatch.value = match
  matchModalTab.value = 'overview'
}
const closeChampionshipMatch = () => {
  selectedChampionshipMatch.value = null
}
const closeChampionshipOverlay = () => {
  selectedChampionshipTeam.value = null
  selectedChampionshipPlayer.value = null
  selectedChampionshipMatch.value = null
}
const handleChampionshipKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeChampionshipOverlay()
}
const resultLabel = (result: FormResult) => ({ win: 'Vitória', draw: 'Empate', loss: 'Derrota' })[result]
const resultSymbol = (result: FormResult) => ({ win: 'V', draw: 'E', loss: 'D' })[result]
const recentResults = (teamId: number): FormResult[] => {
  const matches = (details.value?.matches || []).filter((match) => match.phase === 'group' && match.status === 'finished' && (match.home_team.id === teamId || match.away_team.id === teamId)).sort((a, b) => (a.round || 0) - (b.round || 0) || a.id - b.id).slice(-5)
  return matches.map((match) => {
    if (match.home_score === match.away_score) return 'draw'
    const teamIsHome = match.home_team.id === teamId
    const teamWon = teamIsHome ? (match.home_score || 0) > (match.away_score || 0) : (match.away_score || 0) > (match.home_score || 0)
    return teamWon ? 'win' : 'loss'
  })
}

const loadRankings = async () => {
  if (!selectedId.value) return
  const [rankingData, statisticsData] = await Promise.all([ChampionshipService.rankings(selectedId.value, phaseFilter.value), ChampionshipService.statistics(selectedId.value, phaseFilter.value)])
  rankings.value = rankingData
  statistics.value = statisticsData
  if (selectedChampionshipPlayer.value) selectedChampionshipPlayer.value = statisticsData.find((row) => row.player.id === selectedChampionshipPlayer.value?.player.id) || null
}
const loadDetails = async () => {
  if (!selectedId.value) { details.value = null; isLoading.value = false; return }
  isLoading.value = true
  loadError.value = ''
  try {
    details.value = await ChampionshipService.details(selectedId.value)
    await Promise.all([loadRankings(), ChampionshipService.awards(selectedId.value).then((data) => { awards.value = data })])
  } catch (error) {
    console.error(error)
    loadError.value = 'Não foi possível carregar este campeonato.'
  } finally { isLoading.value = false }
}
const vote = async (categoryId: number, candidateId: number) => {
  if (!isAuthenticated.value) { toast.info('Faça login para votar.'); return }
  try {
    await ChampionshipService.vote(categoryId, candidateId)
    toast.success('Voto registrado')
    if (selectedId.value) awards.value = await ChampionshipService.awards(selectedId.value)
  } catch { /* O interceptor exibe a mensagem devolvida pela API. */ }
}
onMounted(async () => {
  window.addEventListener('keydown', handleChampionshipKeydown)
  try {
    championships.value = await ChampionshipService.list()
    selectedId.value = championships.value[0]?.id
    await loadDetails()
  } catch (error) {
    console.error(error)
    loadError.value = 'Não foi possível carregar os campeonatos.'
    isLoading.value = false
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleChampionshipKeydown))
</script>

<style scoped>
.championship-page { container-type: inline-size; container-name: championship-page; padding-top: 1.25rem; }
.championship-header { align-items: flex-end; margin-bottom: 1rem; }
.championship-heading { min-width: 0; }
.title-row { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem .75rem; }
.eyebrow { display: block; color: var(--red-devils-hover); font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.championship-phase { display: flex; align-items: center; gap: .5rem; }
.championship-phase i { color: var(--red-devils-hover); }
.header-separator { color: var(--line-strong); }
.championship-picker { width: min(100%, 250px); color: var(--text-muted); font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.championship-picker .form-select { margin-top: .35rem; }
.state-card { display: flex; align-items: center; justify-content: center; gap: .75rem; min-height: 180px; padding: 2rem; }
.state-card--error { color: #fca5a5; flex-wrap: wrap; }
.empty-state { flex-direction: column; text-align: center; color: var(--text-muted); }
.empty-state i { color: var(--red-devils-hover); font-size: 2rem; }
.empty-state h2 { color: var(--text-main); margin: 0; }
.empty-state p { max-width: 480px; margin: 0; }
.spin { animation: spin 1s linear infinite; color: var(--red-devils-hover); }
@keyframes spin { to { transform: rotate(360deg); } }
.championship-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .35rem; margin-bottom: 1rem; padding: .35rem; overflow-x: auto; border: 1px solid var(--line-soft); border-radius: 1rem; background: rgba(255,255,255,.025); }
.championship-tab { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; align-items: center; gap: .1rem .55rem; min-width: 150px; min-height: 58px; padding: .65rem .75rem; border: 1px solid transparent; border-radius: .75rem; background: transparent; color: var(--text-muted); text-align: left; cursor: pointer; }
.championship-tab i { grid-row: span 2; color: var(--red-devils-hover); font-size: 1.1rem; }
.championship-tab span { color: var(--text-main); font-weight: 800; font-size: .82rem; }
.championship-tab small { font-size: .68rem; white-space: nowrap; }
.championship-tab.active, .championship-tab:hover { border-color: var(--red-devils); background: var(--red-devils-soft); color: var(--text-main); }
.championship-section { display: grid; gap: 1rem; min-width: 0; }
.champion-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.15rem; border-color: rgba(250, 204, 21, .28); background: linear-gradient(135deg, rgba(250, 204, 21, .1), rgba(220, 38, 38, .06)); }
.champion-copy h2 { margin: .2rem 0; }
.champion-copy p, .champion-copy small { margin: 0; color: var(--text-muted); }
.champion-copy small span { color: var(--line-strong); }
.champion-icon { margin-left: auto; color: #facc15; font-size: 1.6rem; }
.championship-team-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .6rem; }
.team-card { display: flex; align-items: center; gap: .65rem; min-width: 0; padding: .7rem .75rem; }
.team-card--interactive { width: 100%; border: 1px solid var(--line-soft); color: var(--text-main); text-align: left; cursor: pointer; }
.team-card--interactive:hover, .team-card--interactive:focus-visible { border-color: var(--red-devils); background: var(--red-devils-soft); }
.team-card-arrow { margin-left: auto; color: var(--red-devils-hover); }
.team-card-copy { min-width: 0; }
.team-card strong, .team-card-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.team-card-copy span { margin-top: .18rem; color: var(--text-muted); font-size: .7rem; }
.team-crest { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: .85rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-weight: 800; }
.team-crest--winner { width: 54px; height: 54px; flex-basis: 54px; border-radius: 1rem; }
.team-crest--table { width: 30px; height: 30px; flex-basis: 30px; border-radius: .55rem; font-size: .65rem; }
.team-crest img { width: 100%; height: 100%; object-fit: cover; }
.championship-team-panel { border-color: rgba(220, 38, 38, .3); background: linear-gradient(135deg, rgba(220, 38, 38, .08), rgba(255, 255, 255, .02)); }
.championship-team-hero { display: flex; align-items: center; gap: .85rem; }
.championship-team-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin-top: .85rem; }
.championship-team-metrics > div { display: grid; gap: .12rem; padding: .65rem .7rem; border: 1px solid var(--line-soft); border-radius: .7rem; background: rgba(255, 255, 255, .025); }
.championship-team-metrics span { color: var(--text-muted); font-size: .68rem; }
.championship-team-metrics strong { font-size: 1.05rem; }
.championship-team-roster { margin-top: 1rem; }
.championship-team-roster .section-toolbar { margin-bottom: .45rem; }
.championship-team-player-list { max-height: 440px; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--red-devils) var(--surface-strong); }
.championship-team-player { display: flex; align-items: center; justify-content: space-between; gap: .75rem; width: 100%; min-height: 44px; padding: .45rem .15rem; border: 0; border-bottom: 1px solid var(--line-soft); background: transparent; color: var(--text-main); font: inherit; text-align: left; cursor: pointer; }
.championship-team-player:last-child { border-bottom: 0; }
.championship-team-player:hover:not(:disabled), .championship-team-player:focus-visible:not(:disabled) { color: var(--red-devils-hover); }
.championship-team-player:disabled { color: var(--text-muted); cursor: default; }
.championship-team-player span { display: grid; min-width: 0; gap: .12rem; }
.championship-team-player strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.championship-team-player small { color: var(--text-muted); font-size: .68rem; }
.championship-team-player i { color: var(--red-devils-hover); }
.panel-card { min-width: 0; padding: 1rem; }
.section-context { display: inline-flex; align-items: center; gap: .35rem; color: var(--text-muted); font-size: .72rem; }
.table-wrap { min-width: 0; overflow-x: auto; scrollbar-color: var(--red-devils) var(--surface-strong); }
.standings-table-wrap { border: 1px solid var(--line-soft); border-radius: .75rem; }
.stats-table-wrap { max-height: 510px; overflow: auto; border: 1px solid var(--line-soft); border-radius: .75rem; scrollbar-color: var(--red-devils) var(--surface-strong); }
.data-table th { background: var(--surface-muted); color: var(--text-muted); }
.standings-table { min-width: 820px; font-size: .82rem; }
.standings-table thead th { background: var(--surface-muted); color: var(--text-muted); padding: .7rem .65rem; }
.standings-table tbody td { padding: .7rem .65rem; }
.standings-table th, .standings-table td { white-space: nowrap; text-align: center; }
.standings-table .sticky-col { position: sticky; z-index: 2; background: var(--surface); }
.standings-table thead .sticky-col { z-index: 4; background: var(--surface-muted); }
.sticky-position { left: 0; width: 42px; min-width: 42px; }
.sticky-team { left: 42px; min-width: 166px; text-align: left !important; box-shadow: 8px 0 12px -12px rgba(0,0,0,.85); }
.standings-table .sticky-team { padding-left: .7rem; }
.standing-team { display: flex; align-items: center; gap: .55rem; min-width: 0; text-align: left; }
.standing-team strong { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
.standings-table .points-col { position: sticky; left: 208px; z-index: 2; min-width: 52px; color: var(--text-main); font-size: .95rem; font-weight: 800; background: var(--surface); box-shadow: 8px 0 12px -12px rgba(0,0,0,.85); }
.standings-table thead .points-col { z-index: 4; background: var(--surface-muted); }
.standings-table tbody tr:hover .sticky-col { background: #211719; }
.standings-table tbody tr:hover .points-col { background: #211719; }
.standings-leader { background: rgba(250, 204, 21, .07); }
.standings-leader .sticky-col { background: rgba(58, 48, 18, .9); }
.standings-leader .points-col { background: rgba(58, 48, 18, .9); }
.standings-qualified .sticky-position { box-shadow: inset 3px 0 0 var(--red-devils); }
.form-results { display: inline-flex; align-items: center; gap: .25rem; min-height: 28px; }
.result-dot, .legend-win, .legend-draw, .legend-loss { display: inline-flex; align-items: center; justify-content: center; width: 23px; height: 23px; border-radius: 50%; font-size: .65rem; font-weight: 900; }
.result-win, .legend-win { background: #25a75a; color: #fff; }
.result-draw, .legend-draw { background: #8d8c99; color: #fff; }
.result-loss, .legend-loss { background: #e4473f; color: #fff; }
.result-empty { color: var(--text-muted); }
.table-legend { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; margin-top: .75rem; color: var(--text-muted); font-size: .72rem; }
.table-legend span { display: inline-flex; align-items: center; gap: .3rem; }
.qualification-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--red-devils-hover); }
.table-note { margin: .65rem 0 0; color: var(--text-muted); font-size: .72rem; }
.championship-columns { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); gap: 1rem; align-items: start; }
.match-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(94px, auto) minmax(0, 1fr); align-items: center; gap: .7rem; padding: .75rem 0; border-bottom: 1px solid var(--line-soft); }
.match-row:last-child { border-bottom: 0; }
.match-team { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.match-team--away { text-align: right; }
.match-score-box { text-align: center; }
.match-score { display: block; color: var(--text-main); font-size: 1rem; }
.match-score.pending { color: var(--red-devils-hover); }
.match-score-box small { display: block; margin-top: .15rem; color: var(--text-muted); font-size: .66rem; white-space: nowrap; }
.odds-inline { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding-top: .45rem; color: var(--text-muted); font-size: .68rem; }
.odds-inline strong { color: var(--text-main); font-size: .7rem; }
.phase-summary-list { display: grid; gap: .5rem; }
.phase-summary-list div { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .7rem .75rem; border: 1px solid var(--line-soft); border-radius: .7rem; background: rgba(255,255,255,.025); }
.phase-summary-list span { color: var(--text-muted); font-size: .78rem; }
.phase-summary-list strong { font-size: 1.1rem; }
.summary-note { margin: .8rem 0 0; color: var(--text-muted); font-size: .75rem; line-height: 1.5; }
.bracket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; }
.bracket-stage { min-width: 0; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.02); }
.bracket-stage h3 { margin: 0 0 .6rem; color: var(--red-devils-hover); font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; }
.bracket-match { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .4rem; padding: .6rem 0; border-bottom: 1px solid var(--line-soft); font-size: .8rem; }
.bracket-match:last-of-type { border-bottom: 0; }
.bracket-match span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bracket-match span:nth-of-type(2) { grid-column: 1; }
.bracket-match strong { grid-column: 2; grid-row: 1 / span 2; align-self: center; }
.ranking-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.ranking-block { min-width: 0; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.02); }
.ranking-block h3 { margin: 0 0 .35rem; font-size: .78rem; }
.compact-select { width: min(100%, 230px); }
.compact-table { font-size: .8rem; }
.compact-table th, .compact-table td { white-space: nowrap; }
.stats-table thead th { position: sticky; top: 0; z-index: 2; background: var(--surface-muted); }
.championship-player-link { display: inline-flex; flex-direction: column; width: 100%; min-width: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.championship-player-link:hover strong { color: var(--red-devils-hover); }
.championship-player-panel { border-color: rgba(220, 38, 38, .3); background: linear-gradient(135deg, rgba(220, 38, 38, .08), rgba(255, 255, 255, .02)); }
.championship-modal-backdrop { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(7, 3, 3, .78); backdrop-filter: blur(8px); }
.championship-modal { width: min(100%, 760px); max-height: min(88vh, 760px); overflow-y: auto; padding: 1rem; border: 1px solid var(--line-strong); border-radius: 1rem; box-shadow: 0 24px 70px rgba(0, 0, 0, .5); }
.championship-detail-close { display: inline-grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--line-soft); border-radius: .6rem; background: transparent; color: var(--text-muted); cursor: pointer; }
.championship-detail-close:hover { border-color: var(--red-devils); color: var(--text-main); }
.championship-player-hero { display: flex; align-items: center; gap: .85rem; }
.championship-player-context, .championship-player-period { margin: 0; color: var(--text-muted); font-size: .78rem; }
.championship-player-context { color: var(--text-main); font-weight: 700; }
.championship-player-context span { margin: 0 .25rem; color: var(--red-devils-hover); }
.championship-player-period { margin-top: .2rem; }
.championship-player-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin-top: .85rem; }
.championship-player-metric { display: grid; gap: .12rem; padding: .65rem .7rem; border: 1px solid var(--line-soft); border-radius: .7rem; background: rgba(255, 255, 255, .025); }
.championship-player-metric span, .championship-player-metric small { color: var(--text-muted); font-size: .68rem; }
.championship-player-metric strong { font-size: 1.05rem; }
.standing-team-button { display: flex; align-items: center; justify-content: space-between; gap: .4rem; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.standing-team-button > i { color: var(--red-devils-hover); font-size: .72rem; opacity: 0; transition: opacity .15s ease; }
.standing-team-button:hover > i, .standing-team-button:focus-visible > i { opacity: 1; }
.match-team-button { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; cursor: pointer; }
.match-team-button:hover, .match-team-button:focus-visible { color: var(--red-devils-hover); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: .2rem; }
.match-row:hover, .match-row:focus-visible { background: rgba(255, 255, 255, .035); }
.bracket-match { cursor: pointer; }
.bracket-match:hover, .bracket-match:focus-visible { border-radius: .5rem; background: rgba(255, 255, 255, .045); }
.championship-detail-tabs { display: flex; gap: .35rem; margin-top: 1rem; padding-bottom: .4rem; overflow-x: auto; border-bottom: 1px solid var(--line-soft); }
.championship-detail-tabs button { min-height: 34px; padding: .4rem .75rem; border: 1px solid transparent; border-radius: .55rem; background: transparent; color: var(--text-muted); font: inherit; font-size: .75rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
.championship-detail-tabs button:hover, .championship-detail-tabs button.active { border-color: rgba(220, 38, 38, .45); background: var(--red-devils-soft); color: var(--text-main); }
.championship-detail-overview { display: grid; gap: .75rem; margin-top: .85rem; }
.championship-form-panel, .championship-detail-stat-grid > div, .championship-event-panel { padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255, 255, 255, .02); }
.championship-form-panel .section-toolbar { margin-bottom: .45rem; }
.form-results--large { min-height: 34px; gap: .35rem; }
.form-results--large .result-dot { width: 29px; height: 29px; }
.championship-detail-stat-grid, .championship-match-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin-top: .75rem; }
.championship-detail-stat-grid > div, .championship-match-metrics > div { display: grid; gap: .12rem; }
.championship-detail-stat-grid span, .championship-match-metrics span { color: var(--text-muted); font-size: .68rem; }
.championship-detail-stat-grid strong, .championship-match-metrics strong { font-size: 1rem; }
.championship-team-matches { margin-top: 1rem; }
.championship-team-match-list { max-height: 480px; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--red-devils) var(--surface-strong); }
.championship-team-match { display: flex; align-items: center; justify-content: space-between; gap: .75rem; width: 100%; min-height: 48px; padding: .5rem .15rem; border: 0; border-bottom: 1px solid var(--line-soft); background: transparent; color: var(--text-main); font: inherit; text-align: left; cursor: pointer; }
.championship-team-match:last-child { border-bottom: 0; }
.championship-team-match:hover, .championship-team-match:focus-visible { background: rgba(255, 255, 255, .04); color: var(--red-devils-hover); }
.championship-team-match span { display: grid; min-width: 0; gap: .15rem; }
.championship-team-match strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .78rem; }
.championship-team-match strong small { color: var(--text-main); font-size: .72rem; }
.championship-team-match span > small { color: var(--text-muted); font-size: .68rem; }
.championship-team-match > i { color: var(--red-devils-hover); }
.championship-data-note { display: flex; align-items: flex-start; gap: .45rem; margin: .75rem 0; color: var(--text-muted); font-size: .75rem; line-height: 1.45; }
.championship-data-note i { flex: 0 0 auto; color: var(--red-devils-hover); }
.championship-match-panel { border-color: rgba(220, 38, 38, .3); background: linear-gradient(135deg, rgba(220, 38, 38, .08), rgba(255, 255, 255, .02)); }
.championship-match-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(120px, auto) minmax(0, 1fr); align-items: center; gap: .75rem; margin-top: .35rem; }
.championship-match-team { display: grid; justify-items: center; gap: .45rem; min-width: 0; padding: .5rem; border: 1px solid transparent; border-radius: .75rem; background: transparent; color: var(--text-main); font: inherit; cursor: pointer; }
.championship-match-team:hover, .championship-match-team:focus-visible { border-color: var(--red-devils); background: var(--red-devils-soft); }
.championship-match-team strong { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
.championship-match-score { display: grid; justify-items: center; gap: .15rem; text-align: center; }
.championship-match-score strong { font-size: 1.7rem; }
.championship-match-score strong.pending { color: var(--red-devils-hover); }
.championship-match-score span { color: var(--text-muted); font-size: .72rem; }
.championship-match-score small { color: var(--text-muted); font-size: .65rem; }
.championship-match-overview { margin-top: .85rem; }
.championship-event-panel { margin-top: .75rem; }
.championship-event-list { display: grid; gap: .35rem; }
.championship-event { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: .6rem; align-items: start; padding: .55rem 0; border-bottom: 1px solid var(--line-soft); font-size: .78rem; }
.championship-event:last-child { border-bottom: 0; }
.championship-event > strong { color: var(--red-devils-hover); }
.championship-event span { display: grid; gap: .15rem; }
.championship-event small { color: var(--text-muted); font-size: .68rem; }
.championship-lineups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.championship-lineups > div { min-width: 0; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255, 255, 255, .02); }
.championship-lineups h3 { margin: 0 0 .4rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .82rem; }
.championship-lineup-player { display: flex; align-items: center; justify-content: space-between; gap: .5rem; width: 100%; min-height: 38px; padding: .4rem 0; border: 0; border-bottom: 1px solid var(--line-soft); background: transparent; color: var(--text-main); font: inherit; text-align: left; cursor: pointer; }
.championship-lineup-player:last-of-type { border-bottom: 0; }
.championship-lineup-player:hover:not(:disabled), .championship-lineup-player:focus-visible:not(:disabled) { color: var(--red-devils-hover); }
.championship-lineup-player:disabled { color: var(--text-muted); cursor: default; }
.championship-lineup-player span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .76rem; }
.championship-lineup-player small { color: var(--text-muted); font-size: .65rem; white-space: nowrap; }
.table-subline { display: block; color: var(--text-muted); font-size: .68rem; }
.awards-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.award-block { min-width: 0; padding: .85rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: rgba(255,255,255,.02); }
.award-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
.award-heading h3 { margin: 0; font-size: .9rem; }
.award-heading p { margin: .25rem 0 0; color: var(--text-muted); font-size: .72rem; line-height: 1.4; }
.award-results { margin-top: .7rem; }
.award-result { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .55rem 0; border-bottom: 1px solid var(--line-soft); font-size: .78rem; }
.award-result:last-child { border-bottom: 0; }
.candidate-list { display: grid; gap: .4rem; margin-top: .7rem; }
.candidate-button { display: flex; align-items: center; justify-content: space-between; gap: .75rem; min-height: 40px; padding: .5rem .65rem; border: 1px solid var(--line-soft); border-radius: .6rem; background: transparent; color: var(--text-main); text-align: left; cursor: pointer; }
.candidate-button:hover { border-color: var(--red-devils); background: var(--red-devils-soft); }
.candidate-button i { color: var(--red-devils-hover); }
.award-status { margin: .7rem 0 0; color: var(--text-muted); font-size: .75rem; line-height: 1.45; }
.empty-inline { padding: .8rem 0; color: var(--text-muted); font-size: .85rem; }
@container championship-page (max-width: 1050px) { .championship-team-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .championship-columns { grid-template-columns: 1fr; } }
@container championship-page (max-width: 680px) { .championship-page { padding-top: .4rem; } .championship-header { align-items: stretch; } .championship-picker { width: 100%; } .championship-tabs { grid-template-columns: repeat(4, minmax(150px, 1fr)); margin-right: -.75rem; padding-right: .75rem; border-right: 0; border-radius: .85rem 0 0 .85rem; } .championship-team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .champion-banner { align-items: flex-start; } .section-context { max-width: 150px; text-align: right; } .ranking-columns, .awards-grid { grid-template-columns: 1fr; } .stats-table-wrap { max-height: 270px; } .championship-player-metrics, .championship-team-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .championship-team-player-list, .championship-team-match-list, .championship-ranking-list { max-height: 220px; } .championship-lineups { grid-template-columns: 1fr; } .championship-detail-stat-grid, .championship-match-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .match-summary-card { order: -1; } }
@container championship-page (max-width: 420px) { .title-row { align-items: flex-start; flex-direction: column; gap: .35rem; } .championship-team-grid { gap: .45rem; } .team-card { padding: .6rem; } .team-crest { width: 36px; height: 36px; flex-basis: 36px; } .team-crest--winner { width: 46px; height: 46px; flex-basis: 46px; } .champion-banner { padding: .85rem; } .champion-icon { font-size: 1.2rem; } .section-context { display: none; } .panel-card { padding: .8rem; } .match-row { gap: .35rem; } .match-score-box { min-width: 80px; } .odds-inline { align-items: flex-start; flex-direction: column; gap: .2rem; } .table-legend { gap: .5rem; } }
@media (max-width: 767px) { .championship-modal-backdrop { align-items: flex-end; padding: .5rem; } .championship-modal { max-height: 92vh; padding: .8rem; border-radius: 1rem 1rem .75rem .75rem; } .championship-team-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .championship-team-player-list { max-height: 220px; } }

/* Experiência compacta para telefones: mantém a densidade de um app esportivo
   sem criar overflow na página principal. As tabelas continuam rolando dentro
   do próprio card quando a quantidade de colunas exigir isso. */
@media (max-width: 767px) {
  .championship-page {
    width: 100%;
    padding: .35rem 0 1rem;
  }

  .championship-page .page-header {
    display: grid;
    gap: .6rem;
    margin-bottom: .7rem;
  }

  .championship-page .page-title {
    font-size: 1.45rem;
    line-height: 1.15;
  }

  .championship-page .page-subtitle {
    font-size: .74rem;
    line-height: 1.35;
  }

  .championship-phase {
    gap: .35rem;
    flex-wrap: wrap;
  }

  .championship-picker {
    width: 100%;
    font-size: .62rem;
  }

  .championship-picker .form-select {
    min-height: 40px;
    margin-top: .25rem;
    padding: .45rem .65rem;
    font-size: .8rem;
  }

  .championship-tabs {
    display: flex;
    gap: .25rem;
    margin: 0 -.15rem .7rem;
    padding: .25rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    border-radius: .75rem;
    scrollbar-width: thin;
  }

  .championship-tab {
    display: grid;
    flex: 0 0 118px;
    grid-template-columns: auto minmax(0, 1fr);
    min-width: 118px;
    min-height: 46px;
    padding: .45rem .5rem;
    border-radius: .55rem;
    gap: .1rem .35rem;
  }

  .championship-tab i {
    font-size: .9rem;
  }

  .championship-tab span {
    font-size: .72rem;
    line-height: 1.1;
  }

  .championship-tab small {
    display: none;
  }

  .championship-section {
    gap: .65rem;
  }

  .championship-page .surface-card {
    border-radius: .9rem;
  }

  .championship-page .panel-card {
    padding: .72rem;
  }

  .section-toolbar {
    align-items: flex-start;
    gap: .45rem;
    margin-bottom: .6rem;
  }

  .section-title {
    font-size: .98rem;
    line-height: 1.2;
  }

  .eyebrow {
    font-size: .6rem;
  }

  .champion-banner {
    gap: .65rem;
    padding: .7rem;
  }

  .team-crest--winner {
    width: 44px;
    height: 44px;
    flex-basis: 44px;
  }

  .champion-copy h2 {
    margin: .1rem 0;
    font-size: .95rem;
  }

  .champion-copy p,
  .champion-copy small {
    font-size: .67rem;
    line-height: 1.35;
  }

  .champion-icon {
    font-size: 1.15rem;
  }

  .championship-team-grid {
    gap: .4rem;
  }

  .team-card {
    gap: .45rem;
    padding: .55rem;
    border-radius: .7rem;
  }

  .team-crest,
  .team-crest--table {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    border-radius: .55rem;
  }

  .team-card strong {
    font-size: .72rem;
  }

  .team-card-copy span {
    margin-top: .1rem;
    font-size: .61rem;
  }

  .team-card-arrow {
    font-size: .7rem;
  }

  .standings-table-wrap,
  .stats-table-wrap {
    max-width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .standings-table {
    min-width: 700px;
    font-size: .7rem;
  }

  .standings-table thead th,
  .standings-table tbody td {
    padding: .55rem .45rem;
  }

  .standings-table .sticky-team {
    min-width: 142px;
  }

  .standings-table .points-col {
    left: 184px;
  }

  .standing-team {
    gap: .35rem;
  }

  .standing-team strong {
    max-width: 92px;
    font-size: .7rem;
  }

  .table-legend {
    gap: .35rem .55rem;
    margin-top: .55rem;
    font-size: .64rem;
  }

  .table-note {
    margin-top: .5rem;
    font-size: .64rem;
    line-height: 1.4;
  }

  .match-row {
    gap: .35rem;
    padding: .6rem 0;
  }

  .match-team {
    font-size: .72rem;
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .match-score-box {
    min-width: 68px;
  }

  .match-score {
    font-size: .9rem;
  }

  .match-score-box small {
    font-size: .58rem;
  }

  .odds-inline {
    align-items: flex-start;
    gap: .15rem;
    padding-top: .35rem;
    flex-direction: column;
    font-size: .6rem;
  }

  .odds-inline strong {
    font-size: .62rem;
  }

  .phase-summary-list {
    gap: .35rem;
  }

  .phase-summary-list div {
    padding: .55rem .6rem;
  }

  .phase-summary-list span {
    font-size: .7rem;
  }

  .phase-summary-list strong {
    font-size: .95rem;
  }

  .summary-note {
    margin-top: .6rem;
    font-size: .67rem;
  }

  .bracket-grid {
    display: flex;
    gap: .5rem;
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: .2rem;
    overscroll-behavior-x: contain;
  }

  .bracket-stage {
    flex: 0 0 214px;
    padding: .6rem;
  }

  .bracket-stage h3 {
    margin-bottom: .4rem;
    font-size: .66rem;
  }

  .bracket-match {
    padding: .5rem 0;
    font-size: .7rem;
  }

  .ranking-columns,
  .awards-grid {
    grid-template-columns: 1fr;
    gap: .5rem;
  }

  .ranking-block,
  .award-block {
    padding: .6rem;
    border-radius: .7rem;
  }

  .ranking-block h3,
  .award-heading h3 {
    font-size: .78rem;
  }

  .championship-ranking-list {
    max-height: 260px;
    overflow-y: auto;
    scrollbar-color: var(--red-devils) var(--surface-strong);
  }

  .championship-ranking-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    width: 100%;
    min-height: 38px;
    padding: .4rem 0;
    border: 0;
    border-bottom: 1px solid var(--line-soft);
    background: transparent;
    color: var(--text-main);
    font: inherit;
    text-align: left;
  }

  .championship-ranking-player {
    display: flex;
    align-items: center;
    gap: .4rem;
    min-width: 0;
  }

  .championship-ranking-position {
    display: grid;
    flex: 0 0 20px;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--red-devils-soft);
    color: var(--red-devils-hover);
    font-size: .63rem;
  }

  .championship-ranking-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: .72rem;
  }

  .championship-ranking-value {
    flex: 0 0 auto;
    color: var(--text-muted);
    font-size: .65rem;
  }

  .compact-select {
    width: min(100%, 180px);
    min-height: 38px;
    padding: .4rem .55rem;
    font-size: .7rem;
  }

  .stats-table-wrap {
    max-height: 300px;
  }

  .stats-table {
    min-width: 560px;
    font-size: .68rem;
  }

  .compact-table th,
  .compact-table td {
    padding: .5rem .4rem;
  }

  .championship-player-link strong {
    max-width: 118px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: .7rem;
  }

  .table-subline {
    font-size: .58rem;
  }

  .award-heading,
  .award-result {
    gap: .5rem;
  }

  .award-heading p,
  .award-result,
  .award-status {
    font-size: .67rem;
  }

  .candidate-button {
    min-height: 38px;
    padding: .45rem .55rem;
    font-size: .72rem;
  }

  .championship-modal-backdrop {
    align-items: flex-end;
    padding: .4rem;
    overflow: hidden;
  }

  .championship-modal {
    width: 100%;
    max-height: calc(100dvh - .8rem);
    padding: .7rem;
    border-radius: .9rem .9rem .7rem .7rem;
  }

  .championship-modal .section-toolbar {
    gap: .45rem;
    margin-bottom: .55rem;
  }

  .championship-modal .section-title {
    font-size: .92rem;
  }

  .championship-detail-close {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
  }

  .championship-team-hero,
  .championship-player-hero {
    gap: .55rem;
  }

  .championship-player-context,
  .championship-player-period {
    font-size: .66rem;
  }

  .championship-team-metrics,
  .championship-player-metrics,
  .championship-detail-stat-grid,
  .championship-match-metrics {
    gap: .4rem;
    margin-top: .6rem;
  }

  .championship-team-metrics > div,
  .championship-player-metric,
  .championship-detail-stat-grid > div,
  .championship-match-metrics > div {
    padding: .5rem .55rem;
  }

  .championship-team-metrics span,
  .championship-player-metric span,
  .championship-player-metric small,
  .championship-detail-stat-grid span,
  .championship-match-metrics span {
    font-size: .6rem;
  }

  .championship-team-metrics strong,
  .championship-player-metric strong,
  .championship-detail-stat-grid strong,
  .championship-match-metrics strong {
    font-size: .92rem;
  }

  .championship-detail-tabs {
    gap: .25rem;
    margin-top: .7rem;
    padding-bottom: .3rem;
  }

  .championship-detail-tabs button {
    min-height: 36px;
    padding: .35rem .6rem;
    font-size: .68rem;
  }

  .championship-detail-overview,
  .championship-team-roster,
  .championship-team-matches {
    margin-top: .65rem;
  }

  .championship-form-panel,
  .championship-detail-stat-grid > div,
  .championship-event-panel,
  .championship-lineups > div {
    padding: .6rem;
    border-radius: .65rem;
  }

  .championship-lineups {
    gap: .5rem;
  }

  .championship-lineups h3 {
    font-size: .75rem;
  }

  .championship-lineup-player,
  .championship-team-player,
  .championship-team-match {
    min-height: 40px;
    padding: .4rem .1rem;
  }

  .championship-lineup-player span,
  .championship-team-player strong,
  .championship-team-match strong {
    font-size: .7rem;
  }

  .championship-lineup-player small,
  .championship-team-player small,
  .championship-team-match span > small {
    font-size: .6rem;
  }

  .championship-match-hero {
    grid-template-columns: minmax(0, 1fr) 66px minmax(0, 1fr);
    gap: .3rem;
  }

  .championship-match-team {
    gap: .3rem;
    padding: .35rem;
  }

  .championship-match-team strong {
    max-width: 100px;
    font-size: .7rem;
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .championship-match-score strong {
    font-size: 1.35rem;
  }

  .championship-match-score span,
  .championship-match-score small {
    font-size: .6rem;
  }

  .championship-event-panel {
    margin-top: .6rem;
  }

  .championship-event {
    grid-template-columns: 30px minmax(0, 1fr);
    gap: .4rem;
    padding: .45rem 0;
    font-size: .7rem;
  }

  .championship-event small {
    font-size: .6rem;
  }

  .championship-data-note,
  .empty-inline {
    font-size: .68rem;
    line-height: 1.4;
  }
}

@media (max-width: 420px) {
  .championship-tab {
    flex-basis: 108px;
    min-width: 108px;
  }

  .championship-team-grid {
    grid-template-columns: 1fr 1fr;
  }

  .championship-team-grid .team-card {
    min-height: 52px;
  }

  .championship-page .panel-card {
    padding: .62rem;
  }

  .championship-team-metrics,
  .championship-player-metrics,
  .championship-detail-stat-grid,
  .championship-match-metrics {
    gap: .3rem;
  }

  .compact-select {
    width: 150px;
  }
}
</style>
