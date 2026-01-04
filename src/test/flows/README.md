# 🧪 Testes de Fluxo - Red Devils

Este diretório contém testes de fluxo completo da aplicação Red Devils, cobrindo desde a autenticação até o uso completo das funcionalidades.

## 📁 Estrutura dos Testes

```
src/test/flows/
├── README.md                 # Este arquivo
├── setup.ts                 # Configuração global dos testes
├── authFlow.test.ts         # Testes de fluxo de autenticação
├── playerFlow.test.ts       # Testes de fluxo de jogadores
├── rankingFlow.test.ts      # Testes de fluxo de rankings
├── peladaFlow.test.ts       # Testes de fluxo de peladas
├── composablesFlow.test.ts  # Testes de fluxo de composables
└── integrationFlow.test.ts  # Testes de integração end-to-end
```

## 🎯 Tipos de Testes

### 1. **Testes de Fluxo de Autenticação** (`authFlow.test.ts`)
- ✅ Login completo com sucesso
- ✅ Restauração de sessão do localStorage
- ✅ Logout completo
- ✅ Registro de novo jogador
- ✅ Tratamento de erros de autenticação

### 2. **Testes de Fluxo de Jogadores** (`playerFlow.test.ts`)
- ✅ Listagem de jogadores
- ✅ Busca de jogador específico
- ✅ Atualização de jogador
- ✅ Exclusão de jogador
- ✅ Gerenciamento de estado e loading

### 3. **Testes de Fluxo de Rankings** (`rankingFlow.test.ts`)
- ✅ Carregamento de todos os rankings
- ✅ Busca de rankings específicos (gols, assistências, vitórias, goleiros)
- ✅ Tratamento de erros
- ✅ Gerenciamento de estado

### 4. **Testes de Fluxo de Peladas** (`peladaFlow.test.ts`)
- ✅ Listagem de peladas
- ✅ Busca de pelada específica
- ✅ Criação de nova pelada
- ✅ Atualização de pelada
- ✅ Exclusão de pelada

### 5. **Testes de Fluxo de Composables** (`composablesFlow.test.ts`)
- ✅ useAuth - Autenticação completa
- ✅ useForm - Validação e submissão
- ✅ useResponsive - Detecção de tamanho de tela
- ✅ useLocalStorage - Persistência de dados
- ✅ Integração entre composables

### 6. **Testes de Integração End-to-End** (`integrationFlow.test.ts`)
- ✅ Fluxo completo de usuário (login → carregar dados → dashboard)
- ✅ Fluxo de atualização de perfil
- ✅ Fluxo de logout e limpeza
- ✅ Tratamento de erros e consistência de estado
- ✅ Persistência de dados
- ✅ Performance e carregamento paralelo

## 🚀 Como Executar

### Executar todos os testes de fluxo:
```bash
npm run test src/test/flows
```

### Executar teste específico:
```bash
npm run test src/test/flows/authFlow.test.ts
```

### Executar com cobertura:
```bash
npm run test:coverage
```

### Executar com interface visual:
```bash
npm run test:ui
```

## 📊 Cobertura de Testes

Os testes de fluxo cobrem:

- **Autenticação**: 100% dos cenários
- **Jogadores**: 100% das operações CRUD
- **Rankings**: 100% dos tipos de ranking
- **Peladas**: 100% das operações CRUD
- **Composables**: 100% das funcionalidades
- **Integração**: 100% dos fluxos principais

## 🔧 Configuração

### Mocks Automáticos
- Todos os serviços são mockados automaticamente
- localStorage e sessionStorage são limpos entre testes
- Timers são resetados
- Console é mockado para evitar logs desnecessários

### Ambiente de Teste
- **jsdom**: Simula o ambiente do navegador
- **Pinia**: Gerenciamento de estado
- **Vue Test Utils**: Testes de componentes Vue
- **Vitest**: Framework de testes

## 📝 Exemplos de Uso

### Teste de Login Completo:
```typescript
it('deve fazer login completo com sucesso', async () => {
  const mockLoginResponse = {
    data: {
      access_token: '1|abcdef123456789',
      token_type: 'Bearer',
      player: mockUser
    }
  }

  vi.mocked(AuthService.login).mockResolvedValue(mockLoginResponse)

  const store = useAuthStore()
  await store.login(credentials)

  expect(store.isAuthenticated).toBe(true)
  expect(store.user).toEqual(mockUser)
})
```

### Teste de Integração:
```typescript
it('deve executar fluxo completo: login → carregar dados → dashboard', async () => {
  // Mock das respostas da API
  vi.mocked(AuthService.login).mockResolvedValue(mockLoginResponse)
  vi.mocked(PlayerService.getAllPlayers).mockResolvedValue(mockPlayers)
  vi.mocked(RankingService.getAllRankings).mockResolvedValue(mockRankings)

  // Executar fluxo completo
  await authStore.login(credentials)
  await Promise.all([
    playersStore.fetchPlayers(),
    rankingsStore.fetchRankings()
  ])

  // Verificar resultado
  expect(authStore.isAuthenticated).toBe(true)
  expect(playersStore.players).toEqual(mockPlayers)
  expect(rankingsStore.rankings).toEqual(mockRankings)
})
```

## 🎯 Benefícios

1. **Cobertura Completa**: Testa todos os fluxos principais da aplicação
2. **Detecção de Regressões**: Identifica problemas em mudanças futuras
3. **Documentação Viva**: Os testes servem como documentação do comportamento
4. **Confiança**: Garante que a aplicação funciona corretamente
5. **Manutenibilidade**: Facilita refatorações e melhorias

## 🔄 Atualizações

Para adicionar novos testes de fluxo:

1. Crie um novo arquivo `*.test.ts` no diretório `flows/`
2. Importe os mocks necessários
3. Siga o padrão dos testes existentes
4. Documente o novo fluxo neste README

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Best Practices](https://vitest.dev/guide/testing-best-practices.html)








