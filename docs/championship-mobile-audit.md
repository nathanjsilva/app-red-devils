# Auditoria mobile do módulo de campeonato

## Diagnóstico

Antes dos ajustes, a página pública tinha uma barra de seções que podia transbordar em telas estreitas. Listas internas usavam alturas máximas próprias, a tabela compacta de classificação não mostrava todos os dados de gols, e os modais usavam medidas de viewport que não consideravam bem a área útil de navegadores móveis. As odds também não explicavam sua metodologia nem indicavam quando uma estimativa antiga já não correspondia aos resultados ou ao elenco atuais.

Na administração, a seleção de campeonatos concorria com uma fileira de navegação extensa, e a súmula apresentava estados de odds sem contexto suficiente. As telas pública e administrativa já compartilhavam cores e tokens do Design System, que foram preservados.

## Referências consultadas e decisões

- [Sofascore](https://www.sofascore.com/) e [FotMob](https://www.fotmob.com/) serviram como referência para leitura rápida de confrontos e placares, hierarquia de status, separação entre visão geral e detalhes da partida e tabelas com foco em comparação.
- A página oficial de suporte da [OneFootball](https://onefootballsupport.zendesk.com/hc/en-us/articles/4413846318481-What-can-I-find-on-the-OneFootball-website) descreve a organização do produto por jogos, times e competições, além de informações detalhadas por partida. Essa separação de contextos orientou o agrupamento das áreas.
- A aplicação mantém sua paleta e identidade. As referências foram usadas apenas para organização da informação; não foram reproduzidos seus componentes ou marcas.

## Alterações aplicadas

- A navegação pública exibe as quatro áreas principais em grade 2 × 2 em telas estreitas. Nenhuma opção fica escondida e não é necessário arrastar uma lista de abas.
- A navegação administrativa e a seleção de campeonato foram reorganizadas para caber na largura disponível; o seletor passou a usar um campo nativo compacto.
- Tabelas de classificação se adaptam a cards e mostram PJ, V, E, D, gols marcados, gols sofridos e saldo.
- Resumos de partidas mostram estado cancelado, agendado ou finalizado; odds de partidas canceladas ficam ocultas.
- Listas internas deixam de criar pequenas áreas verticais roláveis em celulares. A página usa a rolagem normal do documento.
- Modais usam `dvh`, limite de altura e espaçamento para áreas seguras; grades e formulários administrativos empilham em larguras menores.
- Navegação principal e ações de maior uso têm altura mínima entre 42 e 44 px nos layouts mobile.
- Odds têm explicação expansível nos contextos público e administrativo. A interface exibe amostra, caráter preliminar, versão, horário do cálculo e aviso quando escalação ou resultados mudaram.
- Categorias de premiação têm descrições e marcadores discretos de tom, inclusive no fluxo de voto.

## Matriz de larguras

As regras responsivas foram organizadas para testar os alvos solicitados:

| Largura CSS | Regra principal |
|---:|---|
| 320 px | Uma coluna para detalhes, controles e listas; navegação 2 × 2; cartões com conteúdo quebrável. |
| 360 px | Igual ao layout mobile, com colunas compactas para métricas. |
| 375 px | Mesmo breakpoint mobile; tabelas usam cartões. |
| 390 px | Mesmo breakpoint mobile; partidas e odds mantêm nomes e estado em linhas separadas. |
| 414 px | Layout mobile com espaçamento adicional disponível. |
| 768 px | Sai do breakpoint de celular; grades intermediárias e navegação sem transbordamento horizontal. |
| 1024 px | Layout em colunas quando cabe; detalhes podem ocupar largura completa. |
| 1280 px ou mais | Grades amplas e conteúdo centralizado no limite existente. |

Orientação horizontal usa o mesmo layout por largura. Textos longos podem quebrar em várias linhas; listas vazias mantêm mensagens vazias já existentes. O estado carregando é indicado nos botões e desativa ações concorrentes.

## Verificação e limite desta auditoria

Vitest verifica a exibição da descrição no voto, a classificação dos tons e a detecção de odds desatualizadas por mudança em resultados ou elenco. O build valida os templates Vue e CSS compilado. Os testes de feature da API foram adicionados, mas o banco `mysql` configurado no projeto não está acessível neste ambiente (`getaddrinfo` não resolve o host). A tentativa isolada com SQLite parou numa migration preexistente que usa sintaxe MySQL `ALTER TABLE ... MODIFY`; nenhum teste de feature chegou a executar suas asserções.

Teste em tela executado com Chrome headless e GPU desativada, servindo a aplicacao pelo Vite e usando uma API local com dados simulados. A verificacao visual nao dependeu do banco; os testes de integracao da API continuam sujeitos a indisponibilidade do MySQL descrita acima.
Percorri as areas publicas (classificacao, partidas, estatisticas e premiacoes), as cinco secoes administrativas, os paineis de voto e os dialogos de time, jogador e partida. Medi 320, 360, 375, 390, 414, 768, 844 x 390 em paisagem, 1024 e 1280 px. Nenhuma tela ficou vazia, nao houve erro JavaScript e a largura do documento permaneceu dentro da viewport em todas as combinacoes verificadas.
A revisao encontrou um campo de texto excessivamente alto no formulario de novo campeonato entre 768 e 1024 px e o botao fixo Menu sobrepondo o cabecalho dos dialogos em celulares. Corrigi a regra flex do formulario e a camada dos dialogos, e ajustei acentos ausentes nos detalhes da partida e do jogador. Repeti as capturas e confirmei os ajustes.
O ambiente bloqueou a requisicao a fonts.googleapis.com; as capturas usam a fonte substituta local. As fontes reais e diferencas especificas de Safari iOS e Chrome Android ainda precisam de verificacao nesses aparelhos.
