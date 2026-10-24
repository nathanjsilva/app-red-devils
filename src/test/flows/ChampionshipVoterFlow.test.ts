import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminChampionshipVoters from '../../components/AdminChampionshipVoters.vue'
import ChampionshipVoterPanel from '../../components/ChampionshipVoterPanel.vue'
import { championshipAwardTone } from '../../utils/championshipAwardTone'
import { championshipOddsAreStale } from '../../utils/championshipOddsFreshness'
import type { ChampionshipMatch } from '../../services/championshipService'

const dependencies = vi.hoisted(() => ({
  service: {
    voterPlayers: vi.fn(),
    registerVoter: vi.fn(),
    loginVoter: vi.fn(),
    voterStatus: vi.fn(),
    logoutVoter: vi.fn(),
    voteAsVoter: vi.fn(),
    championshipVoters: vi.fn(),
    linkChampionshipVoter: vi.fn(),
    resetChampionshipVoterPin: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../services/championshipService', () => ({ ChampionshipService: dependencies.service }))
vi.mock('vue-toastification', () => ({ useToast: () => dependencies.toast }))

const voterStatus = (hasVoted = false) => ({
  voter: { championship_player_id: 11, player: { name: 'Ana Jogadora', nickname: 'Ana' } },
  categories: [{ id: 31, name: 'Bola de Ouro', type: 'vote' as const, voting_open: true, published: false, has_voted: hasVoted }],
})

describe('fluxo público de votação por PIN', () => {
  beforeEach(() => {
    sessionStorage.clear()
    dependencies.service.voterPlayers.mockResolvedValue([{ id: 11, name: 'Ana Jogadora', nickname: 'Ana', player_type: 'field' }])
    dependencies.service.registerVoter.mockResolvedValue({ token: 'token-sessao', voter: voterStatus().voter })
    dependencies.service.loginVoter.mockResolvedValue({ token: 'token-sessao', voter: voterStatus().voter })
    dependencies.service.voterStatus.mockResolvedValue(voterStatus())
    dependencies.service.voteAsVoter.mockResolvedValue({ id: 1 })
  })

  it('cadastra, recupera o status e marca a categoria após votar', async () => {
    dependencies.service.voterStatus
      .mockResolvedValueOnce(voterStatus())
      .mockResolvedValueOnce(voterStatus(true))
    const wrapper = mount(ChampionshipVoterPanel, {
      props: {
        championshipId: 7,
        championshipFinished: true,
        awards: [{
          id: 31,
          name: 'Bola de Ouro',
          description: 'Considere regularidade, impacto e contribuição para a equipe.',
          type: 'vote',
          published: false,
          voting_open: true,
          candidates: [
            { id: 11, player_id: 101, player_type: 'field', stone_group: 1, player: { id: 101, name: 'Ana Jogadora' } },
            { id: 12, player_id: 102, player_type: 'field', stone_group: 2, player: { id: 102, name: 'Bia Jogadora' } },
          ],
        }],
      },
    })
    await flushPromises()

    await wrapper.get('select').setValue(11)
    const pinFields = wrapper.findAll('input[type="password"]')
    await pinFields[0].setValue('123456')
    await pinFields[1].setValue('123456')
    await wrapper.get('button.btn-red').trigger('click')
    await flushPromises()

    expect(dependencies.service.registerVoter).toHaveBeenCalledWith(7, 11, '123456')
    expect(wrapper.text()).toContain('Considere regularidade, impacto e contribuição para a equipe.')
    expect(sessionStorage.getItem('red-devils:championship-voter:7')).toBe('token-sessao')
    expect(dependencies.service.voterStatus).toHaveBeenCalledWith(7, 'token-sessao')

    await wrapper.get('select[aria-label="Candidato para Bola de Ouro"]').setValue(12)
    await wrapper.get('.voter-category button.btn-red').trigger('click')
    await flushPromises()

    expect(dependencies.service.voteAsVoter).toHaveBeenCalledWith(31, 12, 'token-sessao')
    expect(wrapper.text()).toContain('Voto realizado')
  })

  it('recupera um cadastro existente usando nome e PIN', async () => {
    const wrapper = mount(ChampionshipVoterPanel, {
      props: { championshipId: 7, championshipFinished: false, awards: [] },
    })
    await flushPromises()
    await wrapper.get('.voter-mode-switch button:nth-child(2)').trigger('click')
    await wrapper.get('select').setValue(11)
    await wrapper.get('input[type="password"]').setValue('123456')
    await wrapper.get('button.btn-red').trigger('click')
    await flushPromises()

    expect(dependencies.service.loginVoter).toHaveBeenCalledWith(7, 11, '123456')
    expect(wrapper.text()).toContain('Ana Jogadora')
  })
})

describe('apresentação de premiações e atualização das odds', () => {
  it('classifica as categorias positivas, negativas e humorísticas', () => {
    expect(championshipAwardTone('Bola de Ouro')).toBe('positive')
    expect(championshipAwardTone('Bagre de Ouro')).toBe('humorous')
    expect(championshipAwardTone('Prêmio Felipe Melo')).toBe('humorous')
  })

  it('detecta quando resultados ou escalações mudaram desde a estimativa', () => {
    const match = {
      id: 1,
      phase: 'group',
      round: 1,
      status: 'scheduled',
      home_score: null,
      away_score: null,
      home_team: { id: 10, name: 'Casa', players: [{ id: 5, player_type: 'field', stone_group: 1, stone_level: 1.2 }] },
      away_team: { id: 20, name: 'Fora', players: [{ id: 6, player_type: 'goalkeeper', stone_group: 2 }] },
      odds: { home_probability: 0.4, draw_probability: 0.3, away_probability: 0.3, home_odd: 2.5, draw_odd: 3.33, away_odd: 3.33, parameters: { results_signature: '', roster_signature: '10[5:field:1:1.2]|20[6:goalkeeper:2:-]' } },
    } as ChampionshipMatch
    expect(championshipOddsAreStale(match, [match])).toBe(false)

    const finished = { ...match, id: 2, status: 'finished', home_score: 1, away_score: 0, odds: null } as ChampionshipMatch
    expect(championshipOddsAreStale(match, [match, finished])).toBe(true)

    const changedRoster = { ...match, home_team: { ...match.home_team, players: [{ id: 5, player_type: 'field', stone_group: 1, stone_level: 1.5 }] } } as ChampionshipMatch
    expect(championshipOddsAreStale(changedRoster, [match])).toBe(true)
  })
})

describe('gestão administrativa de votantes', () => {
  beforeEach(() => {
    dependencies.service.championshipVoters.mockResolvedValue([{
      id: 5,
      championship_player_id: 11,
      player: { id: 101, name: 'Ana Jogadora', nickname: 'Ana' },
      categories_voted: [{ id: 31, name: 'Bola de Ouro' }],
    }])
    dependencies.service.linkChampionshipVoter.mockResolvedValue({
      id: 5,
      championship_player_id: 12,
      player: { id: 102, name: 'Bia Jogadora' },
    })
    dependencies.service.resetChampionshipVoterPin.mockResolvedValue({ message: 'ok' })
  })

  it('exibe histórico e permite alterar vínculo e redefinir PIN', async () => {
    const wrapper = mount(AdminChampionshipVoters, {
      props: {
        championshipId: 7,
        participants: [
          { id: 11, player_id: 101, player_type: 'field', stone_group: 1, player: { id: 101, name: 'Ana Jogadora', nickname: 'Ana' } },
          { id: 12, player_id: 102, player_type: 'field', stone_group: 2, player: { id: 102, name: 'Bia Jogadora', nickname: 'Bia' } },
        ],
      },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Bola de Ouro')

    await wrapper.get('select').setValue(12)
    await wrapper.get('.voter-admin-controls button').trigger('click')
    await flushPromises()
    expect(dependencies.service.linkChampionshipVoter).toHaveBeenCalledWith(5, 12)

    await wrapper.get('input[type="password"]').setValue('654321')
    await wrapper.findAll('button').find((button) => button.text().includes('Redefinir PIN'))!.trigger('click')
    await flushPromises()
    expect(dependencies.service.resetChampionshipVoterPin).toHaveBeenCalledWith(5, '654321')
  })
})
