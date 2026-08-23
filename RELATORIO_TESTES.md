# Relatório de Testes Automatizados e de Usabilidade — Projeto Zonas

**Objetivo da entrega:** Executar testes automatizados e de usabilidade para validar o funcionamento da aplicação e sua usabilidade.

**Data:** 22/08/2026
**Ambiente:** Local (Windows), MongoDB via Docker, backend Express na porta 5000, frontend React na porta 3000.

---

## 1. Testes Automatizados

### 1.1 Backend (API) — `server/__tests__/api.test.mjs`

Suíte de testes automatizados criada e executada contra a API real (com banco de dados, Google Maps, ArcGIS de Londrina e OpenAI reais), cobrindo autenticação, proteção de rotas, consultas de zoneamento e histórico.

**Como executar:**
```bash
node server/__tests__/api.test.mjs
```

**Resultado da execução: 21/21 verificações aprovadas**

| Área | Casos testados | Resultado |
|---|---|---|
| Autenticação | Registro de usuário, rejeição de e-mail duplicado, login válido/inválido | ✅ 6/6 |
| Proteção de rotas | Acesso ao histórico sem token e com token inválido (401) | ✅ 2/2 |
| Consultas | Corpo vazio (400), dúvida geral via IA (fallback), consulta por endereço real (Google Maps + ArcGIS + OpenAI) | ✅ 8/8 |
| Histórico | Listagem, exclusão de item, exclusão de item inexistente (404) | ✅ 5/5 |

### 1.2 Frontend (componentes) — `client/src/App.test.js`

O suite de testes do frontend, herdado do Create React App, estava **quebrado** (dependências `@testing-library/*` ausentes do `package.json`, e o único teste existente checava um texto "learn react" que não existe mais na aplicação). Foram instaladas as dependências faltantes e reescritos os testes para refletir o fluxo real da aplicação.

**Como executar:**
```bash
cd client && npm test -- --watchAll=false
```

**Resultado da execução: 5/5 testes aprovados**
- Exibe formulário de login por padrão
- Exibe erro em login inválido
- Login bem-sucedido mostra saudação do usuário
- Alterna para cadastro e valida senha curta (< 6 caracteres)
- Logout limpa sessão e retorna ao login

---

## 2. Teste de Usabilidade (exploratório, ponta a ponta)

Fluxo percorrido manualmente no navegador, como um usuário real: cadastro, login, consulta por endereço, consulta por dúvida geral, histórico, documentação legal, logout.

### ✅ O que funciona bem
- Login, cadastro e logout funcionam corretamente e com boas mensagens de erro (ex.: "Email ou senha inválidos").
- Consulta por endereço real integra Google Maps + ArcGIS de Londrina + OpenAI de ponta a ponta, exibindo mapa, resumo em linguagem natural e painel técnico.
- Fallback para dúvida geral funciona sem exibir mapa/painel vazio, como projetado.
- Botão "Ver Documentação" abre o PDF correto da lei (ex.: `zr_4.pdf` para zona ZR4).
- Histórico persiste corretamente entre sessões/navegadores (dado real no MongoDB).
- Visual limpo, tema escuro consistente, boa hierarquia de informação no painel de resultado.

### 🐞 Problemas encontrados

1. **Estado da consulta anterior vaza entre usuários (bug de maior impacto).**
   Em [client/src/App.js:74](client/src/App.js:74), `handleLogout` reseta `user`, `name`, `email` e `password`, mas **não reseta `consultaVisualizada`**. Resultado: ao trocar de conta (logout/login ou novo cadastro), a tela principal continua mostrando o mapa e o resultado da consulta do usuário anterior, mesmo com o histórico da nova conta corretamente vazio. É apenas um problema de estado local (não expõe dados de outro usuário via API), mas confunde o usuário e passa a impressão de dado incorreto/vazamento.
   *Correção sugerida:* zerar `consultaVisualizada` (ex.: `setConsultaVisualizada(null)`) em `handleLogout`, `handleLogin` e `handleRegister`.

2. **Chat não rola automaticamente para a nova mensagem.**
   Ao enviar uma pergunta (fluxo de dúvida geral), a resposta é adicionada ao final da conversa, mas a área de chat não faz scroll automático. Isso fez com que, durante o teste, a mensagem parecesse "não enviada" e o mesmo texto fosse reenviado três vezes, gerando três entradas duplicadas no histórico. É um problema real de usabilidade: usuários tendem a reenviar mensagens que parecem não ter funcionado.
   *Correção sugerida:* auto-scroll do container de mensagens para o fim a cada nova mensagem (`scrollIntoView` ou `scrollTop = scrollHeight`).

3. **Valor de "Taxa de Ocupação" malformado no painel de resultado.**
   Para a zona ZR4, o painel exibiu `TAXA OCUPAÇÃO: 100.601%`. A causa é que o campo de origem descreve três valores em texto ("100% no térreo, 60% no 1º andar, 50% acima"), e a função `parseNumber` em [server/controllers/queryController.js:91](server/controllers/queryController.js:91) apenas remove caracteres não numéricos com regex, concatenando os três números em um único valor inválido.
   *Correção sugerida:* extrair apenas o primeiro percentual do texto (ex.: regex `/(\d+)%/`) ou tratar `taxaOcupacaoMaxima` como texto descritivo em vez de número único.

4. **Inconsistência entre o texto da IA e o painel técnico (Altura Máxima).**
   Na mesma consulta, o texto gerado pela IA diz "Não há um limite específico para a altura", mas o painel exibe `ALTURA MÁXIMA: 8m` — o valor padrão de fallback (`|| 8`) é aplicado mesmo quando a zona realmente não define um limite, criando uma contradição visível ao usuário.

5. **Sessão expirada não é tratada.**
   Um token JWT expirado, ainda presente no `localStorage`, deixa a aplicação em um estado inconsistente: o cabeçalho mostra "Olá, Usuário" (dado incompleto) e a barra lateral mostra simultaneamente "Erro ao carregar histórico. Tente novamente." e "Nenhuma consulta realizada ainda." — em vez de detectar o 401 e redirecionar para a tela de login.
   *Correção sugerida:* interceptar respostas 401 dos serviços autenticados e forçar logout automático.

6. **Exclusão de item do histórico sem confirmação.**
   O botão "🗑️ Deletar" remove o item imediatamente, sem diálogo de confirmação. Ação destrutiva e irreversível sem proteção — risco de exclusão acidental.

7. **Rótulos dos campos de formulário não são semanticamente associados aos inputs (acessibilidade).**
   Em login/cadastro, `<label>` e `<input>` não têm `htmlFor`/`id` correspondentes, prejudicando leitores de tela.

8. **Campo "Endereço" no painel de resultado mostra texto genérico.**
   Em vez do endereço real consultado, o painel exibe o texto fixo "Consulta realizada" no campo `ENDEREÇO:` (visível apenas ali; o endereço real aparece corretamente como título da conversa).

---

## 3. Conclusão

A aplicação está **funcionalmente operante de ponta a ponta**: autenticação, integração com Google Maps, ArcGIS de Londrina e OpenAI, persistência em MongoDB e exibição de documentação legal funcionam conforme o esperado, confirmado pelos **21 testes automatizados de backend** e **5 testes automatizados de frontend**, todos aprovados.

O teste de usabilidade, no entanto, revelou **8 problemas reais** — a maioria de baixo esforço de correção — sendo o mais relevante o vazamento de estado de consulta entre usuários (item 1) e a ausência de auto-scroll no chat (item 2), que efetivamente enganou o testador durante a validação manual.
