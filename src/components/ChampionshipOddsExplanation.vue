<template>
  <details class="championship-odds-explanation">
    <summary>Como as odds são calculadas?</summary>
    <div class="odds-explanation-copy">
      <p>Usamos resultados, gols e aproveitamento de partidas finalizadas; força do elenco pelas Pedras; e, quando registrados, participações, gols, assistências e MVP dos jogadores, além de jogos sem sofrer gol e gols sofridos pelos goleiros. Confrontos diretos recebem peso pequeno.</p>
      <p>A força inicial combina a média das classificações individuais (6 − Pedra decimal) e a Pedra do goleiro. A forma individual ajusta essa força quando há histórico. Resultados ajustam ataque e defesa por médias suavizadas e com menor peso em amostras pequenas. Casa e visitante começam sem vantagem artificial.</p>
      <p>Com esses dados, o modelo de Poisson estima a distribuição de gols de cada equipe. As combinações de placar são somadas em vitória da casa, empate e vitória de fora e normalizadas para totalizar 100%.</p>
      <p>As odds decimais são justas, sem margem: <code>odd = 1 ÷ probabilidade</code>. Por exemplo, 50% corresponde a odd 2,00.</p>
      <p>Sem partidas anteriores, usamos 1,25 gol por equipe como referência inicial neutra e as Pedras disponíveis. A estimativa fica marcada como preliminar até cada lado ter três partidas no histórico. O detalhe da partida informa o horário, a amostra de jogos e quantos jogadores têm dados individuais.</p>
      <p>Odds são estimativas estatísticas informativas. Cada recálculo de partida agendada cria uma nova versão; odds de partidas concluídas permanecem no histórico.</p>
    </div>
  </details>
</template>

<style scoped>
.championship-odds-explanation {
  min-width: 0;
  padding: .75rem .85rem;
  border: 1px solid var(--line-soft);
  border-radius: .75rem;
  background: rgba(255, 255, 255, .025);
}

.championship-odds-explanation summary {
  min-height: 28px;
  color: var(--text-main);
  font-size: .82rem;
  font-weight: 800;
  cursor: pointer;
}

.odds-explanation-copy {
  display: grid;
  gap: .45rem;
  margin-top: .65rem;
}

.odds-explanation-copy p {
  margin: 0;
  color: var(--text-muted);
  font-size: .74rem;
  line-height: 1.5;
}

.odds-explanation-copy code {
  color: var(--text-main);
}
</style>
