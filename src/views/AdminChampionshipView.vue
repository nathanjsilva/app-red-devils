<template>
  <section class="page-shell championship-admin">
    <header class="page-header">
      <div>
        <span class="eyebrow">Administração</span>
        <h1 class="page-title">Campeonatos</h1>
        <p class="page-subtitle">Configure participantes, equipes, partidas e premiações.</p>
      </div>
      <span v-if="busy" class="pill-badge pill-info"><i class="bi bi-arrow-repeat spin"></i> Salvando</span>
    </header>

    <div v-if="isLoading" class="surface-card state-card" role="status"><i class="bi bi-arrow-repeat spin"></i><span>Carregando campeonatos...</span></div>
    <div v-else-if="loadError" class="surface-card state-card state-card--error" role="alert"><i class="bi bi-exclamation-triangle"></i><span>{{ loadError }}</span><button type="button" class="btn btn-outline-secondary btn-sm" @click="loadInitialData">Tentar novamente</button></div>

    <template v-else>
      <section class="surface-card create-card">
        <div><span class="section-kicker">Nova temporada</span><h2>Comece um campeonato</h2><p>Crie uma temporada e configure o torneio em etapas.</p></div>
        <div class="create-form"><input v-model.trim="newName" placeholder="Ex.: Red Devils 2026" aria-label="Nome do campeonato" @keyup.enter="createChampionship"><button class="btn btn-red" :disabled="busy || !newName" @click="createChampionship"><i class="bi bi-plus-lg"></i> Criar campeonato</button></div>
      </section>

      <nav v-if="championships.length" class="championship-selector" aria-label="Selecionar campeonato">
        <button v-for="item in championships" :key="item.id" type="button" :class="['selector-button', { active: item.id === selectedId }]" @click="selectChampionship(item.id)"><span>{{ item.name }}</span><small>{{ statusLabelFor(item.status) }}</small></button>
      </nav>
      <div v-if="!details" class="surface-card empty-state"><i class="bi bi-trophy"></i><h2>Selecione uma temporada</h2><p>Crie ou selecione um campeonato para começar.</p></div>

      <template v-else>
        <nav class="module-tabs" aria-label="Seções do campeonato">
          <button v-for="tab in tabs" :key="tab.id" type="button" :class="['module-tab', { active: activeTab === tab.id }]" @click="activeTab = tab.id"><i :class="tab.icon"></i><span>{{ tab.label }}</span><small>{{ tab.meta }}</small></button>
        </nav>

        <section v-if="activeTab === 'overview'" class="overview-grid">
          <div class="overview-main surface-card"><div><span class="section-kicker">Temporada ativa</span><h2>{{ details.championship.name }}</h2><span class="pill-badge" :class="statusClass">{{ statusLabel }}</span></div><i class="bi bi-trophy-fill overview-icon"></i></div>
          <div v-for="metric in metrics" :key="metric.label" class="metric-card"><span>{{ metric.label }}</span><strong>{{ metric.value }}<small>/{{ metric.total }}</small></strong><div class="progress-track"><span :style="{ width: `${Math.min(metric.value / metric.total * 100, 100)}%` }"></span></div></div>
        </section>

        <section v-if="activeTab === 'overview'" class="surface-card admin-card tie-breaker-card">
          <div class="card-heading"><div><span class="section-kicker">Critério final</span><h2>Registrar sorteio de desempate</h2><p>Use somente quando dois times continuarem empatados após os critérios esportivos.</p></div><i class="bi bi-shuffle"></i></div>
          <div class="form-row">
            <label>Equipe A<select v-model.number="tieBreakForm.team_a_id"><option :value="0">Selecione</option><option v-for="team in details.championship.teams" :key="`a-${team.id}`" :value="team.id">{{ team.name }}</option></select></label>
            <label>Equipe B<select v-model.number="tieBreakForm.team_b_id"><option :value="0">Selecione</option><option v-for="team in details.championship.teams" :key="`b-${team.id}`" :value="team.id">{{ team.name }}</option></select></label>
          </div>
          <label>Vencedora do sorteio<select v-model.number="tieBreakForm.winner_id"><option :value="0">Selecione as equipes primeiro</option><option v-if="tieBreakForm.team_a_id" :value="tieBreakForm.team_a_id">{{ teamName(tieBreakForm.team_a_id) }}</option><option v-if="tieBreakForm.team_b_id && tieBreakForm.team_b_id !== tieBreakForm.team_a_id" :value="tieBreakForm.team_b_id">{{ teamName(tieBreakForm.team_b_id) }}</option></select></label>
          <button class="btn btn-outline-secondary" :disabled="busy || details.championship.phase !== 'group'" @click="resolveTie">Registrar desempate</button>
        </section>

        <section v-if="activeTab === 'players'" class="players-tab">
          <section class="admin-grid">
            <article class="surface-card admin-card">
              <div class="card-heading"><div><span class="section-kicker">Elenco</span><h2>Inscrever {{ registration.player_type === 'goalkeeper' ? 'goleiro' : 'jogador de linha' }}</h2></div><i :class="registration.player_type === 'goalkeeper' ? 'bi bi-shield-fill' : 'bi bi-person-plus'"></i></div>
              <p class="card-description">Adicione jogadores existentes e defina a Pedra de cada inscrição.</p>
              <div class="registration-type-switch" role="tablist" aria-label="Tipo de inscrição"><button type="button" :class="{ active: registration.player_type === 'field' }" @click="registration.player_type = 'field'">Jogadores de linha</button><button type="button" :class="{ active: registration.player_type === 'goalkeeper' }" @click="registration.player_type = 'goalkeeper'">Goleiros</button></div>
              <label>Jogador<select v-model.number="registration.player_id"><option :value="0">Selecione um jogador</option><option v-for="player in registrationPlayers" :key="player.id" :value="player.id">{{ player.name }} · {{ player.position }}</option></select></label>
              <label>{{ registration.player_type === 'goalkeeper' ? 'Pedra do goleiro' : 'Pedra do jogador de linha' }}<input v-model.number="registration.stone_group" type="number" min="1" max="5"></label>
              <label v-if="registration.player_type === 'field'">Classificação<input v-model.number="registration.stone_level" type="number" min="1.1" max="5.5" step="0.1" placeholder="Ex.: 2.3"></label>
              <label v-else>Equipe do goleiro<select v-model.number="registration.team_id"><option :value="0">Selecione uma equipe</option><option v-for="team in availableGoalkeeperTeams" :key="team.id" :value="team.id">{{ team.name }}</option></select></label>
              <p v-if="registration.player_type === 'goalkeeper'" class="helper-text">O goleiro será vinculado a uma única equipe no cadastro.</p>
              <button class="btn btn-red full" :disabled="busy || !registration.player_id || (registration.player_type === 'goalkeeper' && !registration.team_id)" @click="register">Inscrever jogador</button>
            </article>

            <article class="surface-card admin-card">
              <div class="card-heading"><div><span class="section-kicker">Participantes</span><h2>Vincular contas</h2></div><i class="bi bi-link-45deg"></i></div>
              <p class="card-description">Associe cada conta ao jogador correto para liberar a votação.</p>
              <div v-for="user in users" :key="user.id" class="user-link-row"><div><strong>{{ user.name }}</strong><small>{{ user.username }}</small></div><select :value="user.player_id || 0" @change="linkUser(user, $event)"><option :value="0">Sem vínculo</option><option v-for="player in availablePlayers" :key="player.id" :value="player.id">{{ player.name }}</option></select></div>
            </article>
          </section>

          <section class="surface-card admin-card enrolled-card">
            <div class="card-heading"><div><span class="section-kicker">Inscrições</span><h2>Jogadores do campeonato</h2><p class="card-description">Pesquise e filtre as inscrições existentes.</p></div><span class="pill-badge pill-muted">{{ filteredPlayers.length }} resultados</span></div>
            <div class="player-filters"><label>Pesquisar<input v-model="playerSearch" type="search" placeholder="Nome do jogador"></label><label>Equipe<select v-model="playerTeamFilter"><option value="all">Todas as equipes</option><option v-for="team in details.championship.teams" :key="team.id" :value="String(team.id)">{{ team.name }}</option></select></label><label>Pedra<select v-model="playerStoneFilter"><option value="all">Todas</option><option v-for="stone in [1, 2, 3, 4, 5]" :key="stone" :value="String(stone)">Pedra {{ stone }}</option></select></label><label>Tipo<select v-model="playerTypeFilter"><option value="all">Todos</option><option value="field">Linha</option><option value="goalkeeper">Goleiro</option></select></label></div>
            <div v-if="!filteredPlayers.length" class="empty-inline">Nenhuma inscrição encontrada.</div>
            <div v-else class="enrolled-list"><article v-for="item in filteredPlayers" :key="item.id" class="enrolled-player"><div class="player-mark"><i :class="item.type === 'goalkeeper' ? 'bi bi-shield-fill' : 'bi bi-person-fill'"></i></div><div class="player-main"><strong>{{ item.name }}</strong><small>{{ item.teamName || 'Sem equipe atribuída' }}</small></div><span class="stone-badge">{{ item.type === 'goalkeeper' ? `Goleiro · Pedra ${item.stoneGroup}` : `Pedra ${item.stoneGroup} · ${item.stoneLevel || '—'}` }}</span><span class="pill-badge" :class="item.teamName ? 'pill-ok' : 'pill-muted'">{{ item.teamName ? 'Atribuído' : 'Inscrito' }}</span></article></div>
          </section>

          <section class="surface-card admin-card goalkeeper-roster-card">
            <div class="card-heading"><div><span class="section-kicker">Goleiros</span><h2>Goleiros inscritos no campeonato</h2><p class="card-description">Cadastre cinco goleiros e vincule cada um a uma equipe.</p></div><span class="pill-badge pill-info">{{ goalkeeperPlayers.length }}/5</span></div>
            <div v-if="!goalkeeperPlayers.length" class="empty-inline">Nenhum goleiro inscrito ainda.</div>
            <div v-else class="goalkeeper-roster"><article v-for="player in goalkeeperPlayers" :key="player.id" class="goalkeeper-row"><div class="player-mark"><i class="bi bi-shield-fill"></i></div><div><strong>{{ player.name }}</strong><small>Pedra {{ player.stoneGroup }}</small></div><span class="pill-badge" :class="player.teamName ? 'pill-ok' : 'pill-muted'">{{ player.teamName || 'Sem equipe atribuída' }}</span></article></div>
          </section>
        </section>

        <section v-if="activeTab === 'teams'" class="surface-card admin-card formation-card">
          <div class="card-heading"><div><span class="section-kicker">Escalação</span><h2>Formação das equipes</h2><p class="card-description">Cada equipe recebe uma Pedra de cada grupo. O goleiro é definido no cadastro.</p></div><i class="bi bi-diagram-3"></i></div>
          <div class="team-list">
            <article v-for="team in details.championship.teams" :key="team.id" class="team-assignment-card">
                <div class="team-assignment-header">
                <div class="team-identity"><div class="team-crest"><img v-if="team.crest_url" :src="team.crest_url" :alt="`Brasão do ${team.name}`"><span v-else>{{ initials(team.name) }}</span></div><div><input v-model.trim="teamNameDraft[team.id]" class="team-name-input" :disabled="!canEditDraft"><span>{{ team.players?.length || 0 }} participantes</span></div></div>
                <div class="team-actions"><button class="btn btn-outline-secondary btn-sm" :disabled="busy || !canEditDraft || !teamNameDraft[team.id] || teamNameDraft[team.id] === team.name" @click="saveTeamName(team)"><i class="bi bi-check2"></i> Salvar nome</button><label class="crest-upload"><i class="bi bi-image"></i><span>{{ team.crest_url ? 'Substituir' : 'Enviar brasão' }}</span><input type="file" accept="image/png,image/jpeg,image/webp" :disabled="!canEditCrest" @change="uploadCrest(team, $event)"></label><button v-if="team.crest_url" type="button" class="btn btn-outline-danger btn-sm" :disabled="busy || !canEditCrest" @click="removeCrest(team)"><i class="bi bi-trash"></i> Remover</button></div>
              </div>
              <div class="stone-slots"><label v-for="group in [1, 2, 3, 4, 5]" :key="group" class="stone-slot"><span>Pedra {{ group }}</span><select v-model.number="assignment[team.id][group]" :disabled="!canEditDraft"><option :value="0">Selecionar jogador</option><option v-for="player in playersByGroup(group, team.id)" :key="player.id" :value="player.id">{{ player.player?.name || player.player_name }}</option></select></label></div>
              <div class="goalkeeper-slot"><div><span class="section-kicker">Goleiro da equipe</span><strong v-if="goalkeeperForTeam(team)">{{ playerName(goalkeeperForTeam(team)) }}</strong><strong v-else class="text-muted">Aguardando cadastro</strong></div><span v-if="goalkeeperForTeam(team)" class="stone-badge">Pedra {{ goalkeeperForTeam(team)?.stone_group }}</span><i class="bi bi-shield-fill" aria-hidden="true"></i></div>
            </article>
          </div>
          <div class="form-actions"><span class="helper-text">Vagas incompletas ou duplicadas serão recusadas ao salvar.</span><button class="btn btn-red" :disabled="busy || !canEditDraft" @click="saveAssignments">Salvar formação</button></div>
        </section>

        <section v-if="activeTab === 'matches'" class="matches-tab">
          <section class="surface-card admin-card workflow-card"><div class="card-heading"><div><span class="section-kicker">Fluxo</span><h2>Próximas ações</h2></div></div><div class="action-grid"><button class="workflow-action" :disabled="busy || details.matches.length > 0 || details.championship.status !== 'draft'" @click="generateFixtures"><i class="bi bi-calendar-plus"></i><span><strong>Gerar confrontos</strong><small>Cria os 10 jogos</small></span></button><button class="workflow-action" :disabled="busy || details.championship.status !== 'draft'" @click="startChampionship"><i class="bi bi-play-circle"></i><span><strong>Validar e iniciar</strong><small>Confirma a configuração</small></span></button><button class="workflow-action" :disabled="busy || !canGeneratePlayoffs" @click="generatePlayoffs"><i class="bi bi-signpost-split"></i><span><strong>Gerar eliminatórias</strong><small>Congela a classificação</small></span></button></div></section>
          <section class="surface-card admin-card matches-card match-operations-card"><div class="card-heading"><div><span class="section-kicker">Súmula digital</span><h2>Partidas e estatísticas</h2><p class="card-description">Abra uma partida para marcar participantes, MVP, gols, assistências e gol contra. O placar é calculado pelos eventos.</p></div><span class="pill-badge pill-muted">{{ finishedMatchesCount }}/{{ details.matches.length }} finalizadas</span></div><div v-if="!details.matches.length" class="empty-inline">Os confrontos ainda não foram gerados.</div><div v-else class="admin-match-list"><button v-for="match in details.matches" :key="match.id" type="button" class="admin-match-summary" :class="{ 'admin-match-summary--finished': match.status === 'finished' }" @click="openMatchEditor(match)"><span class="admin-match-summary-main"><small>{{ phaseLabel(match.phase) }} · rodada {{ match.round || '—' }}</small><strong>{{ match.home_team.name }} <b>{{ score(match) }}</b> {{ match.away_team.name }}</strong></span><span class="admin-match-summary-meta"><span class="pill-badge" :class="match.status === 'finished' ? 'pill-ok' : 'pill-info'">{{ match.status === 'finished' ? 'Finalizada' : 'Pendente' }}</span><small>{{ participationCount(match) }} participantes · {{ eventCount(match) }} eventos</small></span><i class="bi bi-chevron-right" aria-hidden="true"></i></button></div></section>
        </section>

        <section v-if="activeTab === 'awards'" class="surface-card admin-card awards-card"><div class="card-heading"><div><span class="section-kicker">Reconhecimento</span><h2>Premiações</h2></div><div class="button-row"><button class="btn btn-outline-secondary btn-sm" @click="loadAwards">Atualizar</button><button class="btn btn-outline-danger btn-sm" :disabled="busy || details.championship.status !== 'finished' || !canEndVoting" @click="endVoting"><i class="bi bi-stop-circle"></i> Encerrar votação</button><button class="btn btn-red btn-sm" :disabled="busy || details.championship.status !== 'finished' || canEndVoting" @click="publishAwards">Publicar resultados</button></div></div><div v-if="!awards.length" class="empty-inline">Nenhuma categoria carregada.</div><div v-for="award in awards" :key="award.id" class="award-row"><div><strong>{{ award.name }}</strong><small>{{ award.type === 'vote' ? (award.voting_open && !award.published ? 'Votação aberta' : 'Votação encerrada') : 'Estatística automática' }}</small><p v-if="award.description" class="award-description">{{ award.description }}</p><div v-for="result in award.results" :key="result.id">{{ result.winner?.player?.name || 'Resultado' }} — {{ result.votes }} votos ({{ result.percentage }}%)</div></div></div></section>
      </template>
    </template>

    <Teleport to="body">
      <div v-if="selectedMatch" class="championship-admin-modal-backdrop" role="presentation" @click.self="closeMatchEditor">
        <section ref="matchModalRef" class="championship-admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-match-title">
          <header class="admin-modal-header">
            <div>
              <span class="section-kicker">Súmula digital</span>
              <h2 id="admin-match-title">{{ selectedMatch.home_team.name }} <span aria-hidden="true">×</span> {{ selectedMatch.away_team.name }}</h2>
              <p class="card-description">Registre participantes, lances e o resultado desta partida.</p>
            </div>
            <button type="button" class="admin-modal-close" aria-label="Fechar súmula" @click="closeMatchEditor"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
          </header>
          <div class="admin-match-hero"><div><strong>{{ selectedMatch.home_team.name }}</strong><small>Casa</small></div><div class="admin-match-hero-score"><strong>{{ score(selectedMatch) }}</strong><span>{{ selectedMatch.status === 'finished' ? 'Finalizada' : selectedMatch.status === 'cancelled' ? 'Cancelada' : 'Pendente' }}</span><small>{{ phaseLabel(selectedMatch.phase) }} · rodada {{ selectedMatch.round || '—' }}</small></div><div><strong>{{ selectedMatch.away_team.name }}</strong><small>Fora</small></div></div>
          <div class="admin-match-editor-grid">
            <section class="admin-match-editor-section"><div class="form-section-heading"><div><strong>1. Participantes</strong><small>Elenco fixo: todos os jogadores dos dois times participam automaticamente.</small></div><span class="pill-badge pill-ok">{{ participationCount(selectedMatch) }} participantes</span></div><div class="admin-participant-list"><div v-for="player in matchPlayers(selectedMatch)" :key="player.id" class="admin-participant-option"><span class="admin-participant-check" aria-hidden="true"><i class="bi bi-check2"></i></span><span><strong>{{ player.player?.name || 'Jogador' }}</strong><small>{{ playerTeamName(selectedMatch, player) }}</small></span></div></div><div class="admin-match-editor-actions"><label class="mvp-select"><span>MVP da partida <small>opcional</small></span><select v-model.number="matchMvp[selectedMatch.id]" :disabled="busy || selectedMatch.status === 'finished'"><option :value="0">Selecione o MVP</option><optgroup :label="selectedMatch.home_team.name"><option v-for="player in selectedMatch.home_team.players || []" :key="`mvp-home-${player.id}`" :value="player.id">{{ player.player?.name || 'Jogador' }}</option></optgroup><optgroup :label="selectedMatch.away_team.name"><option v-for="player in selectedMatch.away_team.players || []" :key="`mvp-away-${player.id}`" :value="player.id">{{ player.player?.name || 'Jogador' }}</option></optgroup></select></label><button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy || selectedMatch.status === 'finished'" @click="saveParticipation(selectedMatch)"><i class="bi bi-check2"></i> Salvar MVP</button></div></section>
            <section class="admin-match-editor-section"><div class="form-section-heading"><div><strong>2. Eventos</strong><small>Registre gols, assistências e gols contra.</small></div><span class="pill-badge pill-info">{{ eventCount(selectedMatch) }} eventos</span></div><div class="admin-event-form"><label class="admin-event-field"><span>Equipe do lance</span><select v-model.number="eventForm[selectedMatch.id].team_id" :disabled="selectedMatch.status === 'finished'"><option :value="0">Selecione a equipe</option><option :value="selectedMatch.home_team.id">{{ selectedMatch.home_team.name }}</option><option :value="selectedMatch.away_team.id">{{ selectedMatch.away_team.name }}</option></select></label><label class="admin-event-field"><span>Autor do gol</span><select v-model.number="eventForm[selectedMatch.id].scorer_id" :disabled="selectedMatch.status === 'finished'"><option :value="0">Selecione o jogador</option><option v-for="player in eventPlayers(selectedMatch)" :key="player.id" :value="player.id">{{ player.player?.name }}</option></select></label><label class="admin-event-field"><span>Assistência <small>(opcional)</small></span><select v-model.number="eventForm[selectedMatch.id].assist_id" :disabled="selectedMatch.status === 'finished' || eventForm[selectedMatch.id].own_goal"><option :value="0">Sem assistência</option><option v-for="player in assistPlayers(selectedMatch)" :key="player.id" :value="player.id">{{ player.player?.name }}</option></select></label><label class="admin-event-field admin-event-field--minute"><span>Minuto</span><input v-model.number="eventForm[selectedMatch.id].minute" type="number" min="0" max="150" placeholder="Ex.: 42" :disabled="selectedMatch.status === 'finished'"></label><label class="own-goal-option"><input v-model="eventForm[selectedMatch.id].own_goal" type="checkbox" :disabled="selectedMatch.status === 'finished'"><span>Gol contra</span></label><button type="button" class="btn btn-red btn-sm" :disabled="busy || selectedMatch.status === 'finished'" @click="addEvent(selectedMatch)"><i class="bi bi-plus-lg"></i> Adicionar gol</button></div><div v-if="eventCount(selectedMatch)" class="admin-event-list"><div v-for="event in eventsForMatch(selectedMatch)" :key="event.id" class="admin-event-row"><div><strong>{{ event.minute ?? '—' }}' · {{ event.own_goal ? 'Gol contra' : eventPlayerName(selectedMatch, event, 'scorer') }}</strong><small v-if="!event.own_goal && event.assist_id">Assistência: {{ eventPlayerName(selectedMatch, event, 'assist') }}</small></div><div class="admin-event-row-actions"><label>Min<input v-model.number="eventDraft(event).minute" type="number" min="0" max="150" :disabled="selectedMatch.status === 'finished'"></label><label class="own-goal-option"><input v-model="eventDraft(event).own_goal" type="checkbox" :disabled="selectedMatch.status === 'finished'"><span>GC</span></label><button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy || selectedMatch.status === 'finished'" @click="updateEvent(selectedMatch, event)"><i class="bi bi-check2"></i></button><button type="button" class="btn btn-outline-danger btn-sm" :disabled="busy || selectedMatch.status === 'finished'" @click="removeEvent(selectedMatch, event)"><i class="bi bi-trash"></i></button></div></div></div><div v-else class="admin-event-empty"><i class="bi bi-bullseye" aria-hidden="true"></i><strong>Nenhum gol registrado</strong><span>Partida sem gols? Basta finalizar como 0 × 0.</span><small>Os jogadores já estão todos registrados como participantes.</small></div></section>
          </div>
          <div class="admin-match-editor-footer"><div><span class="section-kicker">Conferência</span><strong>{{ participationCount(selectedMatch) }} participantes · {{ eventCount(selectedMatch) }} eventos</strong><small v-if="selectedMatch.odds">Odds: Casa {{ formatOdd(selectedMatch.odds.home_odd) }} · Empate {{ formatOdd(selectedMatch.odds.draw_odd) }} · Fora {{ formatOdd(selectedMatch.odds.away_odd) }}</small></div><div class="button-row"><button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy" @click="calculateOdds(selectedMatch)"><i class="bi bi-graph-up-arrow"></i> {{ selectedMatch.odds ? 'Recalcular odds' : 'Calcular odds' }}</button><button v-if="selectedMatch.status !== 'finished'" type="button" class="btn btn-red" :disabled="busy" @click="finishMatch(selectedMatch)"><i class="bi bi-check2-circle"></i> Finalizar partida</button></div></div>
          <div v-if="selectedMatch.status !== 'finished' && selectedMatch.phase !== 'group' && selectedMatch.home_score !== null && selectedMatch.away_score !== null && selectedMatch.home_score === selectedMatch.away_score" class="penalty-editor"><span>Empate na eliminatória: informe os pênaltis antes de finalizar.</span><label>Casa<input v-model.number="selectedMatch.home_penalty_score" type="number" min="0"></label><label>Fora<input v-model.number="selectedMatch.away_penalty_score" type="number" min="0"></label></div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { ChampionshipService, type ChampionshipMatch, type ChampionshipMatchEvent, type ChampionshipPlayer, type ChampionshipTeam } from '../services/championshipService'
import { PlayerService } from '../services/playerService'
import type { Player } from '../types'

interface RegistrationForm { player_id: number; player_type: 'field' | 'goalkeeper'; stone_group: number; stone_level: number | null; team_id: number }
interface EventForm { scorer_id: number; assist_id: number; team_id: number; own_goal: boolean; minute: number | null }
interface EventEditForm { own_goal: boolean; minute: number | null }

const toast = useToast()
const championships = ref<Awaited<ReturnType<typeof ChampionshipService.list>>>([])
const details = ref<Awaited<ReturnType<typeof ChampionshipService.details>> | null>(null)
const selectedId = ref<number>()
const availablePlayers = ref<Player[]>([])
const users = ref<Awaited<ReturnType<typeof ChampionshipService.users>>>([])
const awards = ref<Awaited<ReturnType<typeof ChampionshipService.awards>>>([])
const newName = ref('')
const busy = ref(false)
const activeTab = ref('overview')
const isLoading = ref(true)
const loadError = ref('')
const playerSearch = ref('')
const playerTeamFilter = ref('all')
const playerStoneFilter = ref('all')
const playerTypeFilter = ref('all')
const teamNameDraft = reactive<Record<number, string>>({})
const assignment = reactive<Record<number, Record<number, number>>>({})
const matchParticipation = reactive<Record<number, number[]>>({})
const matchMvp = reactive<Record<number, number>>({})
const eventForm = reactive<Record<number, EventForm>>({})
const eventEditForm = reactive<Record<number, EventEditForm>>({})
const matchEvents = reactive<Record<number, ChampionshipMatchEvent[]>>({})
const selectedMatchId = ref<number | null>(null)
const matchModalRef = ref<HTMLElement | null>(null)
const tieBreakForm = reactive({ team_a_id: 0, team_b_id: 0, winner_id: 0 })
const registration = reactive<RegistrationForm>({ player_id: 0, player_type: 'field', stone_group: 1, stone_level: 1.1, team_id: 0 })
const tabs = [{ id: 'overview', label: 'Visão geral', meta: 'Resumo', icon: 'bi bi-grid-1x2' }, { id: 'players', label: 'Jogadores', meta: 'Inscrições e Pedras', icon: 'bi bi-people' }, { id: 'teams', label: 'Equipes', meta: 'Formação', icon: 'bi bi-diagram-3' }, { id: 'matches', label: 'Partidas', meta: 'Resultados', icon: 'bi bi-calendar2-week' }, { id: 'awards', label: 'Premiações', meta: 'Votação', icon: 'bi bi-award' }]

const statusLabel = computed(() => statusLabelFor(details.value?.championship.status))
const statusClass = computed(() => details.value?.championship.status === 'finished' ? 'pill-ok' : details.value?.championship.status === 'draft' ? 'pill-muted' : 'pill-info')
const canEditDraft = computed(() => details.value?.championship.status === 'draft')
const canEditCrest = computed(() => Boolean(details.value && details.value.championship.status !== 'finished'))
const canEndVoting = computed(() => awards.value.some((award) => award.type === 'vote' && !award.published && award.voting_open))
const metrics = computed(() => [{ label: 'Participantes', value: details.value?.championship.players?.length || 0, total: 30 }, { label: 'Partidas', value: details.value?.matches.length || 0, total: 14 }, { label: 'Equipes', value: details.value?.championship.teams.length || 0, total: 5 }])
const finishedMatchesCount = computed(() => details.value?.matches.filter((match) => match.status === 'finished').length || 0)
const selectedMatch = computed(() => details.value?.matches.find((match) => match.id === selectedMatchId.value) || null)
const canGeneratePlayoffs = computed(() => { const groupMatches = details.value?.matches.filter((match) => match.phase === 'group') || []; return details.value?.championship.phase === 'group' && groupMatches.length === 10 && groupMatches.every((match) => match.status === 'finished') && !details.value?.matches.some((match) => match.phase === 'semi_final') })
const registrationPlayers = computed(() => availablePlayers.value.filter((player) => registration.player_type === 'field' ? player.position === 'linha' : player.position === 'goleiro'))
const enrolledPlayers = computed(() => { const teams = new Map<number, ChampionshipTeam>(); (details.value?.championship.teams || []).forEach((team) => (team.players || []).forEach((player) => teams.set(player.id, team))); return (details.value?.championship.players || []).map((item) => ({ ...item, name: item.player?.name || `Jogador ${item.player_id}`, type: item.player_type, teamName: teams.get(item.id)?.name || '', teamId: teams.get(item.id)?.id || '', stoneGroup: item.stone_group, stoneLevel: item.stone_level })) })
const goalkeeperPlayers = computed(() => enrolledPlayers.value.filter((player) => player.type === 'goalkeeper'))
const availableGoalkeeperTeams = computed(() => (details.value?.championship.teams || []).filter((team) => !(team.players || []).some((player) => player.player_type === 'goalkeeper')))
const filteredPlayers = computed(() => enrolledPlayers.value.filter((item) => { const search = playerSearch.value.trim().toLowerCase(); return (!search || item.name.toLowerCase().includes(search)) && (playerTeamFilter.value === 'all' || String(item.teamId) === playerTeamFilter.value) && (playerStoneFilter.value === 'all' || String(item.stoneGroup) === playerStoneFilter.value) && (playerTypeFilter.value === 'all' || item.type === playerTypeFilter.value) }))

watch(() => registration.player_type, (type) => { registration.player_id = 0; registration.stone_level = type === 'field' ? 1.1 : null; registration.team_id = 0 })

const statusLabelFor = (status?: string) => ({ draft: 'Configuração', active: 'Em andamento', playoffs: 'Eliminatórias', finished: 'Encerrado' } as Record<string, string>)[status || ''] || 'Sem status'
const phaseLabel = (phase: string) => ({ group: 'Classificatória', semi_final: 'Semifinal', challenger_final: 'Final dos Desafiantes', final: 'Grande Final' } as Record<string, string>)[phase] || phase
const teamName = (id: number) => details.value?.championship.teams.find((team) => team.id === id)?.name || ''
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
const playerName = (player: ChampionshipPlayer) => player.player?.name || `Jogador ${player.player_id}`
const goalkeeperForTeam = (team: ChampionshipTeam) => (team.players || []).find((player) => player.player_type === 'goalkeeper')
const score = (match: ChampionshipMatch) => { if (match.home_score === null || match.away_score === null) return 'A definir'; const normal = `${match.home_score} × ${match.away_score}`; return match.home_score === match.away_score && match.home_penalty_score !== null && match.home_penalty_score !== undefined ? `${normal} (${match.home_penalty_score} × ${match.away_penalty_score} pen.)` : normal }
const formatOdd = (value: number) => Number(value || 0).toFixed(2)

const matchPlayers = (match: ChampionshipMatch) => [...(match.home_team.players || []), ...(match.away_team.players || [])]
const playerTeamName = (match: ChampionshipMatch, player: ChampionshipPlayer) => match.home_team.players?.some((item) => item.id === player.id) ? match.home_team.name : match.away_team.name
const eventsForMatch = (match: ChampionshipMatch) => matchEvents[match.id] || match.events || []
const eventCount = (match: ChampionshipMatch) => eventsForMatch(match).length
const participationCount = (match: ChampionshipMatch) => (matchParticipation[match.id] || match.participations?.map((item) => item.championship_player_id) || []).length
const eventPlayerName = (match: ChampionshipMatch, event: ChampionshipMatchEvent, type: 'scorer' | 'assist') => {
  const playerId = type === 'scorer' ? event.scorer_id : event.assist_id
  const relation = type === 'scorer' ? event.scorer : event.assist
  return relation?.name || matchPlayers(match).find((player) => player.id === playerId)?.player?.name || 'Jogador'
}
const selectedMatchPlayers = (match: ChampionshipMatch) => matchPlayers(match)
const eventPlayers = (match: ChampionshipMatch) => { const form = eventForm[match.id]; const teamId = Number(form?.team_id || 0); if (!teamId) return matchPlayers(match); const team = match.home_team.id === teamId ? match.home_team : match.away_team; return team.players || [] }
const assistPlayers = (match: ChampionshipMatch) => eventPlayers(match).filter((player) => player.id !== eventForm[match.id].scorer_id)
const eventDraft = (event: ChampionshipMatchEvent) => {
  if (!eventEditForm[event.id]) eventEditForm[event.id] = { minute: event.minute ?? null, own_goal: Boolean(event.own_goal) }
  return eventEditForm[event.id]
}
const isAssignedElsewhere = (playerId: number, teamId: number, group: number) => Object.entries(assignment).some(([id, groups]) => Number(id) !== teamId && Object.values(groups).includes(playerId)) || Object.entries(assignment[teamId] || {}).some(([slot, id]) => Number(slot) !== group && id === playerId)
const playersByGroup = (group: number, teamId: number) => (details.value?.championship.players || []).filter((player) => player.player_type === 'field' && player.stone_group === group && !isAssignedElsewhere(player.id, teamId, group))

const initializeMatchState = (match: ChampionshipMatch) => {
  if (!(match.id in eventForm)) eventForm[match.id] = { scorer_id: 0, assist_id: 0, team_id: 0, own_goal: false, minute: null }
  matchParticipation[match.id] = matchPlayers(match).map((player) => player.id)
  if (!(match.id in matchMvp)) matchMvp[match.id] = match.participations?.find((item) => item.mvp)?.championship_player_id || 0
  if (!(match.id in matchEvents)) matchEvents[match.id] = [...(match.events || [])]
  matchEvents[match.id].forEach((event) => eventDraft(event))
}
const resetMatchEditorState = () => {
  Object.keys(matchParticipation).forEach((key) => delete matchParticipation[Number(key)])
  Object.keys(matchMvp).forEach((key) => delete matchMvp[Number(key)])
  Object.keys(eventForm).forEach((key) => delete eventForm[Number(key)])
  Object.keys(eventEditForm).forEach((key) => delete eventEditForm[Number(key)])
  Object.keys(matchEvents).forEach((key) => delete matchEvents[Number(key)])
  selectedMatchId.value = null
}
const openMatchEditor = (match: ChampionshipMatch) => {
  initializeMatchState(match)
  selectedMatchId.value = match.id
  void nextTick(() => matchModalRef.value?.scrollTo({ top: 0, behavior: 'auto' }))
}
const closeMatchEditor = () => { selectedMatchId.value = null }

const loadDetails = async () => { if (!selectedId.value) { details.value = null; return }; details.value = await ChampionshipService.details(selectedId.value); details.value.championship.teams.forEach((team) => { teamNameDraft[team.id] = team.name; assignment[team.id] = assignment[team.id] || {}; (team.players || []).forEach((player) => { if (player.player_type === 'field' && player.stone_group) assignment[team.id][player.stone_group] = player.id }) }); details.value.matches.forEach(initializeMatchState) }
const loadAwards = async () => { awards.value = selectedId.value ? await ChampionshipService.awards(selectedId.value) : [] }
const selectChampionship = async (id: number) => { resetMatchEditorState(); selectedId.value = id; activeTab.value = 'overview'; await Promise.all([loadDetails(), loadAwards()]) }
const refresh = async () => { championships.value = await ChampionshipService.list(); if (!selectedId.value || !championships.value.some((item) => item.id === selectedId.value)) selectedId.value = championships.value[0]?.id; await Promise.all([loadDetails(), loadAwards()]) }
const loadInitialData = async () => { isLoading.value = true; loadError.value = ''; try { availablePlayers.value = await PlayerService.getAllPlayers(); users.value = await ChampionshipService.users(); await refresh() } catch (error) { console.error(error); loadError.value = 'Não foi possível carregar o painel de campeonatos.' } finally { isLoading.value = false } }

const createChampionship = async () => { busy.value = true; try { const created = await ChampionshipService.create(newName.value); newName.value = ''; selectedId.value = created.id; await refresh(); toast.success('Campeonato criado') } finally { busy.value = false } }
const register = async () => { busy.value = true; try { await ChampionshipService.registerPlayer(selectedId.value!, { player_id: registration.player_id, player_type: registration.player_type, stone_group: registration.stone_group, stone_level: registration.player_type === 'field' ? registration.stone_level : null, team_id: registration.player_type === 'goalkeeper' ? registration.team_id : null }); registration.player_id = 0; registration.team_id = 0; await loadDetails(); toast.success('Jogador inscrito') } finally { busy.value = false } }
const saveAssignments = async () => { const assignments = details.value!.championship.teams.map((team) => ({ team_id: team.id, championship_player_ids: [1, 2, 3, 4, 5].map((group) => assignment[team.id]?.[group]).filter(Boolean) })); if (assignments.some((item) => item.championship_player_ids.length !== 5)) return toast.error('Complete todas as vagas'); busy.value = true; try { await ChampionshipService.assignPlayers(selectedId.value!, assignments); await loadDetails(); toast.success('Formação salva') } finally { busy.value = false } }
const saveTeamName = async (team: ChampionshipTeam) => { const name = teamNameDraft[team.id]?.trim(); if (!name || name === team.name) return; busy.value = true; try { const updated = await ChampionshipService.updateTeam(team.id, name); team.name = updated.name; teamNameDraft[team.id] = updated.name; toast.success('Nome da equipe atualizado') } finally { busy.value = false } }
const uploadCrest = async (team: ChampionshipTeam, event: Event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; busy.value = true; try { const updated = await ChampionshipService.uploadCrest(team.id, file); Object.assign(team, updated); toast.success('Brasão atualizado') } finally { busy.value = false } }
const removeCrest = async (team: ChampionshipTeam) => { if (!confirm(`Remover o brasão de ${team.name}?`)) return; busy.value = true; try { const updated = await ChampionshipService.removeCrest(team.id); Object.assign(team, updated); toast.success('Brasão removido') } finally { busy.value = false } }
const generateFixtures = async () => { busy.value = true; try { await ChampionshipService.generateFixtures(selectedId.value!); await loadDetails(); toast.success('Confrontos gerados') } finally { busy.value = false } }
const startChampionship = async () => { busy.value = true; try { await ChampionshipService.start(selectedId.value!); await loadDetails(); toast.success('Campeonato iniciado') } finally { busy.value = false } }
const resolveTie = async () => { if (!tieBreakForm.team_a_id || !tieBreakForm.team_b_id || tieBreakForm.team_a_id === tieBreakForm.team_b_id || !tieBreakForm.winner_id) return toast.error('Selecione duas equipes diferentes e a vencedora do sorteio'); busy.value = true; try { await ChampionshipService.resolveTie(selectedId.value!, tieBreakForm); tieBreakForm.team_a_id = 0; tieBreakForm.team_b_id = 0; tieBreakForm.winner_id = 0; await loadDetails(); toast.success('Desempate registrado') } finally { busy.value = false } }
const generatePlayoffs = async () => { busy.value = true; try { await ChampionshipService.generatePlayoffs(selectedId.value!); await loadDetails(); toast.success('Eliminatórias geradas') } finally { busy.value = false } }
const persistParticipation = async (match: ChampionshipMatch) => {
  const players = matchPlayers(match).map((player) => player.id)
  matchParticipation[match.id] = players
  if (matchMvp[match.id] && !players.includes(matchMvp[match.id])) { toast.error('O MVP precisa participar da partida'); return false }
  await ChampionshipService.setParticipation(match.id, players, matchMvp[match.id])
  match.participations = players.map((id) => ({ championship_player_id: id, mvp: id === matchMvp[match.id] }))
  return true
}
const finishMatch = async (match: ChampionshipMatch) => {
  const participationSaved = await persistParticipation(match)
  if (!participationSaved) return
  const homeScore = Number(match.home_score ?? 0); const awayScore = Number(match.away_score ?? 0); const knockoutTie = match.phase !== 'group' && homeScore === awayScore
  if (knockoutTie && (match.home_penalty_score === null || match.home_penalty_score === undefined || match.away_penalty_score === null || match.away_penalty_score === undefined || match.home_penalty_score === match.away_penalty_score)) return toast.error('Informe uma disputa de pênaltis com vencedora')
  busy.value = true
  try { await ChampionshipService.updateMatch(match.id, { home_score: homeScore, away_score: awayScore, home_penalty_score: knockoutTie ? Number(match.home_penalty_score) : null, away_penalty_score: knockoutTie ? Number(match.away_penalty_score) : null, status: 'finished' }); await loadDetails(); toast.success('Partida finalizada'); closeMatchEditor() } finally { busy.value = false }
}
const saveParticipation = async (match: ChampionshipMatch) => { busy.value = true; try { if (await persistParticipation(match)) toast.success('Participação e MVP salvos') } finally { busy.value = false } }
const calculateOdds = async (match: ChampionshipMatch) => { busy.value = true; try { match.odds = await ChampionshipService.calculateOdds(match.id); toast.success('Odds informativas calculadas') } finally { busy.value = false } }
const addEvent = async (match: ChampionshipMatch) => {
  const form = eventForm[match.id]
  if (!form.team_id || (!form.scorer_id && !form.own_goal)) return toast.error('Informe a equipe e o autor do gol')
  if (form.own_goal && form.assist_id) return toast.error('Gol contra não pode ter assistência')
  busy.value = true
  try {
    if (!(await persistParticipation(match))) return
    const saved = await ChampionshipService.addEvent(match.id, { scorer_id: form.scorer_id || null, assist_id: form.assist_id || null, team_id: form.team_id, own_goal: form.own_goal, minute: form.minute }) as ChampionshipMatchEvent
    const event: ChampionshipMatchEvent = { ...saved, id: Number(saved.id || Date.now()), scorer_id: form.scorer_id || null, assist_id: form.assist_id || null, team_id: form.team_id, own_goal: form.own_goal, minute: form.minute }
    matchEvents[match.id] = [...eventsForMatch(match), event]
    Object.assign(form, { scorer_id: 0, assist_id: 0, team_id: 0, own_goal: false, minute: null })
    await loadDetails()
    toast.success('Gol registrado e placar recalculado')
  } finally { busy.value = false }
}
const updateEvent = async (match: ChampionshipMatch, event: ChampionshipMatchEvent) => {
  const draft = eventDraft(event)
  busy.value = true
  try {
    await ChampionshipService.updateEvent(event.id, { minute: draft.minute, own_goal: draft.own_goal })
    const current = eventsForMatch(match).find((item) => item.id === event.id)
    if (current) Object.assign(current, { minute: draft.minute, own_goal: draft.own_goal })
    await loadDetails()
    toast.success('Evento atualizado')
  } finally { busy.value = false }
}
const removeEvent = async (match: ChampionshipMatch, event: ChampionshipMatchEvent) => {
  if (!confirm('Remover este evento? O placar será recalculado.')) return
  busy.value = true
  try {
    await ChampionshipService.deleteEvent(event.id)
    matchEvents[match.id] = eventsForMatch(match).filter((item) => item.id !== event.id)
    delete eventEditForm[event.id]
    await loadDetails()
    toast.success('Evento removido')
  } finally { busy.value = false }
}
const endVoting = async () => { if (!selectedId.value || !canEndVoting.value || !confirm('Encerrar a votação para todas as categorias? Depois disso, nenhum novo voto será aceito.')) return; busy.value = true; try { awards.value = await ChampionshipService.endVoting(selectedId.value); toast.success('Votação encerrada para todas as categorias') } finally { busy.value = false } }
const publishAwards = async () => { busy.value = true; try { awards.value = await ChampionshipService.publishAwards(selectedId.value!); toast.success('Resultados publicados') } finally { busy.value = false } }
const linkUser = async (user: Awaited<ReturnType<typeof ChampionshipService.users>>[number], event: Event) => { busy.value = true; try { const playerId = Number((event.target as HTMLSelectElement).value) || null; Object.assign(user, await ChampionshipService.linkUserPlayer(user.id, playerId)); toast.success('Vínculo atualizado') } finally { busy.value = false } }
const handleKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape' && selectedMatchId.value !== null) closeMatchEditor() }

onMounted(() => { window.addEventListener('keydown', handleKeydown); void loadInitialData() })
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.championship-admin { container-type: inline-size; container-name: championship-admin; padding-top: 1.25rem; }
.state-card { display: flex; align-items: center; justify-content: center; gap: .75rem; min-height: 180px; padding: 2rem; }.state-card--error { color: #fca5a5; flex-wrap: wrap; }
.eyebrow, .section-kicker { display: block; color: var(--red-devils-hover); font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.create-card { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.25rem; margin-bottom: 1.25rem; }.create-card h2, .admin-card h2 { margin: .25rem 0; font-size: 1.15rem; }.create-card p, .admin-card p { margin: 0; color: var(--text-muted); }.create-form { display: flex; flex: 1 1 460px; gap: .6rem; max-width: 600px; }.create-form input { flex: 1; }
.championship-selector { display: flex; gap: .5rem; overflow-x: auto; margin-bottom: 1.25rem; padding-bottom: .25rem; }.selector-button { min-width: 150px; min-height: 52px; padding: .65rem .85rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: #171717; color: #fff; text-align: left; cursor: pointer; }.selector-button span, .selector-button small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.selector-button small { margin-top: .25rem; color: #d4d4d8; }.selector-button.active, .selector-button:hover { border-color: var(--red-devils); background: var(--red-devils); color: #fff; }
.module-tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; margin-bottom: 1.25rem; padding: .35rem; border: 1px solid var(--line-soft); border-radius: 1rem; background: rgba(255,255,255,.025); }.module-tab { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .1rem .55rem; min-height: 58px; padding: .65rem .75rem; border: 1px solid #3f3f46; border-radius: .75rem; background: #171717; color: #fff; text-align: left; cursor: pointer; }.module-tab i { grid-row: span 2; color: #fff; font-size: 1.1rem; }.module-tab span { color: #fff; font-weight: 750; font-size: .82rem; }.module-tab small { color: #d4d4d8; font-size: .68rem; }.module-tab.active, .module-tab:hover { border-color: var(--red-devils); background: var(--red-devils); color: #fff; }
.overview-grid { display: grid; grid-template-columns: minmax(240px, 1.7fr) repeat(3, 1fr); gap: .75rem; margin-bottom: 1.25rem; }.overview-main, .metric-card { min-height: 116px; padding: 1rem; }.overview-main { display: flex; align-items: center; justify-content: space-between; }.overview-main h2 { margin: .2rem 0 .55rem; }.overview-icon { color: var(--red-devils-hover); font-size: 2rem; }.metric-card { border: 1px solid var(--line-soft); border-radius: var(--radius-md); background: var(--surface); }.metric-card > span { color: var(--text-muted); font-size: .75rem; text-transform: uppercase; }.metric-card strong { display: block; margin-top: .3rem; font-size: 1.65rem; }.metric-card strong small { color: var(--text-muted); font-size: .85rem; }.progress-track { height: 4px; margin-top: .8rem; overflow: hidden; border-radius: 9px; background: var(--line-soft); }.progress-track span { display: block; height: 100%; border-radius: inherit; background: var(--red-devils); }
.admin-grid { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 1.25rem; }.admin-card { min-width: 0; margin-bottom: 1.25rem; padding: 1.15rem; }.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: .55rem; }.card-heading > i { color: var(--red-devils-hover); font-size: 1.35rem; }.admin-card label { display: block; margin: .85rem 0 .35rem; color: var(--text-muted); font-size: .75rem; font-weight: 700; }.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }.championship-admin input, .championship-admin select { width: 100%; min-height: 44px; padding: .65rem .75rem; border: 1px solid var(--line-strong); border-radius: .7rem; background: var(--surface-strong); color: var(--text-main); }.full { width: 100%; margin-top: 1rem; }.helper-text { color: var(--text-muted); font-size: .75rem; }
.user-link-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, .8fr); align-items: center; gap: .75rem; padding: .7rem 0; border-bottom: 1px solid var(--line-soft); }.user-link-row strong, .user-link-row small { display: block; }.user-link-row small { color: var(--text-muted); }.enrolled-card { margin-top: 1.25rem; }.player-filters { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: .65rem; margin: 1rem 0; padding: 1rem; border: 1px solid var(--line-soft); border-radius: .85rem; background: rgba(255,255,255,.025); }.player-filters label { margin: 0; }.enrolled-list { display: grid; gap: .35rem; }.enrolled-player { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: .75rem; padding: .75rem; border-bottom: 1px solid var(--line-soft); }.player-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: .65rem; background: var(--red-devils-soft); color: var(--red-devils-hover); }.player-main strong, .player-main small { display: block; }.player-main small { margin-top: .15rem; color: var(--text-muted); }.stone-badge { color: var(--text-muted); font-size: .78rem; white-space: nowrap; }
.registration-type-switch { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; margin: .85rem 0; }.registration-type-switch button { height: 42px; min-height: 42px; border: 1px solid #3f3f46; border-radius: .6rem; background: #171717; color: #fff; cursor: pointer; }.registration-type-switch button.active, .registration-type-switch button:hover { border-color: var(--red-devils); background: var(--red-devils); color: #fff; }.form-label-static { display: block; margin-bottom: .35rem; color: var(--text-muted); font-size: .72rem; font-weight: 400; }.goalkeeper-roster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }.goalkeeper-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .6rem; padding: .65rem; border: 1px solid var(--line-soft); border-radius: .7rem; }.goalkeeper-row strong, .goalkeeper-row small { display: block; }.goalkeeper-row small { margin-top: .15rem; color: var(--text-muted); font-size: .72rem; }
.team-list { display: grid; gap: .75rem; margin-top: 1rem; }.team-assignment-card { padding: 1rem; border: 1px solid var(--line-soft); border-radius: 1rem; background: rgba(255,255,255,.025); }.team-assignment-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }.team-identity { display: flex; align-items: center; gap: .75rem; min-width: 0; }.team-identity h3 { margin: 0; font-size: 1rem; }.team-identity span { display: block; color: var(--text-muted); font-size: .75rem; }.team-crest { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: .8rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-weight: 800; }.team-crest img { width: 100%; height: 100%; object-fit: cover; }.team-name-input { width: min(260px, 100%) !important; min-height: 34px !important; padding: .35rem .5rem !important; font-weight: 700; }.team-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .4rem; }.crest-upload { position: relative; display: inline-flex !important; align-items: center; gap: .4rem; margin: 0 !important; padding: .5rem .65rem; border: 1px solid var(--line-soft); border-radius: .6rem; cursor: pointer; }.crest-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }.stone-slots { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .55rem; }.stone-slot span { display: block; margin-bottom: .3rem; font-size: .7rem; }.form-actions, .match-meta, .match-tools { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-top: 1rem; }.tie-breaker-card { display: grid; gap: .2rem; }
.goalkeeper-slot { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-top: .8rem; padding: .75rem; border: 1px solid rgba(220, 38, 38, .35); border-radius: .75rem; background: rgba(220, 38, 38, .08); }.goalkeeper-slot strong { display: block; margin-top: .2rem; }.goalkeeper-slot > i { color: var(--red-devils-hover); font-size: 1.3rem; }
.action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; }.workflow-action { display: flex; gap: .6rem; min-height: 78px; padding: .8rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: transparent; color: var(--text-main); text-align: left; cursor: pointer; }.workflow-action i { color: var(--red-devils-hover); }.workflow-action span { display: grid; gap: .25rem; }.workflow-action small { color: var(--text-muted); font-size: .7rem; }.workflow-action:disabled { opacity: .4; cursor: not-allowed; }.admin-match { padding: 1rem 0; border-bottom: 1px solid var(--line-soft); }.match-teams { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: .75rem; font-weight: 700; }.match-teams span:last-child { text-align: right; }.match-teams strong { color: var(--red-devils-hover); }.penalty-editor { display: flex; align-items: center; flex-wrap: wrap; gap: .65rem; margin-top: .75rem; padding: .65rem; border: 1px solid rgba(250, 204, 21, .3); border-radius: .7rem; color: #facc15; font-size: .78rem; }.penalty-editor label { display: inline-flex; align-items: center; gap: .3rem; margin: 0; }.penalty-editor input { width: 58px !important; min-height: 34px !important; }.match-tools select { flex: 1; }.odds-summary { color: var(--text-muted); font-size: .75rem; }.participation-box { margin-top: .85rem; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; }.form-section-heading { display: flex; justify-content: space-between; gap: .75rem; margin-bottom: .5rem; }.form-section-heading small { color: var(--text-muted); font-size: .7rem; }.participant-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4rem .7rem; }.participant-option { display: flex; align-items: center; gap: .35rem; margin: 0 !important; font-size: .75rem; }.participant-option input { width: auto !important; min-height: auto !important; }.mvp-select { display: flex; align-items: center; gap: .5rem; margin: 0 !important; }.mvp-select select { width: auto; min-width: 180px; }.event-form { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .75rem; padding: .75rem; border: 1px solid var(--line-soft); border-radius: .75rem; }.event-form select { flex: 1 1 160px; }.event-form label { display: inline-flex; align-items: center; gap: .35rem; margin: 0; white-space: nowrap; }.event-form input { width: auto; min-height: auto; }.minute-field { flex-direction: column; align-items: stretch !important; }.minute-field input { width: 70px !important; min-height: 36px !important; }.own-goal-option { padding-top: .75rem; }.button-row { display: flex; gap: .5rem; }.award-row { display: flex; justify-content: space-between; gap: 1rem; padding: .8rem 0; border-bottom: 1px solid var(--line-soft); }.award-row small { display: block; color: var(--text-muted); }.empty-state { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: 3rem 1rem; text-align: center; color: var(--text-muted); }.empty-state i { color: var(--red-devils-hover); font-size: 2rem; }.empty-state h2 { color: var(--text-main); }.empty-inline { padding: .8rem 0; color: var(--text-muted); font-size: .85rem; }.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
@container championship-admin (max-width: 1100px) { .overview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.overview-main { grid-column: 1 / -1; }.action-grid { grid-template-columns: repeat(2, 1fr); } }
@container championship-admin (max-width: 800px) { .create-card, .form-actions, .team-assignment-header { align-items: stretch; flex-direction: column; }.create-form { max-width: none; }.admin-grid { grid-template-columns: 1fr; }.stone-slots { grid-template-columns: repeat(3, minmax(0, 1fr)); }.player-filters { grid-template-columns: 1fr 1fr; }.module-tabs { grid-template-columns: repeat(3, 1fr); }.team-actions { justify-content: flex-start; }.participant-grid { grid-template-columns: repeat(2, 1fr); } }
@container championship-admin (max-width: 560px) { .overview-grid { grid-template-columns: 1fr 1fr; }.overview-main { grid-column: 1 / -1; }.module-tabs { grid-template-columns: repeat(2, 1fr); }.module-tab { min-height: 52px; }.stone-slots { grid-template-columns: 1fr 1fr; }.player-filters, .enrolled-player { grid-template-columns: 1fr; }.enrolled-player { align-items: start; }.action-grid { grid-template-columns: 1fr; }.match-teams { gap: .35rem; font-size: .85rem; }.match-tools, .event-form { flex-direction: column; align-items: stretch; }.event-form select, .event-form button { width: 100%; }.award-row { flex-direction: column; }.form-section-heading { flex-direction: column; }.participant-grid { grid-template-columns: 1fr; }.mvp-select { flex-direction: column; align-items: stretch; }.mvp-select select { width: 100%; }.goalkeeper-roster { grid-template-columns: 1fr; } }
@container championship-admin (max-width: 380px) { .overview-grid { grid-template-columns: 1fr; }.overview-main { grid-column: auto; }.stone-slots, .form-row { grid-template-columns: 1fr; }.create-form { flex-direction: column; } }
.button-row { flex-wrap: wrap; justify-content: flex-end; }
.award-description { margin: .35rem 0 0; color: var(--text-muted); font-size: .78rem; line-height: 1.45; }
.championship-admin { padding-bottom: 2rem; }
.championship-admin .page-header { margin-bottom: 1rem; }
.championship-admin .surface-card { overflow: hidden; }
.create-card { padding: 1rem 1.1rem; }
.create-card h2, .admin-card h2 { line-height: 1.2; }
.module-tabs { position: sticky; top: .5rem; z-index: 12; backdrop-filter: blur(14px); }
.module-tab { min-width: 0; }
.admin-card { padding: 1rem; }
.overview-grid { grid-template-columns: minmax(250px, 1.6fr) repeat(3, minmax(120px, 1fr)); }
.overview-main, .metric-card { min-height: 104px; }
.player-filters input, .player-filters select { margin-top: .35rem; }
.team-assignment-card { overflow: hidden; }
.team-name-input { min-width: 0; }
.match-teams span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.match-meta span, .odds-summary { min-width: 0; overflow-wrap: anywhere; }
.workflow-action { min-width: 0; }
.match-operations-card { overflow: visible !important; }
.match-operations-card .card-heading { align-items: center; }
.admin-match-list { display: grid; gap: .55rem; max-height: 760px; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--red-devils) var(--surface-strong); }
.admin-match-summary { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 1rem; width: 100%; min-height: 76px; padding: .8rem .9rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: rgba(255, 255, 255, .02); color: var(--text-main); font: inherit; text-align: left; cursor: pointer; }
.admin-match-summary:hover, .admin-match-summary:focus-visible { border-color: var(--red-devils); background: var(--red-devils-soft); }
.admin-match-summary--finished { border-left: 3px solid #25a75a; }
.admin-match-summary-main, .admin-match-summary-meta { display: grid; min-width: 0; gap: .3rem; }
.admin-match-summary-main small, .admin-match-summary-meta small { color: var(--text-muted); font-size: .7rem; }
.admin-match-summary-main strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-match-summary-main strong b { margin: 0 .35rem; color: var(--red-devils-hover); }
.admin-match-summary-meta { justify-items: end; }
.admin-match-summary > i { color: var(--red-devils-hover); }
.championship-admin-modal-backdrop { position: fixed; inset: 0; z-index: 220; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(7, 3, 3, .8); backdrop-filter: blur(8px); }
.championship-admin-modal { width: min(100%, 980px); max-height: min(92vh, 900px); overflow-y: auto; padding: 1.2rem; border: 1px solid var(--line-strong); border-radius: 1rem; background: var(--surface); box-shadow: 0 24px 70px rgba(0, 0, 0, .55); }
.championship-admin-modal .section-toolbar { margin-bottom: .85rem; }
.championship-admin-modal h2 { margin: .2rem 0; }
.admin-modal-close { display: inline-grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--line-soft); border-radius: .6rem; background: transparent; color: var(--text-muted); cursor: pointer; }
.admin-modal-close:hover, .admin-modal-close:focus-visible { border-color: var(--red-devils); color: var(--text-main); }
.admin-match-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, auto) minmax(0, 1fr); align-items: center; gap: 1rem; padding: 1rem; border: 1px solid rgba(220, 38, 38, .3); border-radius: .85rem; background: linear-gradient(135deg, rgba(220, 38, 38, .1), rgba(255, 255, 255, .02)); }
.admin-match-hero > div { display: grid; gap: .2rem; min-width: 0; }
.admin-match-hero > div:last-child { text-align: right; }
.admin-match-hero strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-match-hero small { color: var(--text-muted); font-size: .7rem; }
.admin-match-hero-score { justify-items: center; text-align: center; }
.admin-match-hero-score strong { color: var(--red-devils-hover); font-size: 1.7rem; }
.admin-match-hero-score span { color: var(--text-muted); font-size: .72rem; }
.admin-match-editor-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: .8rem; margin-top: .8rem; }
.admin-match-editor-section { min-width: 0; padding: .85rem; border: 1px solid var(--line-soft); border-radius: .8rem; background: rgba(255, 255, 255, .02); }
.admin-match-editor-section .form-section-heading { align-items: flex-start; }
.admin-match-editor-section .form-section-heading > div { display: grid; gap: .2rem; }
.admin-match-editor-section .form-section-heading small { line-height: 1.4; }
.admin-participant-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); max-height: 440px; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--red-devils) var(--surface-strong); }
.admin-participant-option { display: flex; align-items: flex-start; gap: .5rem; min-width: 0; min-height: 44px; margin: 0 !important; padding: .55rem .35rem; border-bottom: 1px solid var(--line-soft); font-size: .76rem; }
.admin-participant-option input { width: auto !important; min-height: auto !important; margin-top: .15rem; accent-color: var(--red-devils); }
.admin-participant-option span { display: grid; min-width: 0; gap: .15rem; }
.admin-participant-option strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-participant-option small { color: var(--text-muted); font-size: .66rem; }
.admin-match-editor-actions { display: flex; align-items: end; justify-content: space-between; gap: .65rem; margin-top: .75rem; }
.admin-match-editor-actions .mvp-select { flex: 1; }
.admin-event-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.admin-event-form select, .admin-event-form .minute-field { min-width: 0; }
.admin-event-form .own-goal-option { display: flex; align-items: center; gap: .35rem; padding: .55rem .2rem; color: var(--text-muted); font-size: .72rem; }
.admin-event-form .own-goal-option input { width: auto; min-height: auto; }
.admin-event-form .btn { align-self: end; }
.admin-event-list { max-height: 480px; margin-top: .75rem; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--red-devils) var(--surface-strong); }
.admin-event-row { display: flex; align-items: center; justify-content: space-between; gap: .7rem; min-height: 54px; padding: .55rem 0; border-bottom: 1px solid var(--line-soft); }
.admin-event-row > div:first-child { display: grid; min-width: 0; gap: .15rem; }
.admin-event-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .76rem; }
.admin-event-row small { color: var(--text-muted); font-size: .67rem; }
.admin-event-row-actions { display: flex; align-items: end; gap: .35rem; }
.admin-event-row-actions label { display: grid; gap: .15rem; margin: 0; color: var(--text-muted); font-size: .62rem; }
.admin-event-row-actions input { width: 52px !important; min-height: 32px !important; padding: .35rem !important; }
.admin-event-row-actions .own-goal-option { display: flex; align-items: center; gap: .2rem; padding-bottom: .45rem; }
.admin-event-row-actions .own-goal-option input { width: auto !important; min-height: auto !important; }
.admin-match-editor-footer { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-top: .8rem; padding: .85rem 0 0; border-top: 1px solid var(--line-soft); }
.admin-match-editor-footer > div:first-child { display: grid; gap: .15rem; }
.admin-match-editor-footer > div:first-child strong { font-size: .8rem; }
.admin-match-editor-footer > div:first-child small { color: var(--text-muted); font-size: .7rem; }

@container championship-admin (max-width: 800px) {
  .module-tabs { display: flex; overflow-x: auto; justify-content: flex-start; }
  .module-tab { flex: 0 0 155px; }
  .overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .overview-main { grid-column: 1 / -1; }
}

@container championship-admin (max-width: 560px) {
  .create-card { align-items: stretch; }
  .create-form { flex-direction: column; max-width: none; }
  .create-form .btn { width: 100%; }
  .module-tabs { margin-right: -.25rem; padding-right: .25rem; }
  .module-tab { flex-basis: 145px; }
  .overview-grid { gap: .5rem; }
  .overview-main, .metric-card { min-height: 94px; padding: .75rem; }
  .metric-card strong { font-size: 1.35rem; }
  .team-assignment-header { align-items: stretch; }
  .team-actions { justify-content: flex-start; }
  .team-actions .btn, .team-actions .crest-upload { flex: 1 1 auto; }
  .form-actions, .match-meta, .match-tools { align-items: stretch; flex-direction: column; }
  .form-actions .btn, .match-meta .btn, .match-tools .btn { width: 100%; }
  .match-teams { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
  .match-teams strong { font-size: .85rem; }
  .player-filters { grid-template-columns: 1fr; padding: .75rem; }
  .enrolled-player { grid-template-columns: auto minmax(0, 1fr); }
  .enrolled-player .stone-badge, .enrolled-player .pill-badge { grid-column: 2; justify-self: start; }
}

@container championship-admin (max-width: 380px) {
  .overview-grid { grid-template-columns: 1fr 1fr; }
  .overview-main { grid-column: 1 / -1; }
  .admin-card { padding: .8rem; }
  .form-row, .stone-slots { grid-template-columns: 1fr; }
  .module-tab { flex-basis: 138px; }
}
@container championship-admin (max-width: 800px) {
  .admin-match-editor-grid { grid-template-columns: 1fr; }
  .admin-match-summary { grid-template-columns: minmax(0, 1fr) auto; }
  .admin-match-summary-meta { justify-items: start; }
  .admin-match-summary > i { grid-column: 2; grid-row: 1; }
}
@container championship-admin (max-width: 560px) {
  .championship-admin-modal-backdrop { align-items: end; padding: .5rem; }
  .championship-admin-modal { max-height: 94vh; padding: .85rem; border-radius: 1rem 1rem .75rem .75rem; }
  .admin-match-hero { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: .45rem; padding: .75rem; }
  .admin-match-hero-score strong { font-size: 1.35rem; }
  .admin-match-hero strong { font-size: .82rem; }
  .admin-participant-list { grid-template-columns: 1fr; max-height: 220px; }
  .admin-event-list { max-height: 240px; }
  .admin-event-form { grid-template-columns: 1fr; }
  .admin-event-form .btn { width: 100%; }
  .admin-match-editor-actions, .admin-match-editor-footer { align-items: stretch; flex-direction: column; }
  .admin-match-editor-actions .btn, .admin-match-editor-footer .btn { width: 100%; }
  .admin-event-row { align-items: flex-start; flex-direction: column; }
  .admin-event-row-actions { width: 100%; justify-content: flex-end; }
  .admin-match-summary { grid-template-columns: minmax(0, 1fr) auto; gap: .55rem; padding: .7rem; }
  .admin-match-list { max-height: 390px; }
  .admin-match-summary-main strong { white-space: normal; line-height: 1.35; }
  .admin-match-summary-meta small { font-size: .64rem; }
}
/* Ações do painel: contraste único e área de toque consistente. */
.championship-admin .selector-button,
.championship-admin .module-tab,
.championship-admin .registration-type-switch button,
.championship-admin .workflow-action,
.championship-admin .crest-upload,
.championship-admin .admin-match-summary,
.championship-admin-modal .admin-modal-close {
  background: #171717;
  border-color: #3f3f46;
  color: #fff;
}

.championship-admin .selector-button small,
.championship-admin .module-tab small,
.championship-admin .workflow-action small {
  color: #d4d4d8;
}

.championship-admin .selector-button.active,
.championship-admin .selector-button:hover,
.championship-admin .module-tab.active,
.championship-admin .module-tab:hover,
.championship-admin .registration-type-switch button.active,
.championship-admin .registration-type-switch button:hover,
.championship-admin .workflow-action:hover:not(:disabled),
.championship-admin .crest-upload:hover,
.championship-admin .admin-match-summary:hover,
.championship-admin .admin-match-summary:focus-visible {
  background: var(--red-devils);
  border-color: var(--red-devils);
  color: #fff;
}

.championship-admin .workflow-action i,
.championship-admin .module-tab i {
  color: #fff;
}

.championship-admin .crest-upload {
  height: 42px;
  min-height: 42px;
  padding: 0 .8rem;
  justify-content: center;
  font-size: .8rem;
  font-weight: 700;
}
.championship-admin-modal {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.championship-admin-modal .section-toolbar > div {
  min-width: 0;
}

.championship-admin-modal .admin-modal-close {
  width: 42px;
  height: 42px;
  min-width: 42px;
  flex: 0 0 42px;
  background: #171717;
  color: #fff;
}

.admin-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
  margin-bottom: .85rem;
}

.admin-modal-header > div {
  min-width: 0;
}

.admin-modal-header h2 {
  margin: .2rem 0;
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  line-height: 1.25;
}

.admin-modal-header .card-description {
  margin: 0;
  color: var(--text-muted);
  font-size: .78rem;
  line-height: 1.45;
}

.admin-match-hero {
  background: linear-gradient(135deg, rgba(220, 38, 38, .13), rgba(24, 26, 29, .96));
  border-color: rgba(220, 38, 38, .42);
}

.admin-match-editor-section {
  background: #181a1d;
  border-color: rgba(255, 255, 255, .1);
}

.admin-participant-list {
  max-height: 235px;
  padding: .2rem .35rem;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: .7rem;
  background: rgba(0, 0, 0, .16);
}

.admin-participant-option {
  border-color: rgba(255, 255, 255, .08);
  border-radius: .4rem;
}

.admin-participant-option:hover {
  background: rgba(220, 38, 38, .1);
}

.admin-participant-check {
  display: inline-grid;
  flex: 0 0 18px;
  place-items: center;
  width: 18px;
  height: 18px;
  margin-top: .05rem;
  border: 1px solid var(--red-devils);
  border-radius: .35rem;
  background: var(--red-devils);
  color: #fff;
  font-size: .72rem;
}

.admin-match-editor-actions {
  align-items: end;
}

.admin-match-editor-actions .mvp-select {
  display: grid;
  align-items: stretch;
  gap: .3rem;
}

.admin-match-editor-actions .mvp-select > span {
  color: var(--text-muted);
  font-size: .7rem;
  font-weight: 700;
}

.admin-match-editor-actions .mvp-select > span small {
  color: var(--text-muted);
  font-size: .65rem;
  font-weight: 500;
  text-transform: none;
}

.admin-match-editor-actions .mvp-select select {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  border-color: rgba(220, 38, 38, .42);
  background-color: #23252b;
  color: var(--text-main);
}

.admin-event-form {
  gap: .7rem;
  padding: .8rem;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: .75rem;
  background: rgba(0, 0, 0, .16);
}

.admin-event-field {
  display: grid;
  gap: .3rem;
  min-width: 0;
  margin: 0 !important;
  color: var(--text-muted);
  font-size: .7rem;
  font-weight: 700;
}

.admin-event-field > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-event-field > span small {
  color: var(--text-muted);
  font-size: .65rem;
  font-weight: 500;
  text-transform: none;
}

.admin-event-field select,
.admin-event-field input {
  margin: 0 !important;
  min-height: 42px;
}

.admin-event-field--minute input {
  text-align: center;
}

.admin-event-form .own-goal-option {
  align-self: end;
  min-height: 42px;
  margin: 0 !important;
  padding: .65rem .2rem;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: .6rem;
  background: rgba(255, 255, 255, .03);
  color: #fff;
}

.admin-event-form .own-goal-option input {
  margin: 0;
}

.admin-event-form > .btn {
  align-self: end;
  min-height: 42px;
}

.admin-event-empty {
  display: grid;
  place-items: center;
  min-height: 190px;
  gap: .35rem;
  padding: 1.25rem;
  border: 1px dashed rgba(255, 255, 255, .14);
  border-radius: .75rem;
  background: rgba(0, 0, 0, .12);
  color: var(--text-muted);
  text-align: center;
}

.admin-event-empty i {
  color: var(--red-devils-hover);
  font-size: 1.6rem;
}

.admin-event-empty strong {
  color: var(--text-main);
  font-size: .85rem;
}

.admin-event-empty span,
.admin-event-empty small {
  max-width: 32rem;
  font-size: .72rem;
  line-height: 1.45;
}

@media (max-width: 800px) {
  .admin-match-editor-grid {
    grid-template-columns: 1fr;
  }

  .admin-match-summary {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .admin-match-summary-meta {
    justify-items: start;
  }

  .admin-match-summary > i {
    grid-column: 2;
    grid-row: 1;
  }
}

/* O modal é teleportado para o body; estas regras precisam ser por viewport,
   não por container, para funcionar no celular. */
@media (max-width: 560px) {
  .championship-admin-modal-backdrop {
    align-items: flex-end;
    padding: .5rem;
    overflow: hidden;
  }

  .championship-admin-modal {
    width: 100%;
    max-height: calc(100dvh - 1rem);
    padding: .85rem;
    border-radius: 1rem 1rem .75rem .75rem;
  }

  .championship-admin-modal > .section-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: .6rem;
  }

  .championship-admin-modal > .section-toolbar .admin-modal-close {
    grid-column: 2;
    grid-row: 1;
  }

  .admin-match-hero {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: .45rem;
    padding: .75rem;
  }

  .admin-match-hero strong {
    white-space: normal;
    overflow-wrap: anywhere;
    font-size: .82rem;
  }

  .admin-match-hero-score strong {
    font-size: 1.35rem;
  }

  .admin-participant-list {
    grid-template-columns: 1fr;
    max-height: 220px;
  }

  .admin-event-list {
    max-height: 240px;
  }

  .admin-event-form {
    grid-template-columns: 1fr;
  }

  .admin-event-form > select,
  .admin-event-form > .minute-field,
  .admin-event-form > .own-goal-option,
  .admin-event-form > .btn {
    width: 100%;
  }

  .admin-event-form .btn {
    align-self: stretch;
  }

  .admin-match-editor-actions,
  .admin-match-editor-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .admin-match-editor-actions .btn,
  .admin-match-editor-footer .btn {
    width: 100%;
  }

  .admin-match-editor-footer .button-row {
    width: 100%;
    flex-direction: column;
  }

  .admin-event-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-event-row > div:first-child {
    width: 100%;
  }

  .admin-event-row-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

@media (max-width: 560px) {
  .championship-admin-modal > .admin-modal-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: .6rem;
  }

  .championship-admin-modal > .admin-modal-header .admin-modal-close {
    grid-column: 2;
    grid-row: 1;
  }

  .admin-participant-list {
    max-height: 220px;
  }

  .admin-event-list {
    max-height: 270px;
  }

  .admin-event-form > .admin-event-field,
  .admin-event-form > .own-goal-option,
  .admin-event-form > .btn {
    width: 100%;
  }

  .admin-event-empty {
    min-height: 160px;
  }
}
</style>
