# 🎬 RecapMe

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Spring_AI-Google_GenAI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Spring AI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

> **RecapMe** é uma plataforma inteligente de recapitulação de séries, animes e filmes, combinando **resumos estruturados** com um **assistente conversacional de IA anti-spoiler**. Relembre pontos cruciais do enredo sem correr o risco de estragar surpresas futuras.

---

## 📌 Sumário

- [Visão Geral e Proposta de Valor](#-visão-geral-e-proposta-de-valor)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [1. Clonar o Repositório](#1-clonar-o-repositório)
  - [2. Configurar o Backend](#2-configurar-o-backend)
  - [3. Configurar o Frontend](#3-configurar-o-frontend)
- [Endpoints Principais da API](#-endpoints-principais-da-api)
- [Documentação Detalhada](#-documentação-detalhada)
- [Licença](#-licença)

---

## 💡 Visão Geral e Proposta de Valor

Ao aguardar a estreia de uma nova temporada ou continuação de um filme, muitos espectadores esquecem detalhes essenciais da trama, mortes e reviravoltas. As alternativas tradicionais (vídeos longos no YouTube ou wikis) trazem **alto risco de spoilers** e **falta de interatividade**.

O **RecapMe** resolve essas dores através de:
1. **🛡️ Trava Anti-Spoiler Visual e Semântica:** O usuário define até qual episódio/temporada assistiu. O sistema mascara visualmente resumos posteriores e injeta restrições rígidas no prompt da IA.
2. **🤖 Chat Interativo Streaming com IA:** Faça perguntas pontuais (*"Como o personagem X conseguiu a espada no Ep. 4?"*) e receba respostas seguras e precisas via Server-Sent Events (SSE).
3. **🔍 Catálogo Próprio e Ingestão Sob Demanda:** Ingestão desacoplada de **AniList GraphQL** (metadados e destaques) e **Kitsu GraphQL** (árvore de episódios) para banco local PostgreSQL com busca Full-Text `unaccent`.
4. **⚡ Cache e Resiliência:** Resumos, metadados e seções da Home cacheados via Caffeine para respostas instantâneas (< 30ms em leituras locais).
5. **🔒 Privacidade no MVP:** Sem login obrigatório; progresso e preferências são salvos de forma segura no navegador (`localStorage`).

---

## ✨ Funcionalidades Principais

```
[ Home: Banner Hero / Trending / Popular / Top Rated ] 
       │ (AniList + Kitsu Ingestion / PostgreSQL)
       ▼
[ Página da Obra ] ──► [ Trava de Spoiler: "Assisti até T1 E5" ]
       │                                │
       ├──► [ Resumos Estruturados ] ◄──┘ (Aplica Blur em episódios futuros)
       │         ├── Resumo Geral da Temporada
       │         └── Resumo Episódio por Episódio
       │
       └──► [ Chat com IA (Streaming SSE) ] ──► Respostas restritas até T1 E5
```

- **Home Dinâmica com Seções:** Banner Hero em destaque, Trending Now (Em Alta), Populares e Top Rated (All Time).
- **Seletor de Progresso Anti-Spoiler:** Controle fino por temporada e episódio.
- **Resumos Multicamada:** Visão panorâmica da temporada e lista detalhada por episódios.
- **Chat Inteligente com IA:** Alimentado por Spring AI e Google Gemini / OpenAI.
- **Interface Responsiva e Acessível:** Desenvolvida em React com Tailwind CSS e Shadcn UI.
- **Feedback de Respostas:** Avaliação rápida (👍/👎) para aprimoramento contínuo das sínteses.

---

## 🛠️ Arquitetura e Tecnologias

### **Backend (`/backend`)**
- **Linguagem & Framework:** Java 21 + Spring Boot 4.x
- **Inteligência Artificial:** Spring AI (`spring-ai-starter-model-google-genai` / OpenAI)
- **Persistência & Banco de Dados:** Spring Data JPA, PostgreSQL (Neon / Local), Flyway Migrations, Extensão `unaccent`
- **Cache:** Caffeine Cache + Spring Cache (`home-sections`, `media-details`)
- **Comunicação HTTP / GraphQL:** Spring `RestClient` (consumo resiliente de AniList e Kitsu)
- **Boilerplate & Validação:** Lombok, Jakarta Validation (`@Valid`)
- **Padrões de API:** Richardson Nível 2 + RFC 7807 (`ProblemDetail`) + OpenAPI 3.0 (SpringDoc)

### **Frontend (`/frontend`)**
- **Core:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS, Shadcn UI (Radix UI), Lucide React
- **Gerenciamento de Estado:** Zustand com persistência local (`persist`)
- **Validação de Dados:** Zod
- **Gerenciamento de Requisições:** TanStack Query (React Query v5)
- **Roteamento:** React Router DOM v6
- **Streaming:** Consumo nativo de Server-Sent Events (SSE) / Fetch API Streams

---

## 📁 Estrutura do Repositório

```text
recapme/
├── backend/                       # API RESTful Spring Boot + Spring AI
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/recapme/
│   │   │   │   ├── client/        # Clientes HTTP (TmdbClient, JikanClient)
│   │   │   │   ├── common/        # Configurações globais e Exception Handler
│   │   │   │   ├── controller/    # Controllers REST (/medias, /recaps, /chats, etc.)
│   │   │   │   ├── dto/           # DTOs de Request e Response
│   │   │   │   ├── model/         # Entidades JPA (UUID, Auditing)
│   │   │   │   ├── repository/    # Interfaces Spring Data JPA
│   │   │   │   └── service/       # Regras de negócio, Chat e Prompts
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Migrações Flyway
│   │   │       └── application.yml
│   │   └── test/
│   ├── pom.xml
│   └── .env.example
│
├── frontend/                      # SPA React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/            # UI, Chat, Media, Recap, Common
│   │   ├── hooks/                 # Custom hooks (useStreamingChat, useDebounce)
│   │   ├── pages/                 # Home, Detalhes da Obra, 404
│   │   ├── services/              # Integração com API Backend
│   │   ├── stores/                # Zustand stores (useSpoilerStore, etc.)
│   │   └── types/                 # Interfaces e tipos TypeScript
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                          # Especificações e PRDs
│   ├── PRD_recapme.md             # Visão geral do produto e requisitos
│   ├── PRD_backend.md             # Especificação técnica da API e IA
│   ├── PRD_frontend.md            # Especificação técnica do Frontend
│   └── apis_filmes_series_animes.md # Mapeamento de APIs externas
│
└── README.md                      # Documentação principal do projeto
```

---

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Java Development Kit (JDK):** Versão 21 ou superior
- **Node.js:** Versão 18.x ou 20.x e gerenciador `npm`
- **PostgreSQL:** Versão 15 ou superior
- **Chave de API do TMDb:** [Obter no The Movie Database](https://www.themoviedb.org/documentation/api)
- **Chave de API do Google Gemini ou OpenAI:** [Google AI Studio](https://aistudio.google.com/) ou [OpenAI Platform](https://platform.openai.com/)

---

## 🚀 Como Executar o Projeto

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/recapme.git
cd recapme
```

---

### 2. Configurar o Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```

2. Crie o arquivo `.env` a partir do modelo de exemplo:
   ```bash
   cp .env.example .env
   ```

3. Preencha as variáveis de ambiente no arquivo `backend/.env`:
   ```properties
   # Banco de Dados PostgreSQL (Neon / Local)
   DB_URL=jdbc:postgresql://localhost:5432/recapme-db
   DB_USERNAME=postgres
   DB_PASSWORD=sua_senha_aqui
   DB_DRIVER=org.postgresql.Driver
   JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect

   # Chaves de IA
   GOOGLE_GENAI_APIKEY=sua_chave_google_gemini_aqui

   # Endpoints GraphQL
   ANILIST_GRAPHQL_URL=https://graphql.anilist.co
   KITSU_GRAPHQL_URL=https://kitsu.io/api/graphql

   # Configurações de CORS
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. Execute a aplicação com o Maven Wrapper:
   ```bash
   # Linux/macOS
   ./mvnw spring-boot:run

   # Windows (PowerShell / CMD)
   .\mvnw.cmd spring-boot:run
   ```

> A API iniciará por padrão em: `http://localhost:8080` (Swagger UI em `http://localhost:8080/swagger-ui.html`)

---

### 3. Configurar o Frontend

1. Em outro terminal, acesse o diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```

> O Frontend estará disponível em: `http://localhost:5173`

---

## 🌐 Endpoints Principais da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/medias/home?perPage=10` | Seções da Home agregadas (Banner Hero, Trending Now, Popular e Top Rated) com cache. |
| `GET` | `/api/v1/medias/trending?page=0&size=20` | Lista paginada de obras em alta no momento. |
| `GET` | `/api/v1/medias/popular?page=0&size=20` | Lista paginada de obras populares. |
| `GET` | `/api/v1/medias/top-rated?page=0&size=20` | Lista paginada de obras mais bem avaliadas de todos os tempos. |
| `GET` | `/api/v1/medias?page=0&size=20` | Listagem com paginação e filtros no catálogo local. |
| `GET` | `/api/v1/medias/search?query={termo}` | Busca textual Full-Text unaccent com Lazy Ingestion automática. |
| `GET` | `/api/v1/medias/{id}` | Detalhes completos da obra, temporadas e episódios (por UUID). |
| `POST`| `/api/v1/medias/ingest/{externalId}` | Força a ingestão/sincronização de uma obra pelo AniList ID. |
| `GET` | `/api/v1/medias/{mediaId}/seasons` | Lista as temporadas cadastradas de uma obra. |
| `GET` | `/api/v1/seasons/{seasonId}/episodes` | Lista todos os episódios de uma temporada. |
| `GET` | `/api/v1/episodes/{id}` | Detalhes de um episódio específico. |
| `GET` | `/api/v1/recaps/{scope}/{id}` | Resumos estruturados (escopo `SEASON` ou `EPISODE`). |
| `POST`| `/api/v1/chats` | Chat conversacional com IA e limite de spoilers (Stream via SSE). |
| `POST`| `/api/v1/feedbacks` | Registro de avaliação (útil/não útil) sobre resumos e respostas. |

---

## 📚 Documentação Detalhada

Para mais detalhes sobre arquitetura, contratos e decisões de design, consulte a pasta [`/docs`](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs):
- 📄 [PRD Geral do RecapMe](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_recapme.md)
- ⚙️ [PRD Backend & Spring AI](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_backend.md)
- 🎨 [PRD Frontend & UI](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_frontend.md)
- 🔌 [Guia de APIs Externas (TMDb & Jikan)](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/apis_filmes_series_animes.md)

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
