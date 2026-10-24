<template>
  <article class="surface-card panel-card voter-panel">
    <div class="section-toolbar">
      <div>
        <span class="eyebrow">Votação segura</span>
        <h2 class="section-title mb-0">Identificação do votante</h2>
      </div>
      <span v-if="session" class="pill-badge pill-ok">{{ session.voter.player.name }}</span>
    </div>

    <p class="voter-note">Escolha seu nome e use um PIN de 6 dígitos. Este cadastro serve apenas para votar e não verifica a identidade real do participante.</p>
    <p v-if="!championshipFinished" class="voter-locked-note">A votação está bloqueada até o encerramento do campeonato. Você pode fazer seu cadastro desde já.</p>

    <div v-if="!session" class="voter-form">
      <div class="voter-mode-switch" role="tablist" aria-label="Acesso à votação">
        <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">Cadastrar para votar</button>
        <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">Já tenho cadastro</button>
      </div>

      <label class="voter-field">
        <span>Seu nome no campeonato</span>
        <select v-model.number="championshipPlayerId" :disabled="loadingPlayers || busy">
          <option :value="0">Selecione seu nome</option>
          <option v-for="player in players" :key="player.id" :value="player.id">{{ player.name }}{{ player.nickname ? ` · ${player.nickname}` : '' }}</option>
        </select>
      </label>
      <label class="voter-field">
        <span>PIN numérico de 6 dígitos</span>
        <input v-model="pin" type="password" inputmode="numeric" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" maxlength="6" pattern="[0-9]{6}" placeholder="••••••">
      </label>
      <label v-if="mode === 'register'" class="voter-field">
        <span>Confirme o PIN</span>
        <input v-model="pinConfirmation" type="password" inputmode="numeric" autocomplete="new-password" maxlength="6" pattern="[0-9]{6}" placeholder="••••••">
      </label>
      <button type="button" class="btn btn-red" :disabled="busy || !championshipPlayerId || pin.length !== 6 || (mode === 'register' && pin !== pinConfirmation)" @click="submitAccess">
        <i :class="mode === 'register' ? 'bi bi-person-check' : 'bi bi-box-arrow-in-right'" aria-hidden="true"></i>
        {{ busy ? 'Aguarde...' : mode === 'register' ? 'Criar cadastro e continuar' : 'Entrar para votar' }}
      </button>
    </div>

    <div v-else class="voter-session">
      <div class="voter-session-heading">
        <p>Você está identificado como <strong>{{ session.voter.player.name }}</strong>.</p>
        <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy" @click="logout">Sair</button>
      </div>
      <div class="voter-category-list">
        <article v-for="award in votingAwards" :key="award.id" class="voter-category">
          <div>
            <strong>{{ award.name }}</strong>
            <span class="pill-badge voter-award-tone" :class="`voter-award-tone--${awardTone(award.name)}`">{{ awardToneLabel(award.name) }}</span>
            <p v-if="award.description" class="voter-award-description">{{ award.description }}</p>
            <small v-if="hasVoted(award.id)" class="voter-complete"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Voto realizado</small>
            <small v-else-if="!championshipFinished">Votação bloqueada até o encerramento do campeonato</small>
            <small v-else-if="!award.voting_open || award.published">Votação encerrada</small>
            <small v-else>Escolha uma pessoa nesta categoria</small>
          </div>
          <template v-if="championshipFinished && award.voting_open && !award.published && !hasVoted(award.id)">
            <select v-model.number="candidateSelections[award.id]" :aria-label="`Candidato para ${award.name}`">
              <option :value="0">Selecione um participante</option>
              <option v-for="candidate in candidatesFor(award)" :key="candidate.id" :value="candidate.id">{{ candidate.player?.name || `Participante #${candidate.id}` }}</option>
            </select>
            <button type="button" class="btn btn-red btn-sm" :disabled="busy || !candidateSelections[award.id]" @click="vote(award.id)">Registrar voto</button>
          </template>
        </article>
      </div>
      <p v-if="!votingAwards.length" class="empty-inline">As categorias de votação ainda não estão disponíveis.</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { championshipAwardTone, championshipAwardToneLabel } from '../utils/championshipAwardTone'
import {
  ChampionshipService,
  type ChampionshipAward,
  type ChampionshipVoterPlayerOption,
  type ChampionshipVoterStatus,
} from '../services/championshipService'

const props = defineProps<{
  championshipId: number
  championshipFinished: boolean
  awards: ChampionshipAward[]
}>()

const toast = useToast()
const mode = ref<'register' | 'login'>('register')
const players = ref<ChampionshipVoterPlayerOption[]>([])
const championshipPlayerId = ref(0)
const pin = ref('')
const pinConfirmation = ref('')
const token = ref('')
const session = ref<ChampionshipVoterStatus | null>(null)
const candidateSelections = ref<Record<number, number>>({})
const busy = ref(false)
const loadingPlayers = ref(false)
const storageKey = `red-devils:championship-voter:${props.championshipId}`
const votingAwards = computed(() => props.awards.filter((award) => award.type === 'vote'))
const awardTone = (name: string) => championshipAwardTone(name)
const awardToneLabel = (name: string) => championshipAwardToneLabel(awardTone(name))

const hasVoted = (awardId: number) => Boolean(session.value?.categories.find((category) => category.id === awardId)?.has_voted)
const candidatesFor = (award: ChampionshipAward) => (award.candidates || [])
  .filter((candidate) => candidate.id !== session.value?.voter.championship_player_id)
  .filter((candidate) => !award.name.toLocaleLowerCase().includes('xerif') || ['defensor', 'zagueiro', 'fixo', 'ala'].includes((candidate.sport_position || '').toLocaleLowerCase()))

const loadStatus = async () => {
  if (!token.value) return
  try {
    session.value = await ChampionshipService.voterStatus(props.championshipId, token.value)
  } catch (error: any) {
    if (error?.response?.status === 401) clearSession()
  }
}

const saveSession = async (newToken: string) => {
  token.value = newToken
  sessionStorage.setItem(storageKey, newToken)
  pin.value = ''
  pinConfirmation.value = ''
  await loadStatus()
}

const submitAccess = async () => {
  if (!championshipPlayerId.value || pin.value.length !== 6 || (mode.value === 'register' && pin.value !== pinConfirmation.value)) {
    toast.error('Selecione seu nome e confira o PIN de 6 dígitos')
    return
  }
  busy.value = true
  try {
    const response = mode.value === 'register'
      ? await ChampionshipService.registerVoter(props.championshipId, championshipPlayerId.value, pin.value)
      : await ChampionshipService.loginVoter(props.championshipId, championshipPlayerId.value, pin.value)
    await saveSession(response.token)
    toast.success(mode.value === 'register' ? 'Cadastro criado' : 'Identificação concluída')
  } finally {
    busy.value = false
  }
}

const vote = async (categoryId: number) => {
  const candidateId = candidateSelections.value[categoryId]
  if (!token.value || !candidateId) return
  busy.value = true
  try {
    await ChampionshipService.voteAsVoter(categoryId, candidateId, token.value)
    candidateSelections.value[categoryId] = 0
    await loadStatus()
    toast.success('Voto registrado')
  } finally {
    busy.value = false
  }
}

const clearSession = () => {
  token.value = ''
  session.value = null
  sessionStorage.removeItem(storageKey)
}

const logout = async () => {
  if (token.value) {
    busy.value = true
    try {
      await ChampionshipService.logoutVoter(props.championshipId, token.value)
    } finally {
      busy.value = false
      clearSession()
    }
    return
  }
  clearSession()
}

onMounted(async () => {
  loadingPlayers.value = true
  try {
    players.value = await ChampionshipService.voterPlayers(props.championshipId)
    const savedToken = sessionStorage.getItem(storageKey)
    if (savedToken) {
      token.value = savedToken
      await loadStatus()
    }
  } finally {
    loadingPlayers.value = false
  }
})
</script>

<style scoped>
.voter-panel { display: grid; gap: .85rem; }
.voter-note { margin: -.45rem 0 0; color: var(--text-muted); font-size: .78rem; line-height: 1.5; }
.voter-locked-note { margin: 0; padding: .65rem .75rem; border: 1px solid var(--line-soft); border-radius: .6rem; color: var(--text-main); background: rgba(255,255,255,.03); font-size: .78rem; line-height: 1.5; }
.voter-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; align-items: end; }
.voter-mode-switch { display: flex; gap: .35rem; grid-column: 1 / -1; padding: .25rem; border: 1px solid var(--line-soft); border-radius: .7rem; }
.voter-mode-switch button { flex: 1; min-height: 38px; padding: .4rem .65rem; border: 0; border-radius: .5rem; background: transparent; color: var(--text-muted); font: inherit; font-size: .78rem; font-weight: 750; }
.voter-mode-switch button.active { background: var(--red-devils); color: #fff; }
.voter-field { display: grid; gap: .3rem; color: var(--text-muted); font-size: .73rem; font-weight: 700; }
.voter-field input, .voter-field select, .voter-category select { width: 100%; min-width: 0; min-height: 42px; padding: .5rem .65rem; border: 1px solid var(--line-strong); border-radius: .6rem; background: var(--surface-strong); color: var(--text-main); }
.voter-form > .btn { min-height: 42px; }
.voter-session { display: grid; gap: .65rem; }
.voter-session-heading { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.voter-session-heading p { margin: 0; color: var(--text-muted); font-size: .82rem; }
.voter-session-heading strong { color: var(--text-main); }
.voter-category-list { display: grid; gap: .5rem; }
.voter-category { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, .8fr) auto; gap: .6rem; align-items: center; padding: .65rem; border: 1px solid var(--line-soft); border-radius: .7rem; background: rgba(255,255,255,.02); }
.voter-category > div { display: grid; gap: .25rem; min-width: 0; }
.voter-category > div strong { font-size: .8rem; }
.voter-category small { color: var(--text-muted); font-size: .69rem; }
.voter-award-tone { justify-self: start; padding: .15rem .4rem; font-size: .62rem; }
.voter-award-tone--positive { background: rgba(34, 197, 94, .16); color: #4ade80; }
.voter-award-tone--negative { background: rgba(220, 38, 38, .18); color: #f87171; }
.voter-award-tone--humorous { background: rgba(250, 204, 21, .15); color: #facc15; }
.voter-award-description { margin: 0; color: var(--text-muted); font-size: .7rem; line-height: 1.45; }
.voter-category .voter-complete { color: #86efac; }
@media (max-width: 680px) { .voter-form { grid-template-columns: 1fr; }.voter-category { grid-template-columns: 1fr; }.voter-category .btn { width: 100%; } }
</style>
