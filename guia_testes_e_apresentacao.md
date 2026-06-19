# 🎓 Guia de Testes e Roteiro de Apresentação - Projeto Zonas

Este guia foi elaborado para ajudar você a validar todos os requisitos da entrega e estruturar a gravação do seu vídeo demonstrativo de até 10 minutos.

---

## 🔍 1. Validação dos Serviços (Status Atual)

Sim, os serviços estão **completamente operacionais e saudáveis**:
*   **Banco de Dados (MongoDB):** Rodando localmente e conectado com sucesso.
*   **Backend (API Express):** Rodando na porta `5000`. As rotas de login, cadastro, consulta e histórico estão integradas.
*   **Serviços Externos:** 
    *   **Google Maps API:** Operacional para converter endereços em coordenadas.
    *   **ArcGIS Londrina API:** Conectada e respondendo em tempo real com as siglas de zoneamento (ex: ZC1, ZR2).
    *   **OpenAI API (GPT-4o-mini):** Integrada tanto para a explicação técnica de zoneamento quanto para responder dúvidas gerais.
*   **Frontend (React):** Rodando na porta `3000` com Webpack compilado sem erros.

---

## 🧪 2. Casos de Teste Sugeridos (Para fazer na gravação)

Siga este passo a passo durante a gravação para demonstrar que o sistema funciona perfeitamente de ponta a ponta.

### Teste 1: Autenticação e Criação de Conta
*   **O que fazer:** Na tela inicial, clique em "Criar conta gratuita", registre um novo usuário de teste (ex: `jose@email.com` / `senha123`), faça o logout e depois entre novamente com o usuário administrador padrão (`admin@zonas.com` / `senha123`).
*   **O que demonstrar:** Que a lógica de sessão (`localStorage`), hashing de senhas com `bcrypt` no backend e a segurança via JWT (JSON Web Tokens) estão funcionando.

### Teste 2: Consulta por Endereço Real (Integração Google Maps + ArcGIS + IA)
*   **O que fazer:** Na barra de busca, digite um endereço real da cidade de Londrina (ex: `"Avenida Higienópolis, 500"` ou `"Rua Sergipe, 300"`).
*   **O que demonstrar:**
    *   O endereço sendo geocodificado com sucesso pela API do Google.
    *   A API do ArcGIS Londrina sendo consultada com as coordenadas exatas e retornando a sigla da zona (ex: `ZC1`).
    *   A IA (GPT-4o-mini) interpretando os parâmetros daquela zona em `zones.json` e escrevendo uma resposta detalhada em linguagem acessível no chat.
    *   O mapa (Leaflet) abrindo na localização precisa do endereço.
    *   O painel de **Resultado do Zoneamento** mostrando os limites técnicos específicos (recuos, coeficiente de aproveitamento, taxa de ocupação, etc.).

### Teste 3: Acesso ao PDF da Legislação
*   **O que fazer:** No painel de resultados, clique no botão **"📄 Ver Documentação"**.
*   **O que demonstrar:** O sistema abrirá o PDF técnico específico da lei de Londrina correspondente à zona consultada (ex: `zc_1.pdf`), que está hospedado estaticamente no backend.

### Teste 4: Fallback de Dúvidas Gerais (Integração GPT Chat)
*   **O que fazer:** Faça uma pergunta de urbanismo ao invés de um endereço (ex: `"O que significa o Coeficiente de Aproveitamento?"` ou *"Quais as regras para construir na ZR3?"*).
*   **O que demonstrar:** 
    *   A geocodificação falhará (já que não é um endereço), mas o sistema ativará o **fallback inteligente**.
    *   A IA responderá diretamente sua pergunta com base na base técnica de Londrina sem quebrar a aplicação.
    *   Nenhum mapa ou painel de zoneamento vazio será exibido, mantendo o visual limpo.

### Teste 5: Gerenciamento do Histórico no Banco de Dados
*   **O que fazer:** 
    1.  Clique no botão **"Salvar Consulta"** na barra de resultados.
    2.  Veja o item aparecer na barra lateral esquerda (Histórico).
    3.  Clique no botão **"👁️ Ver"** em qualquer item anterior do histórico para demonstrar a recuperação dos dados na tela.
    4.  Clique no botão **"🗑️ Deletar"** para demonstrar a exclusão física do registro no MongoDB.

---

## 📹 3. Roteiro Sugerido para o Vídeo (Até 10 Minutos)

Aqui está uma estrutura de tempo ideal para impressionar a banca avaliadora:

| Tempo | Seção | O que falar/mostrar |
| :--- | :--- | :--- |
| **0:00 - 1:30** | **Introdução e Arquitetura** | Apresente-se, fale o objetivo do projeto de zoneamento urbano inteligente para Londrina. Mostre rapidamente o diagrama de classes (`classDiagram.txt`) para provar que a modelagem foi seguida. |
| **1:30 - 3:00** | **Tecnologias & Integração** | Mostre o terminal rodando o Express e o React. Comente sobre as APIs utilizadas (Google Maps, ArcGIS oficial da Prefeitura de Londrina e a OpenAI). |
| **3:00 - 5:00** | **Demonstração Prática (Endereço)** | Faça a busca por um endereço (Teste 2). Mostre o mapa, a resposta amigável da IA e a tabela de parâmetros. Abra o PDF da legislação correspondente (Teste 3). |
| **5:00 - 6:30** | **Demonstração Prática (Chat/Dúvidas)** | Pergunte algo conceitual à IA para demonstrar a flexibilidade do chat (Teste 4). |
| **6:30 - 8:00** | **Persistência de Dados (Histórico)** | Salve consultas, interaja com o histórico na barra lateral, remova uma consulta e atualize a página para mostrar que a persistência no MongoDB funciona perfeitamente (Teste 5). |
| **8:00 - 9:30** | **Correções Implementadas (Destaque Técnico)** | Destaque as correções difíceis que você fez (como o bug de aninhamento dos dados técnicos no MongoDB e a proteção contra erros de runtime quando coordenadas estavam nulas). Isso mostra maturidade técnica. |
| **9:30 - 10:00** | **Conclusão** | Agradeça e encerre destacando que o sistema integra com sucesso Frontend, Backend, Banco de Dados, APIs de mapas e inteligência artificial generativa. |

---

> [!TIP]
> Durante o vídeo, destaque que os dados técnicos de Londrina são reais (Lei de Uso e Ocupação do Solo nº 12.236/2015) e que a consulta ao ArcGIS da prefeitura é feita em tempo real! Isso eleva muito o nível do projeto.
