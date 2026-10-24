const positiveAwards = new Set([
  'Bola de Ouro',
  'Revelação do Campeonato',
  'Garçom do Campeonato',
  'Paredão do Campeonato',
  'Xerifão do Campeonato',
  'Artilheiro do Campeonato',
  'Craque da Galera',
])

const humorousAwards = new Set([
  'Bagre de Ouro',
  'Pipoqueiro do Campeonato',
  'Chato do Campeonato',
  'Prêmio Felipe Melo',
])

export type ChampionshipAwardTone = 'positive' | 'negative' | 'humorous'

export const championshipAwardTone = (name: string): ChampionshipAwardTone => {
  if (positiveAwards.has(name)) return 'positive'
  if (humorousAwards.has(name)) return 'humorous'
  return 'negative'
}

export const championshipAwardToneLabel = (tone: ChampionshipAwardTone): string => ({
  positive: 'Positiva',
  negative: 'Negativa',
  humorous: 'De resenha',
})[tone]
