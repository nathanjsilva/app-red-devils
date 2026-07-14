# Regras Gerais e Ordem de Prioridade

## Ordem de prioridade ao decidir como agir

1. Instrução explícita do usuário na conversa atual.
2. `CLAUDE.md` (raiz) e este arquivo (`.ai/ai-rules.md`).
3. Context da funcionalidade específica em `.ai/frontend/contexts/`.
4. `.ai/frontend/coding-standards.md` e `.ai/frontend/overview.md`.
5. Convenção já existente no código vizinho ao arquivo sendo editado.

Se houver conflito entre níveis, o nível mais específico para a tarefa em questão vence — mas qualquer regra de negócio (ex.: validações, permissões admin/comum) só pode ser mudada com autorização explícita do usuário, independente da prioridade.

## Escopo deste repositório

- Este repositório é **só o frontend** (Vue 3 + TypeScript + Pinia + Bootstrap 5), servido via Vite.
- O backend (Laravel + Sanctum) é externo, consumido em `API_BASE_URL` (`src/utils/constants.ts`). Não existe pasta `backend/` aqui.
- Qualquer necessidade de mudança de contrato de API (rota nova, campo novo, formato de resposta) deve ser tratada como uma suposição a confirmar com o usuário — o backend real pode já ter mudado.

## Regras obrigatórias de comportamento

1. **Explicar antes de executar**: o que será feito, por quê, quais arquivos serão tocados, e o impacto (telas, stores, serviços afetados).
2. **Perguntar antes de agir**: "Deseja que eu execute esta alteração?" — nunca presumir autorização, mesmo para mudanças pequenas.
3. **Nunca sem autorização explícita**:
   - Alterar regra de negócio (validações, permissões `admin`/`common`, cálculos de estatística/ranking).
   - Apagar, mover ou renomear arquivos.
   - Alterar rotas de API, payloads ou parsing de resposta em `src/services/*`.
4. **Resumo pós-alteração**: sempre listar arquivos modificados, funcionalidades afetadas e próximos passos sugeridos (ex.: "sugiro testar o fluxo de login manualmente").
5. **Não introduzir dependências novas** sem justificar a necessidade e confirmar com o usuário.
6. **Preservar mensagens e textos em português** (pt-BR) — é o idioma de toda a UI e commits do projeto.
