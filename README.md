# Red Devils - Sistema de Estatísticas de Futebol

Sistema moderno de gerenciamento de estatísticas para peladas de futebol, desenvolvido com Vue 3, TypeScript e Pinia.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática para JavaScript
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Vite** - Build tool e dev server
- **Bootstrap 5** - Framework CSS
- **Axios** - Cliente HTTP
- **Vitest** - Framework de testes
- **Vue Test Utils** - Utilitários para testes Vue

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── views/              # Páginas da aplicação
├── stores/             # Stores do Pinia
├── services/           # Serviços de API
├── composables/        # Composables reutilizáveis
├── utils/              # Funções utilitárias
├── types/              # Definições TypeScript
├── assets/             # Recursos estáticos
└── test/               # Testes
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test

# Executar testes com UI
npm run test:ui

# Executar testes com coverage
npm run test:coverage
```

## 🏗️ Arquitetura

### Stores (Pinia)
- **auth** - Gerenciamento de autenticação
- **players** - Gerenciamento de jogadores
- **rankings** - Gerenciamento de rankings

### Serviços
- **api** - Cliente HTTP centralizado com interceptors
- **authService** - Operações de autenticação
- **playerService** - Operações de jogadores
- **rankingService** - Operações de rankings

### Composables
- **useAuth** - Lógica de autenticação
- **useForm** - Gerenciamento de formulários
- **useResponsive** - Detecção de responsividade
- **useLocalStorage** - Gerenciamento de localStorage
- **useSEO** - Gerenciamento de meta tags

## 🔧 Configurações

### Vite
- Alias `@` para `src/`
- Chunks otimizados para vendor e UI
- Source maps habilitados
- Dev server na porta 3000

### TypeScript
- Strict mode habilitado
- Path mapping configurado
- Suporte completo ao Vue 3

### Testes
- Vitest como test runner
- Vue Test Utils para testes de componentes
- JSDOM como ambiente de teste
- Coverage reports

## 📱 Funcionalidades

- ✅ Sistema de autenticação completo
- ✅ Dashboard com rankings
- ✅ Gerenciamento de perfil
- ✅ Interface responsiva
- ✅ Validação de formulários
- ✅ Tratamento de erros centralizado
- ✅ SEO otimizado
- ✅ Acessibilidade
- ✅ Testes automatizados

## 🎨 Design System

- Tema "Red Devils" consistente
- Variáveis CSS customizadas
- Bootstrap 5 + customizações
- Glassmorphism nos cards
- Animações suaves

## 🔒 Segurança

- Validação de inputs
- Sanitização de dados
- Interceptors de autenticação
- Tratamento de tokens JWT

## 📊 Performance

- Lazy loading de componentes
- Chunks otimizados
- Dependências pré-carregadas
- Fallback para dados mockados

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test -- --watch

# Executar testes com coverage
npm run test:coverage
```

## 🚀 Deploy

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📝 Scripts Disponíveis

- `dev` - Servidor de desenvolvimento
- `build` - Build para produção
- `preview` - Preview do build
- `test` - Executar testes
- `test:ui` - Interface de testes
- `test:coverage` - Testes com coverage

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.