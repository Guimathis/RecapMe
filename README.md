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
3. **🔍 Busca Unificada:** Integração com **The Movie Database (TMDb)** para séries e filmes, e **Jikan API (MyAnimeList)** para animes.
4. **⚡ Cache e Resiliência:** Resumos e metadados cacheados para respostas ultrarrápidas (< 100ms em leituras locais).
5. **🔒 Privacidade no MVP:** Sem login obrigatório; progresso e preferências são salvos de forma segura no navegador (`localStorage`).

---

## ✨ Funcionalidades Principais

```
[ Início / Busca Unificada ] 
       │ (TMDb / Jikan)
       ▼
[ Página da Obra ] ──► [ Trava de Spoiler: "Assisti até T1 E5" ]
       │                                │
       ├──► [ Resumos Estruturados ] ◄──┘ (Aplica Blur em episódios futuros)
       │         ├── Resumo Geral da Temporada
       │         └── Resumo Episódio por Episódio
       │
       └──► [ Chat com IA (Streaming SSE) ] ──► Respostas restritas até T1 E5
```

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
- **Persistência & Banco de Dados:** Spring Data JPA, PostgreSQL, Flyway Migrations
- **Cache:** Caffeine Cache + Spring Cache
- **Comunicação HTTP:** Spring `RestClient` (consumo de TMDb e Jikan)
- **Boilerplate & Validação:** Lombok, Jakarta Validation (`@Valid`)
- **Padrões de API:** Richardson Nível 2 + RFC 7807 (`ProblemDetail`) para tratamento global de erros

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
   # Banco de Dados PostgreSQL
   DB_URL=jdbc:postgresql://localhost:5432/recapme-db
   DB_USERNAME=postgres
   DB_PASSWORD=sua_senha_aqui
   DB_DRIVER=org.postgresql.Driver
   JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect

   # Chaves de IA
   GOOGLE_GENAI_APIKEY=sua_chave_google_gemini_aqui
   OPENAI_API_KEY=sua_chave_openai_opcional

   # Provedor de Metadados
   TMDB_API_KEY=sua_chave_tmdb_aqui

   # Configurações de CORS
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

4. Execute a aplicação com o Maven Wrapper:
   ```bash
   # Linux/macOS
   ./mvnw spring-boot:run

   # Windows (PowerShell / CMD)
   .\mvnw.cmd spring-boot:run
   ```

> A API iniciará por padrão em: `http://localhost:8080`

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
| `GET` | `/api/v1/medias/search?query={nome}&type={ALL\|SERIES\|ANIME\|MOVIE}` | Busca unificada de títulos (TMDb e Jikan). |
| `GET` | `/api/v1/medias/{type}/{id}` | Detalhes completos da obra, temporadas e episódios. |
| `GET` | `/api/v1/recaps/{type}/{id}` | Resumos estruturados da temporada e episódios. |
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
