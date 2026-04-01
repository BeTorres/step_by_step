## 🚀 Executar com Docker

### Passo 1: Pré-requisitos

Instale no seu computador:
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Docker Compose (incluído no Docker Desktop)

### Passo 2: Clone o repositório

```bash
git clone https://github.com/seu-usuario/predictus.git
cd predictus
```

### Passo 3: Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (se necessário).

### Passo 4: Inicie os serviços

```bash
docker-compose up -d
```

Aguarde alguns segundos enquanto as imagens são baixadas e os contêineres são iniciados.


## 🏗️ Executar com pnpm

### Passo 1: Instale dependências

```bash
pnpm install
```

### Passo 2: Build e inicie

```bash
# Build completo
pnpm build

# Inicie em desenvolvimento
pnpm dev
```

Acesse em http://localhost:3000

### Comandos úteis com pnpm

```bash
# Backend separado
cd backend && pnpm start:dev

# Frontend separado
cd frontend && pnpm dev

# Testes
pnpm test

# Lint
pnpm lint
```

## 🛑 Parar os serviços

```bash
docker-compose down
```

## 🔄 Reiniciar tudo (limpar e começar do zero)

```bash
docker-compose down -v
docker-compose up -d --build
```

## 📝 Serviços disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Next.js UI da aplicação |
| Backend | http://localhost:3001 | API NestJS |
| PostgreSQL | localhost:5432 | Banco de dados |

## 🐛 Troubleshooting

**Erro: "Port 3000 is already in use"**
```bash
# Mude a porta no docker-compose.yml ou mate o processo
lsof -i :3000
kill -9 <PID>
```

**Erro de conexão com banco de dados**
```bash
# Reinicie tudo
docker-compose down -v
docker-compose up -d
```

**Ver logs detalhados**
```bash
docker-compose logs backend
docker-compose logs frontend
```

## 📚 Features

- ✅ Multi-step registration flow (5 steps)
- ✅ Email verification with MFA
- ✅ Automatic address lookup (ViaCEP)
- ✅ Mobile-first responsive design
- ✅ PostgreSQL database
- ✅ TypeScript full-stack
# step_by_step
