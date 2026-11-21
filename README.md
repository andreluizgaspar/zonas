# Projeto de extensão 

## Como configurar e executar
 
Passo a passo para rodar o projeto localmente.
 
### 1. Pré-requisitos
 
- Node.js 18+
- Docker (para o MongoDB local) ou uma instância MongoDB acessível
- Chaves de API: Google Maps (Geocoding) e OpenAI
### 2. Subir o banco de dados (MongoDB via Docker)
 
```bash
docker run -d --name mongo-demo -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo
```
 
### 3. Variáveis de ambiente
 
Crie um arquivo `.env` na raiz do projeto com base em `.env.example`.
**Nunca commite chaves reais**: use as suas próprias.
 
| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor Express (padrão 5000) |
| `NODE_ENV` | `development` ou `production` |
| `MONGO_URI` | String de conexão do MongoDB |
| `JWT_SECRET` | Segredo usado para assinar os tokens de autenticação |
| `GOOGLE_MAPS_API_KEY` | Chave da Google Maps Geocoding API |
| `OPENAI_API_KEY` | Chave da API da OpenAI |
 
### 4. Instalar dependências e rodar em desenvolvimento
 
```bash
# na raiz do projeto
npm install
cd client && npm install && cd ..
 
# roda backend (porta 5000) e frontend (porta 3000) juntos
npm run dev
```
 
### 5. Popular o banco com dados de exemplo (opcional)
 
```bash
npm run data:import   # popula usuários de teste
npm run data:destroy  # limpa usuários e consultas
```
 
### 6. Build de produção
 
```bash
cd client && npm run build && cd ..
NODE_ENV=production npm start
```
 
Em produção, o próprio servidor Express serve os arquivos estáticos do `client/build`; não é necessário um servidor separado para o frontend.
 
