<template>
  <section class="surface-card admin-card voter-admin-card">
    <div class="card-heading">
      <div>
        <span class="section-kicker">Acesso público</span>
        <h2>Cadastros de votação</h2>
        <p class="card-description">Corrija o jogador vinculado, redefina PINs e confira as categorias já votadas.</p>
      </div>
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading || busy" @click="loadVoters">Atualizar</button>
    </div>

    <div v-if="loading" class="empty-inline">Carregando cadastros...</div>
    <div v-else-if="!voters.length" class="empty-inline">Ainda não há cadastros simplificados para este campeonato.</div>
    <div v-else class="voter-admin-list">
      <article v-for="voter in voters" :key="voter.id" class="voter-admin-row">
        <div class="voter-admin-identity">
          <strong>{{ voter.player.name }}</strong>
          <small>{{ voter.player.nickname || 'Sem apelido' }} · {{ voter.categories_voted.length }} categorias votadas</small>
          <div v-if="voter.categories_voted.length" class="voter-category-tags">
            <span v-for="category in voter.categories_voted" :key="category.id">{{ category.name }}</span>
          </div>
          <small v-else>Nenhuma categoria votada</small>
        </div>
        <div class="voter-admin-controls">
          <label>
            <span>Jogador vinculado</span>
            <select v-model.number="playerSelections[voter.id]" :disabled="busy">
              <option v-for="player in participantOptions" :key="player.id" :value="player.id">{{ player.name }}</option>
            </select>
          </label>
          <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy || !playerSelections[voter.id] || playerSelections[voter.id] === voter.championship_player_id" @click="updateLink(voter)">Salvar vínculo</button>
          <label>
            <span>Novo PIN (6 dígitos)</span>
            <input v-model="pinDrafts[voter.id]" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="new-password" placeholder="••••••" :disabled="busy">
          </label>
          <button type="button" class="btn btn-outline-danger btn-sm" :disabled="busy || (pinDrafts[voter.id] || '').length !== 6" @click="resetPin(voter)">Redefinir PIN</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import {
  ChampionshipService,
  type ChampionshipPlayer,
  type ChampionshipVoterAdminRecord,
} from '../services/championshipService'

const props = defineProps<{
  championshipId: number
  participants: ChampionshipPlayer[]
}>()

const toast = useToast()
const voters = ref<ChampionshipVoterAdminRecord[]>([])
const loading = ref(false)
const busy = ref(false)
const playerSelections = ref<Record<number, number>>({})
const pinDrafts = ref<Record<number, string>>({})
const participantOptions = computed(() => props.participants.map((participant) => ({
  id: participant.id,
  name: `${participant.player?.name || `Jogador ${participant.player_id}`}${participant.player?.nickname ? ` · ${participant.player.nickname}` : ''}`,
})))

const loadVoters = async () => {
  loading.value = true
  try {
    voters.value = await ChampionshipService.championshipVoters(props.championshipId)
    playerSelections.value = Object.fromEntries(voters.value.map((voter) => [voter.id, voter.championship_player_id]))
  } finally {
    loading.value = false
  }
}

const updateLink = async (voter: ChampionshipVoterAdminRecord) => {
  const championshipPlayerId = playerSelections.value[voter.id]
  if (!championshipPlayerId || championshipPlayerId === voter.championship_player_id) return
  busy.value = true
  try {
    await ChampionshipService.linkChampionshipVoter(voter.id, championshipPlayerId)
    await loadVoters()
    toast.success('Vínculo do votante atualizado')
  } finally {
    busy.value = false
  }
}

const resetPin = async (voter: ChampionshipVoterAdminRecord) => {
  const pin = pinDrafts.value[voter.id] || ''
  if (!/^\d{6}$/.test(pin)) {
    toast.error('Informe um PIN numérico de 6 dígitos')
    return
  }
  busy.value = true
  try {
    await ChampionshipService.resetChampionshipVoterPin(voter.id, pin)
    pinDrafts.value[voter.id] = ''
    toast.success('PIN redefinido; o votante precisará se identificar novamente')
  } finally {
    busy.value = false
  }
}

watch(() => props.championshipId, () => { void loadVoters() }, { immediate: true })
</script>

<style scoped>
.voter-admin-card { display: grid; gap: .7rem; margin-top: 1rem; }
.voter-admin-card .card-heading { align-items: flex-start; }
.voter-admin-card .card-heading h2 { margin: .25rem 0; }
.voter-admin-list { display: grid; gap: .55rem; }
.voter-admin-row { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: .85rem; padding: .8rem; border: 1px solid var(--line-soft); border-radius: .75rem; background: rgba(255,255,255,.02); }
.voter-admin-identity { display: grid; align-content: start; gap: .2rem; min-width: 0; }
.voter-admin-identity strong { font-size: .86rem; }
.voter-admin-identity small { color: var(--text-muted); font-size: .7rem; }
.voter-category-tags { display: flex; flex-wrap: wrap; gap: .25rem; margin: .25rem 0; }
.voter-category-tags span { padding: .2rem .4rem; border: 1px solid var(--line-soft); border-radius: 999px; color: var(--text-muted); font-size: .64rem; }
.voter-admin-controls { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .5rem; align-items: end; }
.voter-admin-controls label { display: grid; gap: .25rem; color: var(--text-muted); font-size: .68rem; font-weight: 700; }
.voter-admin-controls input, .voter-admin-controls select { width: 100%; min-width: 0; min-height: 38px; padding: .45rem .55rem; border: 1px solid var(--line-strong); border-radius: .55rem; background: var(--surface-strong); color: var(--text-main); }
.voter-admin-controls .btn { min-height: 38px; white-space: nowrap; }
@media (max-width: 760px) { .voter-admin-row { grid-template-columns: 1fr; }.voter-admin-controls { grid-template-columns: 1fr; }.voter-admin-controls .btn { width: 100%; } }
</style>
