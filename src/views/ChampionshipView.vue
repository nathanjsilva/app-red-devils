<template>
  <section class="page-shell championship-page">
    <header class="page-header championship-header">
      <div>
        <span class="eyebrow">Campeonato</span>
        <h1 class="page-title">{{ details?.championship.name || 'Campeonatos' }}</h1>
        <p v-if="details" class="page-subtitle">
          <span class="pill-badge" :class="statusClass">{{ statusLabel }}</span>
          <span class="header-separator">{{ phaseLabel(details.championship.phase) }}</span>
        </p>
      </div>

      <label v-if="championships.length" class="championship-picker">
        <span>Temporada</span>
        <select v-model="selectedId" class="form-select" @change="loadDetails">
          <option v-for="item in championships" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
    </header>

    <div v-if="isLoading" class="surface-card state-card" role="status">
      <i class="bi bi-arrow-repeat spin" aria-hidden="true"></i>
      <span>Carregando campeonato...</span>
    </div>

    <div v-else-if="loadError" class="surface-card state-card state-card--error" role="alert">
      <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      <span>{{ loadError }}</span>
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="loadDetails">Tentar novamente</button>
    </div>

    <div v-else-if="!details" class="surface-card state-card empty-state">
      <i class="bi bi-trophy" aria-hidden="true"></i>
      <h2>Nenhum campeonato cadastrado</h2>
      <p>O painel público será preenchido depois que um administrador criar o primeiro campeonato.</p>
    </div>

    <template v-else>
      <article v-if="details.champion" class="surface-card champion-banner">
        <div class="team-crest team-crest--winner">
          <img v-if="details.champion.crest_url" :src="details.champion.crest_url" :alt="`Brasão do ${details.champion.name}`">
          <span v-else>{{ initials(details.champion.name) }}</span>
        </div>
        <div class="champion-copy">
          <span class="eyebrow">Campeão</span>
          <h2>{{ details.champion.name }}</h2>
          <p>Grande Final concluída</p>
          <small v-if="details.champion.campaign">
            {{ details.champion.campaign.points }} pontos · {{ details.champion.campaign.wins }} vitórias · saldo {{ details.champion.campaign.goal_difference }}
          </small>
        </div>
        <i class="bi bi-trophy-fill champion-icon" aria-hidden="true"></i>
      </article>

      <section class="championship-team-grid" aria-label="Equipes participantes">
        <article v-for="team in details.championship.teams" :key="team.id" class="surface-card team-card">
          <div class="team-crest">
            <img v-if="team.crest_url" :src="team.crest_url" :alt="`Brasão do ${team.name}`">
            <span v-else>{{ initials(team.name) }}</span>
          </div>
          <strong>{{ team.name }}</strong>
          <span class="team-caption">{{ team.players?.length || 0 }} participantes</span>
        </article>
      </section>

      <div class="championship-columns">
        <article class="surface-card panel-card">
          <div class="section-toolbar">
            <div>
              <span class="eyebrow">Fase atual</span>
              <h2 class="section-title mb-0">Classificação</h2>
            </div>
            <span class="pill-badge pill-info">{{ details.standings.length }} equipes</span>
          </div>
          <div class="table-wrap">
            <table class="data-table stack-mobile">
              <thead>
                <tr><th>#</th><th>Equipe</th><th>Pts</th><th>J</th><th title="Vitórias, empates e derrotas">V-E-D</th><th title="Gols marcados e sofridos">GM-GS</th><th>SG</th><th>Aprov.</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in details.standings" :key="row.team_id" :class="{ 'standings-leader': row.position === 1, 'standings-qualified': row.position <= 4 }">
                  <td data-label="#"><strong>{{ row.position }}</strong></td>
                  <td data-label="Equipe"><strong>{{ row.name }}</strong></td>
                  <td data-label="Pontos"><strong>{{ row.points }}</strong></td>
                  <td data-label="Jogos">{{ row.played }}</td>
                  <td data-label="Vitórias · Empates · Derrotas">{{ row.wins }} · {{ row.draws }} · {{ row.losses }}</td>
                  <td data-label="Gols marcados · sofridos">{{ row.goals_for }} · {{ row.goals_against }}</td>
                  <td data-label="Saldo">{{ row.goal_difference }}</td>
                  <td data-label="Aproveitamento">{{ row.win_rate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="table-note"><span class="qualification-dot"></span> Classificado para as eliminatórias</p>
          <p class="table-note">Desempate: pontos, vitórias, saldo, gols marcados, confronto direto e sorteio registrado.</p>
        </article>

        <article class="surface-card panel-card">
          <div class="section-toolbar">
            <div>
              <span class="eyebrow">Calendário</span>
              <h2 class="section-title mb-0">Partidas</h2>
            </div>
            <span class="pill-badge pill-muted">{{ details.matches.length }} jogos</span>
          </div>
          <div v-if="!details.matches.length" class="empty-inline">Nenhum confronto gerado ainda.</div>
          <div v-for="match in details.matches" :key="match.id" class="match-row">
            <span class="match-team">{{ match.home_team.name }}</span>
            <div class="match-score-box">
              <strong class="match-score" :class="{ pending: match.status !== 'finished' }">{{ score(match) }}</strong>
              <small>{{ match.status === 'finished' ? 'Finalizado' : 'Agendado' }} · {{ phaseLabel(match.phase) }}</small>
            </div>
            <span class="match-team match-team--away">{{ match.away_team.name }}</span>
            <div v-if="match.odds" class="odds-inline" :title="`Modelo ${match.odds.parameters?.model || 'informativo'}`">
              <span>Odds informativas</span>
              <strong>Casa {{ formatOdd(match.odds.home_odd) }} · Empate {{ formatOdd(match.odds.draw_odd) }} · Fora {{ formatOdd(match.odds.away_odd) }}</strong>
            </div>
          </div>
        </article>
      </div>

      <article class="surface-card panel-card bracket">
        <div class="section-toolbar">
          <div>
            <span class="eyebrow">Fase eliminatória</span>
            <h2 class="section-title mb-0">Chaveamento</h2>
          </div>
          <span class="text-muted small">Pênaltis decidem eliminatórias empatadas</span>
        </div>
        <div class="bracket-grid">
          <div v-for="phase in ['semi_final', 'challenger_final', 'final']" :key="phase" class="bracket-stage">
            <h3>{{ phaseLabel(phase) }}</h3>
            <div v-for="match in matchesByPhase(phase)" :key="match.id" class="bracket-match">
              <span>{{ match.home_team.name }}</span>
              <strong>{{ score(match) }}</strong>
              <span>{{ match.away_team.name }}</span>
            </div>
            <span v-if="!matchesByPhase(phase).length" class="empty-inline">Aguardando fase anterior</span>
          </div>
        </div>
      </article>

      <section class="championship-columns extra-panels">
        <article class="surface-card panel-card">
          <div class="section-toolbar">
            <div><span class="eyebrow">Desempenho</span><h2 class="section-title mb-0">Rankings</h2></div>
            <select v-model="phaseFilter" class="form-select compact-select" @change="loadRankings">
              <option value="all">Campeonato completo</option>
              <option value="group">Classificatória</option>
              <option value="semi_final">Semifinais</option>
              <option value="challenger_final">Final dos Desafiantes</option>
              <option value="final">Grande Final</option>
            </select>
          </div>
          <div class="ranking-columns">
            <div class="ranking-block"><h3>Artilharia</h3><RankingList :rows="rankings.scorers" value-label="gols" value-key="goals" /></div>
            <div class="ranking-block"><h3>Assistências</h3><RankingList :rows="rankings.assists" value-label="assistências" value-key="assists" /></div>
            <div class="ranking-block"><h3>MVP</h3><RankingList :rows="rankings.mvp" value-label="prêmios" value-key="mvp" /></div>
            <div class="ranking-block"><h3>Goleiros</h3><RankingList :rows="rankings.goalkeepers" value-label="SG sofridos" value-key="goals_conceded" :ascending="true" /></div>
          </div>
        </article>

        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Estatísticas</span><h2 class="section-title mb-0">Desempenho individual</h2></div><span class="text-muted small">Somente partidas válidas e finalizadas</span></div>
          <div class="table-wrap">
            <table class="data-table compact-table">
              <thead><tr><th>Jogador</th><th>J</th><th>V</th><th>G</th><th>A</th><th>PG</th><th>MVP</th><th v-if="hasGoalkeepers">GS / SG</th></tr></thead>
              <tbody>
                <tr v-for="row in statistics" :key="row.participant_id"><td><strong>{{ row.player.name }}</strong><small class="table-subline">{{ row.position === 'goalkeeper' ? 'Goleiro' : 'Linha' }}</small></td><td>{{ row.played }}</td><td>{{ row.wins }}</td><td>{{ row.goals }}</td><td>{{ row.assists }}</td><td>{{ row.goal_participations }}</td><td>{{ row.mvp }}</td><td v-if="hasGoalkeepers">{{ row.position === 'goalkeeper' ? `${row.goals_conceded} / ${row.clean_sheets}` : '—' }}</td></tr>
              </tbody>
            </table>
          </div>
          <div v-if="!statistics.length" class="empty-inline">As estatísticas aparecerão após os jogos finalizados.</div>
        </article>
      </section>

      <div class="championship-columns extra-panels">
        <article class="surface-card panel-card">
          <div class="section-toolbar"><div><span class="eyebrow">Reconhecimento</span><h2 class="section-title mb-0">Premiações</h2></div></div>
          <div v-for="award in awards" :key="award.id" class="award-block">
            <div class="ranking-row"><strong>{{ award.name }}</strong><span class="pill-badge" :class="award.type === 'vote' ? 'pill-info' : 'pill-muted'">{{ award.type === 'vote' ? 'Votação' : 'Automática' }}</span></div>
            <p v-if="award.description" class="award-description">{{ award.description }}</p>
            <div v-if="award.published" class="award-results"><div v-for="result in award.results" :key="result.id" class="ranking-row"><span>{{ result.winner?.player?.name || 'Resultado automático' }}</span><strong>{{ result.votes }} votos · {{ result.percentage }}%</strong></div></div>
            <div v-else-if="award.type === 'vote' && award.voting_open && isAuthenticated" class="candidate-list"><button v-for="candidate in award.candidates" :key="candidate.id" type="button" class="candidate-button" @click="vote(award.id, candidate.id)">{{ candidate.player?.name }}<i class="bi bi-check2" aria-hidden="true"></i></button></div>
            <p v-else-if="award.type === 'vote' && award.voting_open" class="award-status">Faça login com uma conta vinculada a um participante para votar.</p>
            <p v-else-if="award.type === 'vote'" class="award-status">Votação encerrada. O resultado será publicado pela organização.</p>
          </div>
          <div v-if="!awards.length" class="empty-inline">As premiações serão disponibilizadas ao longo do campeonato.</div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import { ChampionshipService, type ChampionshipMatch, type ChampionshipStatisticsRow } from '../services/championshipService'

const RankingList = defineComponent({
  props: {
    rows: { type: Array, default: () => [] },
    valueLabel: { type: String, required: true },
    valueKey: { type: String, required: true },
    ascending: { type: Boolean, default: false },
  },
  setup(props: { rows: ChampionshipStatisticsRow[]; valueLabel: string; valueKey: string; ascending: boolean }) {
    return () => h('div', {}, props.rows.slice(0, 5).map((row, index) => h('div', { class: 'ranking-row', key: row.participant_id }, [
      h('span', {}, [h('b', { class: 'ranking-position' }, String(index + 1)), row.player.name]),
      h('strong', {}, `${Number((row as unknown as Record<string, number>)[props.valueKey] || 0)} ${props.valueLabel}`),
    ])))
  },
})

const authStore = useAuthStore()
const toast = useToast()
const championships = ref<Awaited<ReturnType<typeof ChampionshipService.list>>>([])
const selectedId = ref<number>()
const details = ref<Awaited<ReturnType<typeof ChampionshipService.details>> | null>(null)
const rankings = ref<Awaited<ReturnType<typeof ChampionshipService.rankings>>>({ scorers: [], assists: [], mvp: [], goalkeepers: [] })
const statistics = ref<ChampionshipStatisticsRow[]>([])
const awards = ref<Awaited<ReturnType<typeof ChampionshipService.awards>>>([])
const phaseFilter = ref('all')
const isLoading = ref(true)
const loadError = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const hasGoalkeepers = computed(() => statistics.value.some((row) => row.position === 'goalkeeper'))

const statusLabel = computed(() => ({ draft: 'Configuração', active: 'Em andamento', playoffs: 'Eliminatórias', finished: 'Encerrado' } as Record<string, string>)[details.value?.championship.status || ''] || 'Sem status')
const statusClass = computed(() => details.value?.championship.status === 'finished' ? 'pill-ok' : details.value?.championship.status === 'draft' ? 'pill-muted' : 'pill-info')
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
const phaseLabel = (phase: string) => ({ draft: 'Configuração', group: 'Classificatória', playoffs: 'Eliminatórias', semi_final: 'Semifinal', challenger_final: 'Final dos Desafiantes', final: 'Grande Final', finished: 'Encerrado' } as Record<string, string>)[phase] || phase
const score = (match: ChampionshipMatch) => {
  if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return 'vs'
  const normal = `${match.home_score} × ${match.away_score}`
  return match.home_score === match.away_score && match.home_penalty_score !== null && match.home_penalty_score !== undefined
    ? `${normal} (${match.home_penalty_score} × ${match.away_penalty_score} pen.)`
    : normal
}
const formatOdd = (value: number) => Number(value || 0).toFixed(2)
const matchesByPhase = (phase: string) => details.value?.matches.filter((match) => match.phase === phase) || []

const loadRankings = async () => {
  if (!selectedId.value) return
  const [rankingData, statisticsData] = await Promise.all([
    ChampionshipService.rankings(selectedId.value, phaseFilter.value),
    ChampionshipService.statistics(selectedId.value, phaseFilter.value),
  ])
  rankings.value = rankingData
  statistics.value = statisticsData
}

const loadDetails = async () => {
  if (!selectedId.value) {
    details.value = null
    isLoading.value = false
    return
  }
  isLoading.value = true
  loadError.value = ''
  try {
    details.value = await ChampionshipService.details(selectedId.value)
    await Promise.all([loadRankings(), ChampionshipService.awards(selectedId.value).then((data) => { awards.value = data })])
  } catch (error) {
    console.error(error)
    loadError.value = 'Não foi possível carregar este campeonato.'
  } finally {
    isLoading.value = false
  }
}

const vote = async (categoryId: number, candidateId: number) => {
  if (!isAuthenticated.value) {
    toast.info('Faça login para votar.')
    return
  }
  try {
    await ChampionshipService.vote(categoryId, candidateId)
    toast.success('Voto registrado')
    if (selectedId.value) awards.value = await ChampionshipService.awards(selectedId.value)
  } catch {
    // O interceptor exibe a mensagem devolvida pela API.
  }
}

onMounted(async () => {
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
</script>

<style scoped>
.championship-page { container-type: inline-size; container-name: championship-page; padding-top: 1.5rem; }
.championship-header { align-items: flex-end; }
.eyebrow { display: block; color: var(--red-devils-hover); font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.header-separator { margin-left: .65rem; color: var(--text-muted); }
.championship-picker { width: min(100%, 250px); color: var(--text-muted); font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.championship-picker .form-select { margin-top: .35rem; }
.state-card { display: flex; align-items: center; justify-content: center; gap: .75rem; min-height: 180px; padding: 2rem; }
.state-card--error { color: #fca5a5; flex-wrap: wrap; }
.empty-state { flex-direction: column; text-align: center; color: var(--text-muted); }
.empty-state i { color: var(--red-devils-hover); font-size: 2rem; }
.empty-state h2 { color: var(--text-main); margin: 0; }
.empty-state p { max-width: 480px; margin: 0; }
.spin { animation: spin 1s linear infinite; color: var(--red-devils-hover); }
@keyframes spin { to { transform: rotate(360deg); } }
.champion-banner { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding: 1.15rem 1.25rem; border-color: rgba(250, 204, 21, .28); background: linear-gradient(135deg, rgba(250, 204, 21, .1), rgba(220, 38, 38, .06)); }
.champion-copy h2 { margin: .2rem 0; }
.champion-copy p, .champion-copy small { margin: 0; color: var(--text-muted); }
.champion-icon { margin-left: auto; color: #facc15; font-size: 1.6rem; }
.championship-team-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .75rem; margin-bottom: 1.25rem; }
.team-card { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .25rem .7rem; padding: .8rem; }
.team-card strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.team-caption { grid-column: 2; color: var(--text-muted); font-size: .72rem; }
.team-crest { display: grid; place-items: center; width: 42px; height: 42px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: .85rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-weight: 800; }
.team-crest--winner { width: 54px; height: 54px; border-radius: 1rem; }
.team-crest img { width: 100%; height: 100%; object-fit: cover; }
.championship-columns { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr); gap: 1.25rem; }
.panel-card { min-width: 0; padding: 1.1rem; }
.table-wrap { overflow-x: auto; }
.data-table th { background: var(--surface-muted); color: var(--text-muted); }
.compact-table { font-size: .8rem; }
.table-subline { display: block; color: var(--text-muted); font-size: .7rem; }
.standings-leader { background: rgba(250, 204, 21, .08); }
.standings-qualified td:first-child { border-left: 2px solid var(--red-devils); }
.table-note { margin: .85rem 0 0; color: var(--text-muted); font-size: .75rem; }
.qualification-dot { display: inline-block; width: .45rem; height: .45rem; margin-right: .35rem; border-radius: 50%; background: var(--red-devils); }
.match-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: .7rem; align-items: center; padding: .8rem 0; border-bottom: 1px solid var(--line-soft); }
.match-team { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.match-team--away { text-align: right; }
.match-score-box { min-width: 125px; text-align: center; }
.match-score { display: block; padding: .35rem .45rem; border: 1px solid var(--line-strong); border-radius: .6rem; }
.match-score.pending { color: var(--text-muted); font-size: .85rem; }
.match-score-box small { display: block; margin-top: .25rem; color: var(--text-muted); font-size: .68rem; }
.match-row .odds-inline { grid-column: 1 / -1; display: flex; justify-content: space-between; gap: .75rem; color: var(--text-muted); font-size: .7rem; }
.odds-inline strong { color: var(--text-main); font-weight: 600; }
.empty-inline { padding: 1rem 0; color: var(--text-muted); font-size: .85rem; }
.bracket { margin-top: 1.25rem; }
.bracket-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.bracket-stage h3 { margin: 0 0 .65rem; font-size: .85rem; }
.bracket-match { display: grid; gap: .25rem; padding: .75rem; margin-bottom: .55rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.025); font-size: .82rem; }
.bracket-match strong { color: var(--red-devils-hover); text-align: center; }
.extra-panels { margin-top: 1.25rem; }
.compact-select { width: auto; min-width: 160px; }
.ranking-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.ranking-block h3 { margin: .75rem 0 .35rem; font-size: .8rem; }
.ranking-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem 0; border-bottom: 1px solid var(--line-soft); }
.ranking-position { display: inline-grid; place-items: center; width: 1.5rem; height: 1.5rem; margin-right: .45rem; border-radius: .45rem; background: var(--red-devils-soft); color: var(--red-devils-hover); font-size: .75rem; }
.award-block { padding: .2rem 0 .75rem; border-bottom: 1px solid var(--line-soft); }
.award-description { margin: .45rem 0 0; color: var(--text-muted); font-size: .8rem; line-height: 1.45; }
.award-status { margin: .55rem 0 0; color: var(--text-muted); font-size: .78rem; }
.candidate-list { display: grid; gap: .45rem; margin-top: .5rem; }
.candidate-button { display: flex; align-items: center; justify-content: space-between; min-height: 42px; padding: .55rem .7rem; border: 1px solid var(--line-soft); border-radius: .65rem; background: transparent; color: var(--text-main); text-align: left; cursor: pointer; }
.candidate-button:hover, .candidate-button:focus-visible { border-color: var(--red-devils); background: var(--red-devils-soft); }
.candidate-button i { color: var(--red-devils-hover); }
@media (max-width: 1050px) { .championship-team-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .championship-page { padding-top: .75rem; }.championship-header { align-items: stretch; }.championship-picker { width: 100%; }.championship-team-grid, .championship-columns, .bracket-grid { grid-template-columns: 1fr; }.champion-banner { align-items: flex-start; }.champion-icon { font-size: 1.25rem; }.compact-select { width: 100%; }.ranking-columns { grid-template-columns: 1fr; }.section-toolbar { gap: .65rem; } }
@media (max-width: 420px) { .championship-team-grid { grid-template-columns: 1fr 1fr; }.team-card { padding: .65rem; }.team-caption { display: none; }.team-crest { width: 36px; height: 36px; }.champion-banner { padding: .9rem; }.champion-copy h2 { font-size: 1.15rem; }.match-row { grid-template-columns: 1fr auto 1fr; gap: .35rem; }.match-score-box { min-width: 84px; }.match-row .odds-inline { flex-direction: column; } }
@container championship-page (max-width: 1100px) { .championship-team-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.championship-columns { grid-template-columns: 1fr; }.bracket-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container championship-page (max-width: 640px) { .championship-team-grid, .championship-columns, .bracket-grid { grid-template-columns: 1fr; }.championship-header { align-items: stretch; }.championship-picker { width: 100%; }.compact-select { width: 100%; } }
@container championship-page (max-width: 420px) { .championship-team-grid { grid-template-columns: 1fr 1fr; } }
</style>
