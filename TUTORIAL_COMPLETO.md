# 🏆 Red Devils - Tutorial Completo do Sistema

## 📋 Índice
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Configuração Inicial](#configuração-inicial)
3. [Primeiro Acesso - Setup do Admin](#primeiro-acesso---setup-do-admin)
4. [Login e Autenticação](#login-e-autenticação)
5. [Cadastro de Jogadores](#cadastro-de-jogadores)
6. [Recuperação de Senha](#recuperação-de-senha)
7. [Gerenciamento de Peladas](#gerenciamento-de-peladas)
8. [Registro de Estatísticas](#registro-de-estatísticas)
9. [Visualização de Rankings](#visualização-de-rankings)
10. [Funcionalidades Administrativas](#funcionalidades-administrativas)
11. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral do Sistema

O **Red Devils** é um sistema completo para gerenciamento de peladas de futebol, permitindo:

- ✅ **Cadastro e gerenciamento de jogadores**
- ✅ **Criação e organização de peladas**
- ✅ **Registro de estatísticas (gols, assistências, vitórias)**
- ✅ **Rankings automáticos por diferentes critérios**
- ✅ **Organização automática de times**
- ✅ **Sistema de permissões (Admin vs Jogador)**

### 🏗️ Arquitetura do Sistema
- **Frontend**: Vue.js 3 + TypeScript + Bootstrap 5
- **Backend**: Laravel + Sanctum (API)
- **Autenticação**: Token-based (Laravel Sanctum)
- **Banco de Dados**: MySQL/PostgreSQL

---

## 🚀 Configuração Inicial

### 1. Pré-requisitos
Antes de começar, certifique-se de ter instalado:
- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git**

### 2. Instalação do Projeto
```bash
# Clone o repositório (se aplicável)
git clone [URL_DO_REPOSITORIO]

# Navegue para o diretório
cd app-red-devils

# Instale as dependências (se necessário)
npm install
```

### 3. Configuração do Backend
Certifique-se de que o backend Laravel está rodando:
```bash
# No diretório do backend Laravel
php artisan serve
# O backend deve estar rodando em http://localhost:8000
```

### 4. Iniciar o Frontend
```bash
# No diretório do projeto Vue.js
npm run dev
# O frontend será iniciado em http://localhost:3000
```

---

## 👑 Primeiro Acesso - Setup do Admin

### 📍 Acessando o Sistema pela Primeira Vez

1. **Abra o navegador** e acesse: `http://localhost:3000`

2. **Você será redirecionado para a tela de login**, mas como não existe nenhum administrador ainda, você precisa criar o primeiro.

3. **Acesse diretamente a tela de setup**: `http://localhost:3000/setup-admin`

### 📝 Criando o Primeiro Administrador

#### Passo 1: Preencha os Dados Pessoais
```
Nome Completo: [Seu nome completo]
E-mail: [Seu e-mail válido]
Senha: [Senha forte - mínimo 8 caracteres]
Telefone: [Seu telefone com DDD]
Apelido: [Apelido que será usado no futebol]
Posição: [Selecione: "Jogador de Linha" ou "Goleiro"]
```

#### Passo 2: Validações de Segurança
- **Nome**: Obrigatório, único no sistema
- **E-mail**: Deve ser um e-mail válido e único
- **Senha**: Deve conter:
  - Mínimo 8 caracteres
  - 1 letra minúscula
  - 1 letra maiúscula
  - 1 número
  - 1 caractere especial (!@#$%^&*)
- **Telefone**: Formato brasileiro (11) 99999-9999
- **Apelido**: Único no sistema
- **Posição**: Obrigatória

#### Passo 3: Confirmação
1. Clique em **"Criar Administrador"**
2. Aguarde a confirmação: **"Administrador criado com sucesso!"**
3. Você será **redirecionado automaticamente** para a tela de login após 3 segundos

---

## 🔐 Login e Autenticação

### 📍 Fazendo Login no Sistema

1. **Na tela de login**, digite suas credenciais:
   ```
   E-mail: [E-mail do admin criado]
   Senha: [Sua senha]
   ```

2. **Opcional**: Marque "Lembrar-me" para manter a sessão

3. **Clique em "Entrar"**

4. **Sucesso**: Você será redirecionado para a página inicial (`/home`)

### 🔄 Funcionalidades de Autenticação

#### Lembrar-me
- Mantém a sessão ativa mesmo após fechar o navegador
- Token é armazenado no localStorage

#### Logout
- Clique no menu do usuário (canto superior direito)
- Selecione "Sair" ou "Logout"
- Você será redirecionado para a tela de login

---

## 👥 Cadastro de Jogadores

### 📍 Como Cadastrar Novos Jogadores

#### Opção 1: Cadastro Público (Recomendado)
1. **Acesse**: `http://localhost:3000/register`
2. **Preencha todos os campos obrigatórios**:
   - Nome completo
   - E-mail (único no sistema)
   - Senha (com requisitos de segurança)
   - Telefone (com máscara automática)
   - Apelido (único no sistema)
   - Posição (Linha ou Goleiro)

3. **Clique em "Cadastrar"**
4. **Sucesso**: Jogador será criado e poderá fazer login

#### Opção 2: Cadastro via Admin (Para Administradores)
1. **Faça login como admin**
2. **Acesse o menu "Gerenciar Jogadores"**
3. **Clique em "Adicionar Jogador"**
4. **Preencha os dados** (mesmos campos do cadastro público)
5. **Opcional**: Marque "É Administrador" para dar permissões admin

### 📋 Campos Obrigatórios e Validações

| Campo | Obrigatório | Validação | Exemplo |
|-------|-------------|-----------|---------|
| Nome | ✅ Sim | Único, máximo 255 caracteres | "João Silva" |
| E-mail | ✅ Sim | Formato válido, único | "joao@email.com" |
| Senha | ✅ Sim | 8+ chars, maiúscula, minúscula, número, especial | "MinhaSenh@123" |
| Telefone | ✅ Sim | Formato brasileiro, único | "(11) 99999-9999" |
| Apelido | ✅ Sim | Único, máximo 255 caracteres | "Joãozinho" |
| Posição | ✅ Sim | "linha" ou "goleiro" | "linha" |

### 🔧 Funcionalidades do Cadastro

#### Máscara de Telefone
- **Automática**: Conforme você digita, a máscara é aplicada
- **Formato**: (11) 99999-9999
- **Validação**: Apenas números são enviados para o banco de dados

#### Visualização de Senha
- **Ícone de olho**: Clique para mostrar/ocultar a senha
- **Acessibilidade**: Funciona com leitores de tela

#### Validação em Tempo Real
- **Feedback imediato**: Erros são mostrados em tempo real
- **Cores**: Campos inválidos ficam vermelhos
- **Mensagens**: Descrições claras dos erros

---

## 🔑 Recuperação de Senha

### 📍 Esqueci Minha Senha

#### Passo 1: Solicitar Recuperação
1. **Na tela de login**, clique em **"Esqueci a senha"**
2. **Ou acesse diretamente**: `http://localhost:3000/forgot-password`

#### Passo 2: Inserir E-mail
1. **Digite seu e-mail cadastrado** no sistema
2. **Clique em "Enviar Instruções"**
3. **Aguarde a confirmação**: "E-mail enviado!"

#### Passo 3: Verificar E-mail
1. **Verifique sua caixa de entrada** (e spam)
2. **Procure por e-mail do Red Devils**
3. **Clique no link de recuperação**

#### Passo 4: Redefinir Senha
1. **Você será redirecionado** para a tela de redefinição
2. **Digite sua nova senha** (mesmos requisitos de segurança)
3. **Confirme a nova senha**
4. **Clique em "Redefinir Senha"**

#### Passo 5: Confirmação
1. **Aguarde**: "Senha redefinida com sucesso!"
2. **Redirecionamento automático** para login após 3 segundos
3. **Faça login** com sua nova senha

### 🔒 Requisitos da Nova Senha
- Mínimo 8 caracteres
- 1 letra minúscula
- 1 letra maiúscula
- 1 número
- 1 caractere especial

---

## ⚽ Gerenciamento de Peladas

### 📍 Criando uma Nova Pelada

#### Como Administrador:
1. **Faça login como admin**
2. **Acesse o menu "Gerenciar Peladas"**
3. **Clique em "Nova Pelada"**
4. **Preencha os dados**:
   ```
   Data: [Data da pelada - formato YYYY-MM-DD]
   Local: [Local onde será realizada]
   Quantidade de Times: [Ex: 4]
   Jogadores por Time: [Ex: 5]
   Quantidade de Goleiros: [Ex: 4]
   ```
5. **Clique em "Criar Pelada"**

### 📋 Campos da Pelada

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| Data | Data da realização da pelada | 2025-10-20 |
| Local | Local onde será realizada | "Campo do João" |
| Quantidade de Times | Número de times que jogarão | 4 |
| Jogadores por Time | Quantos jogadores cada time terá | 5 |
| Quantidade de Goleiros | Quantos goleiros serão necessários | 4 |

### 👥 Organização Automática de Times

#### Passo 1: Selecionar Jogadores
1. **Na pelada criada**, clique em **"Organizar Times"**
2. **Selecione os jogadores** que participarão
3. **O sistema automaticamente**:
   - Distribui os goleiros entre os times
   - Balanceia os times por habilidade
   - Garante que cada time tenha pelo menos 1 goleiro

#### Passo 2: Confirmação
1. **Revise a organização** proposta pelo sistema
2. **Clique em "Confirmar Organização"**
3. **Times serão criados** automaticamente

### 📊 Visualizando Peladas

#### Lista de Peladas:
- **Data**: Quando será realizada
- **Local**: Onde será realizada
- **Status**: Planejada, Em Andamento, Finalizada
- **Participantes**: Quantos jogadores confirmaram

#### Detalhes da Pelada:
- **Informações completas** da pelada
- **Lista de participantes** confirmados
- **Times organizados** (se já foram organizados)
- **Estatísticas** registradas (se já foram registradas)

---

## 📈 Registro de Estatísticas

### 📍 Registrando Estatísticas de um Jogador

#### Como Administrador:
1. **Acesse a pelada** específica
2. **Clique em "Registrar Estatísticas"**
3. **Selecione o jogador** na lista
4. **Preencha as estatísticas**:
   ```
   Gols: [Quantidade de gols marcados]
   Assistências: [Quantidade de assistências]
   Gols Sofridos: [Apenas para goleiros]
   Resultado: [Vitória ou Derrota]
   ```
5. **Clique em "Salvar Estatísticas"**

### 📋 Campos de Estatísticas

| Campo | Obrigatório | Descrição | Exemplo |
|-------|-------------|-----------|---------|
| Jogador | ✅ Sim | Jogador que jogou | "João Silva" |
| Pelada | ✅ Sim | Pelada específica | "Pelada 20/10/2025" |
| Gols | ✅ Sim | Gols marcados | 2 |
| Assistências | ✅ Sim | Assistências realizadas | 1 |
| Gols Sofridos | ⚠️ Goleiros | Gols que o goleiro sofreu | 1 |
| Resultado | ✅ Sim | Se o time venceu | Vitória |

### 🔄 Editando Estatísticas

1. **Acesse as estatísticas** do jogador
2. **Clique em "Editar"**
3. **Modifique os valores** necessários
4. **Clique em "Salvar Alterações"**

### 🗑️ Excluindo Estatísticas

1. **Acesse as estatísticas** do jogador
2. **Clique em "Excluir"**
3. **Confirme a exclusão**
4. **Estatísticas serão removidas** permanentemente

---

## 🏆 Visualização de Rankings

### 📍 Acessando os Rankings

1. **Faça login** no sistema
2. **Acesse o menu "Rankings"**
3. **Escolha o tipo de ranking** desejado

### 🏅 Tipos de Rankings Disponíveis

#### 1. Ranking de Vitórias
- **Critério**: Maior número de vitórias
- **Ordenação**: Decrescente
- **Exibição**: Nome, Vitórias, Total de Jogos, % de Vitórias

#### 2. Ranking de Gols
- **Critério**: Maior número de gols marcados
- **Ordenação**: Decrescente
- **Exibição**: Nome, Gols, Jogos, Média de Gols por Jogo

#### 3. Ranking de Assistências
- **Critério**: Maior número de assistências
- **Ordenação**: Decrescente
- **Exibição**: Nome, Assistências, Jogos, Média de Assistências

#### 4. Ranking de Participação em Gols
- **Critério**: Gols + Assistências
- **Ordenação**: Decrescente
- **Exibição**: Nome, Gols, Assistências, Total, Média

#### 5. Ranking de Goleiros
- **Critério**: Menor média de gols sofridos
- **Ordenação**: Crescente
- **Exibição**: Nome, Gols Sofridos, Jogos, Média de Gols Sofridos

### 📊 Interpretando os Rankings

#### Médias Calculadas:
- **Média de Gols**: Total de gols ÷ Total de jogos
- **Média de Assistências**: Total de assistências ÷ Total de jogos
- **Média de Participação**: (Gols + Assistências) ÷ Total de jogos
- **% de Vitórias**: (Vitórias × 100) ÷ Total de jogos

#### Filtros Disponíveis:
- **Por Período**: Último mês, último trimestre, último ano
- **Por Posição**: Apenas goleiros, apenas jogadores de linha
- **Por Pelada**: Estatísticas de uma pelada específica

---

## 👑 Funcionalidades Administrativas

### 📍 Acesso às Funcionalidades Admin

**Apenas usuários com `is_admin: true`** podem acessar estas funcionalidades.

### 👥 Gerenciamento de Jogadores

#### Adicionar Jogador (Admin)
1. **Menu**: "Admin" → "Gerenciar Jogadores"
2. **Clique**: "Adicionar Jogador"
3. **Preencha**: Todos os campos obrigatórios
4. **Opcional**: Marque "É Administrador"
5. **Salve**: Jogador será criado

#### Editar Jogador
1. **Lista de jogadores**: Clique no jogador desejado
2. **Clique**: "Editar"
3. **Modifique**: Campos necessários
4. **Salve**: Alterações serão aplicadas

#### Excluir Jogador
1. **Lista de jogadores**: Clique no jogador desejado
2. **Clique**: "Excluir"
3. **Confirme**: Jogador será removido permanentemente

#### Tornar Administrador
1. **Lista de jogadores**: Clique no jogador desejado
2. **Clique**: "Tornar Admin"
3. **Confirme**: Jogador ganhará permissões admin

#### Remover Permissões Admin
1. **Lista de jogadores**: Clique no jogador admin
2. **Clique**: "Remover Admin"
3. **Confirme**: Jogador perderá permissões admin
4. **⚠️ Atenção**: Não é possível remover o último admin

### ⚽ Gerenciamento de Peladas

#### Criar Pelada (Admin)
1. **Menu**: "Admin" → "Gerenciar Peladas"
2. **Clique**: "Nova Pelada"
3. **Preencha**: Todos os campos
4. **Salve**: Pelada será criada

#### Editar Pelada
1. **Lista de peladas**: Clique na pelada desejada
2. **Clique**: "Editar"
3. **Modifique**: Campos necessários
4. **Salve**: Alterações serão aplicadas

#### Excluir Pelada
1. **Lista de peladas**: Clique na pelada desejada
2. **Clique**: "Excluir"
3. **Confirme**: Pelada e todas as estatísticas serão removidas

### 📊 Gerenciamento de Estatísticas

#### Registrar Estatísticas (Admin)
1. **Menu**: "Admin" → "Estatísticas"
2. **Selecione**: Pelada e Jogador
3. **Preencha**: Gols, assistências, resultado
4. **Salve**: Estatísticas serão registradas

#### Editar Estatísticas
1. **Lista de estatísticas**: Clique na estatística desejada
2. **Clique**: "Editar"
3. **Modifique**: Valores necessários
4. **Salve**: Alterações serão aplicadas

#### Excluir Estatísticas
1. **Lista de estatísticas**: Clique na estatística desejada
2. **Clique**: "Excluir"
3. **Confirme**: Estatística será removida permanentemente

### 🏆 Organização de Times

#### Organizar Times Automaticamente
1. **Acesse**: Pelada específica
2. **Clique**: "Organizar Times"
3. **Selecione**: Jogadores que participarão
4. **Clique**: "Organizar"
5. **Revise**: Proposta do sistema
6. **Confirme**: Times serão criados

#### Critérios de Organização:
- **Goleiros**: Distribuídos igualmente entre os times
- **Balanceamento**: Tentativa de equilibrar habilidades
- **Quantidade**: Respeita o número de jogadores por time

---

## 🚨 Solução de Problemas

### ❌ Problemas Comuns e Soluções

#### 1. Erro de Login
**Sintomas**: Não consegue fazer login mesmo com credenciais corretas

**Soluções**:
- ✅ Verifique se o e-mail está correto
- ✅ Verifique se a senha está correta
- ✅ Tente recuperar a senha
- ✅ Verifique se a conta não foi desativada

#### 2. Erro "E-mail já cadastrado"
**Sintomas**: Tenta cadastrar mas recebe erro de e-mail duplicado

**Soluções**:
- ✅ Use um e-mail diferente
- ✅ Tente fazer login com esse e-mail
- ✅ Entre em contato com o administrador

#### 3. Erro de Validação de Senha
**Sintomas**: Senha não é aceita durante cadastro/recuperação

**Soluções**:
- ✅ Verifique se tem pelo menos 8 caracteres
- ✅ Verifique se tem pelo menos 1 letra maiúscula
- ✅ Verifique se tem pelo menos 1 letra minúscula
- ✅ Verifique se tem pelo menos 1 número
- ✅ Verifique se tem pelo menos 1 caractere especial

#### 4. Erro de Máscara de Telefone
**Sintomas**: Telefone não é formatado corretamente

**Soluções**:
- ✅ Digite apenas números
- ✅ A máscara será aplicada automaticamente
- ✅ Use o formato: (11) 99999-9999

#### 5. Erro de Token Expirado
**Sintomas**: É redirecionado para login mesmo estando logado

**Soluções**:
- ✅ Faça login novamente
- ✅ Verifique se o "Lembrar-me" estava marcado
- ✅ Limpe o cache do navegador

#### 6. Erro de Permissão
**Sintomas**: Não consegue acessar funcionalidades admin

**Soluções**:
- ✅ Verifique se você tem permissões de administrador
- ✅ Entre em contato com outro administrador
- ✅ Verifique se sua conta está ativa

#### 7. Erro de API
**Sintomas**: Mensagens de erro do servidor

**Soluções**:
- ✅ Verifique se o backend está rodando
- ✅ Verifique sua conexão com a internet
- ✅ Tente novamente em alguns minutos
- ✅ Entre em contato com o suporte técnico

### 🔧 Comandos Úteis para Desenvolvedores

#### Frontend (Vue.js)
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Rodar testes
npm run test

# Build para produção
npm run build

# Preview da build
npm run preview
```

#### Backend (Laravel)
```bash
# Instalar dependências
composer install

# Rodar migrações
php artisan migrate

# Rodar seeders
php artisan db:seed

# Gerar chave da aplicação
php artisan key:generate

# Limpar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### 📞 Suporte Técnico

#### Informações para Suporte:
- **Versão do sistema**: [Versão atual]
- **Navegador**: [Nome e versão]
- **Sistema Operacional**: [Windows/Mac/Linux]
- **Descrição do problema**: [Descrição detalhada]
- **Passos para reproduzir**: [Lista de passos]

#### Logs Úteis:
- **Console do navegador**: F12 → Console
- **Network**: F12 → Network (para ver requisições)
- **Logs do Laravel**: `storage/logs/laravel.log`

---

## 🎯 Fluxo Completo de Uso

### 📋 Cenário: Organizar uma Pelada Completa

#### Passo 1: Setup Inicial (Apenas na primeira vez)
1. Acesse `/setup-admin`
2. Crie o primeiro administrador
3. Faça login com as credenciais criadas

#### Passo 2: Cadastrar Jogadores
1. **Opção A**: Envie o link `/register` para os jogadores se cadastrarem
2. **Opção B**: Como admin, cadastre os jogadores manualmente

#### Passo 3: Criar a Pelada
1. Acesse "Gerenciar Peladas" (admin)
2. Clique "Nova Pelada"
3. Preencha: data, local, quantidade de times, jogadores por time, goleiros

#### Passo 4: Organizar Times
1. Na pelada criada, clique "Organizar Times"
2. Selecione os jogadores que participarão
3. Confirme a organização proposta pelo sistema

#### Passo 5: Realizar a Pelada
1. Jogue a pelada normalmente
2. Anote os resultados (gols, assistências, vitórias)

#### Passo 6: Registrar Estatísticas
1. Após a pelada, acesse "Estatísticas" (admin)
2. Para cada jogador, registre:
   - Gols marcados
   - Assistências realizadas
   - Se venceu ou perdeu
   - Gols sofridos (para goleiros)

#### Passo 7: Visualizar Rankings
1. Acesse "Rankings"
2. Veja como os jogadores estão classificados
3. Compartilhe os resultados com o grupo

### 🔄 Fluxo Semanal/Mensal

#### Todo Início de Semana:
1. Verifique jogadores cadastrados
2. Crie peladas da semana
3. Organize times

#### Todo Final de Semana:
1. Registre estatísticas das peladas
2. Verifique rankings atualizados
3. Prepare próximas peladas

#### Todo Final de Mês:
1. Analise estatísticas mensais
2. Identifique melhores jogadores
3. Planeje próximos meses

---

## 📚 Recursos Adicionais

### 🔗 Links Úteis
- **Login**: `/`
- **Cadastro**: `/register`
- **Esqueci a Senha**: `/forgot-password`
- **Setup Admin**: `/setup-admin`
- **Home**: `/home`

### 📱 Responsividade
O sistema é **totalmente responsivo** e funciona em:
- ✅ **Desktop** (1920x1080, 1366x768, etc.)
- ✅ **Tablet** (iPad, Android tablets)
- ✅ **Mobile** (iPhone, Android phones)

### 🎨 Personalização
- **Tema**: Cores do Red Devils (vermelho e branco)
- **Ícones**: Bootstrap Icons
- **Tipografia**: Sistema nativo do Bootstrap

### 🔒 Segurança
- **Autenticação**: Laravel Sanctum
- **Validação**: Frontend e Backend
- **Sanitização**: Todos os inputs são sanitizados
- **HTTPS**: Recomendado para produção

---

## 🏁 Conclusão

O sistema **Red Devils** oferece uma solução completa para gerenciamento de peladas de futebol. Com este tutorial, você deve conseguir:

- ✅ **Configurar o sistema** pela primeira vez
- ✅ **Gerenciar jogadores** e permissões
- ✅ **Organizar peladas** e times
- ✅ **Registrar estatísticas** e acompanhar rankings
- ✅ **Resolver problemas** comuns

### 🎯 Próximos Passos
1. **Configure o sistema** seguindo o tutorial
2. **Cadastre os primeiros jogadores**
3. **Crie sua primeira pelada**
4. **Experimente todas as funcionalidades**
5. **Personalize conforme necessário**

**Boa sorte com suas peladas! 🏆⚽**

---

*Documento criado para o sistema Red Devils - Versão 1.0*
*Última atualização: [Data atual]*







