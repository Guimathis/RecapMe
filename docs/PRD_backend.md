# PRD — RecapMe Backend (API & IA)

> **Projeto:** RecapMe — Backend REST API & Spring AI  
> **Versão:** V0.1  
> **Data:** 27/08/2026  
> **Stack Principal:** Java 21 + Spring Boot 3.3+ + Spring AI + Spring Data JPA + PostgreSQL + Flyway + Spring RestClient  
> **Conformidade:** Richardson Nível 2 + RFC 7807 (ProblemDetail) + JPA Conventions  
> **Status:** Aprovado para Desenvolvimento  

---

## 1. Histórico de Revisão

| Versão | Data | Autor | Descrição |
| :--- | :--- | :--- | :--- |
| V0.1 | 27/08/2026 | Backend & AI Architecture Team | Especificação técnica da API RESTful, integrações externas e orquestração de IA |

---

## 2. Visão Geral da Arquitetura Backend

### 2.1 Objetivos do Backend
Fornecer uma API RESTful de alta performance e desacoplada, responsável por:
1. **Unificação de Metadados:** Integrar e normalizar buscas e informações detalhadas de obras entre **TMDb** (filmes e séries) e **Jikan API** (animes).
2. **Geração e Indexação de Resumos:** Pipeline de IA para síntese de temporadas e episódios com armazenamento em cache relacional (PostgreSQL).
3. **Orquestração de Chat com IA Anti-Spoiler:** Serviço de chat streaming (SSE) via **Spring AI**, com injeção dinâmica de restrição de horizonte temporal (*Spoiler Guard*).
4. **Telemetria e Feedback:** Coleta de métricas e avaliações de utilidade.

### 2.2 Estrutura do Monorepo e Pacotes
A API residirá no diretório `/backend` na raiz do projeto:

```text
recapme/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/recapme/
│   │   │   │   ├── client/              # Clientes HTTP (TmdbClient, JikanClient) via RestClient
│   │   │   │   ├── common/
│   │   │   │   │   ├── config/          # Spring AI, Cache, RestClient, Cors configs
│   │   │   │   │   └── exception/       # DomainException, ResourceNotFoundException, GlobalExceptionHandler
│   │   │   │   ├── controller/          # REST Controllers (@RequestMapping de classe, Nível 2)
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/         # <Name>RequestDto com Bean Validation
│   │   │   │   │   └── response/        # <Action><Name>ResponseDto
│   │   │   │   ├── model/               # Entidades JPA (UUID, Serializable, @Table plural)
│   │   │   │   ├── repository/          # JpaRepository com derived queries
│   │   │   │   └── service/             # MediaService, RecapService, ChatAiService, PromptBuilderService
│   │   │   └── resources/
│   │   │       ├── db/migration/        # Scripts Flyway (V1__initial_schema.sql, etc.)
│   │   │       ├── prompts/             # Templates de prompts do Spring AI (.st)
│   │   │       └── application.yml
│   │   └── test/
│   ├── pom.xml (ou build.gradle)
│   └── Dockerfile
├── frontend/
└── docs/
```

---

## 3. Padrões e Convenções Obrigatórias

### 3.1 Convenções de API REST (Nível 2 de Richardson)
* **URIs:** Substantivos no plural (`/medias`, `/recaps`, `/chats`, `/feedbacks`), sem verbos na URI.
* **Mapeamento de Controladores:** Base URI declarada exclusivamente na anotação de classe `@RequestMapping("/recursos")`. Métodos utilizam atalhos `@GetMapping`, `@PostMapping` sem repetir a base.
* **Respostas e DTOs:**
  * Controladores sempre retornam `ResponseEntity<T>` com status explícito (`ResponseEntity.status(HttpStatus.OK).body(...)`).
  * Nunca retornar `null`, `Optional<T>` ou tipos genéricos soltos.
  * Requisições: `<Name>RequestDto` com `@Valid` e anotações do Jakarta Validation (`@NotBlank`, `@NotNull`, etc.).
  * Respostas: `<Action><Name>ResponseDto` (ex: `ListAllMediasResponseDto`, `OneMediaResponseDto`, `OneRecapResponseDto`, `SaveFeedbackResponseDto`).
* **Tratamento de Erros:** Controladores **nunca** utilizam blocos `try/catch`. Todas as exceções propagam para o `@RestControllerAdvice` e respondem no padrão **RFC 7807 (ProblemDetail)**.

### 3.2 Convenções de Persistência e JPA
* **Entidades:** Nomes singulares `<Name>`, tabela no plural via `@Table(name = "recaps")`.
* **Chave Primária:** `UUID` gerado com `@GeneratedValue(strategy = GenerationType.AUTO)`.
* **Mapeamento de Colunas:** Todo campo mapeado possui `@Column(name = "...", nullable = ..., length = ...)`.
* **Imutabilidade e Serialização:** Entidades implementam `java.io.Serializable` com construtor padrão sem argumentos, getters e setters.
* **Evolução de Schema:** Gerenciamento obrigatório via **Flyway** (`validate` em produção / `update` em dev).

---

## 4. Especificação dos Endpoints REST

### 4.1 Módulo de Obras (`/api/v1/medias`)

#### `GET /api/v1/medias/search`
* **Descrição:** Busca unificada de títulos em TMDb e Jikan com normalização e ordenação por relevância.
* **Query Params:** `query` (string, obrigatório), `type` (enum opcional: `ALL`, `SERIES`, `ANIME`, `MOVIE`).
* **Status de Sucesso:** `200 OK`
* **Response DTO (`ListAllMediasResponseDto`):**
```json
{
  "items": [
    {
      "externalId": "1399",
      "type": "SERIES",
      "source": "TMDB",
      "title": "Game of Thrones",
      "originalTitle": "Game of Thrones",
      "overview": "Em uma terra onde os verões podem durar décadas...",
      "posterUrl": "https://image.tmdb.org/t/p/w500/...",
      "backdropUrl": "https://image.tmdb.org/t/p/original/...",
      "releaseYear": 2011,
      "totalSeasons": 8,
      "totalEpisodes": 73
    }
  ],
  "total": 1
}
```

#### `GET /api/v1/medias/{type}/{externalId}`
* **Descrição:** Obtém detalhes completos de uma obra, incluindo metadados oficiais e catálogo de temporadas/episódios.
* **Path Params:** `type` (`SERIES`, `ANIME`, `MOVIE`), `externalId` (ID no TMDb ou Jikan).
* **Status de Sucesso:** `200 OK` / Erro: `404 Not Found` (via `ResourceNotFoundException`).
* **Response DTO (`OneMediaResponseDto`)**

---

### 4.2 Módulo de Resumos (`/api/v1/recaps`)

#### `GET /api/v1/recaps/{type}/{externalId}`
* **Descrição:** Retorna os resumos estruturados da obra e temporadas. Se não estiverem em cache, orquestra a geração via Spring AI e persiste no PostgreSQL.
* **Query Params:** `season` (inteiro, opcional — se omitido retorna resumo de todas as temporadas disponíveis).
* **Status de Sucesso:** `200 OK`
* **Response DTO (`OneRecapResponseDto`):**
```json
{
  "mediaId": "1399",
  "mediaType": "SERIES",
  "seasonNumber": 1,
  "seasonTitle": "Temporada 1",
  "seasonSummary": "A primeira temporada estabelece a rivalidade entre as casas Stark e Lannister...",
  "keyTakeaways": [
    "Ned Stark aceita o cargo de Mão do Rei em Porto Real.",
    "Daenerys Targaryen casa-se com Khal Drogo e recebe três ovos de dragão petrificados.",
    "A execução de Ned Stark deflagra a Guerra dos Cinco Reis."
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "O Inverno Está Chegando",
      "summary": "O Rei Robert Baratheon chega a Winterfell para convidar Ned Stark...",
      "keyEvents": ["Morte misteriosa de Jon Arryn", "Queda de Bran Stark da torre"]
    }
  ]
}
```

---

### 4.3 Módulo de Chat Conversacional com IA (`/api/v1/chats`)

#### `POST /api/v1/chats/stream`
* **Descrição:** Endpoint de streaming com Server-Sent Events (SSE) para perguntas do usuário.
* **Content-Type:** `text/event-stream` / `application/json`
* **Request DTO (`ChatRequestDto`):**
```json
{
  "mediaId": "1399",
  "mediaType": "SERIES",
  "title": "Game of Thrones",
  "message": "Por que o Ned Stark foi preso em Porto Real?",
  "seasonCutoff": 1,
  "episodeCutoff": 8,
  "history": [
    { "role": "user", "content": "Quem era a Mão do Rei antes dele?" },
    { "role": "assistant", "content": "Antes de Ned, a Mão do Rei era Lorde Jon Arryn..." }
  ]
}
```
* **Fluxo e Restrição de Contexto:**
  1. O backend busca no banco apenas os resumos de episódios `<= seasonCutoff` e `<= episodeCutoff`.
  2. Injeta no Spring AI o prompt com a diretriz de bloqueio rígido de eventos posteriores.
  3. Transmite os tokens de volta ao frontend via `Flux<String>` / SSE.

---

### 4.4 Módulo de Feedback (`/api/v1/feedbacks`)

#### `POST /api/v1/feedbacks`
* **Descrição:** Registra avaliação anônima de utilidade de um resumo ou resposta de chat.
* **Request DTO (`SaveFeedbackRequestDto`):**
```json
{
  "mediaId": "1399",
  "contextType": "CHAT_RESPONSE",
  "rating": "POSITIVE",
  "comment": "Explicou sem dar spoiler da 2ª temporada!"
}
```
* **Status de Sucesso:** `201 Created`
* **Response DTO (`SaveFeedbackResponseDto`)**

---

## 5. Orquestração com Spring AI & Engenharia de Prompt

### 5.1 System Prompt Template (`src/main/resources/prompts/recap-chat.st`)
```text
Você é o assistente inteligente oficial do RecapMe para a obra audiovisual "<mediaTitle>" (Tipo: <mediaType>).
O usuário informou que assistiu e tem conhecimento APENAS até: Temporada <seasonCutoff>, Episódio <episodeCutoff>.

--- CONTEXTO CANÔNICO AUTORIZADO (Até o limite permitido) ---
<authorizedRecapContext>
-------------------------------------------------------------

REGRAS CRÍTICAS DE RESPOSTA:
1. BLOQUEIO DE SPOILER ABSOLUTO: Você NUNCA deve mencionar, insinuar, confirmar ou teorizar sobre quaisquer fatos, mortes, aparições, reviravoltas ou evoluções de personagens que aconteçam APÓS a Temporada <seasonCutoff>, Episódio <episodeCutoff>.
2. Caso o usuário pergunte explicitamente sobre o futuro da história (ex: "X morre na próxima temporada?"), recuse educadamente: "Isso é um spoiler além do ponto em que você assistiu (T<seasonCutoff>E<episodeCutoff>). Caso queira saber, ajuste a trava de spoilers na interface."
3. Responda em Português do Brasil de forma concisa, amigável e direta ao ponto.
4. Baseie-se nos fatos conhecidos até o momento da história.
```

### 5.2 Implementação do Serviço de Chat
```java
@Service
public class ChatAiService {

    private final ChatClient chatClient;
    private final RecapService recapService;

    public ChatAiService(ChatClient.Builder chatClientBuilder, RecapService recapService) {
        this.chatClient = chatClientBuilder.build();
        this.recapService = recapService;
    }

    public Flux<String> streamChat(ChatRequestDto request) {
        String authorizedContext = recapService.getAuthorizedContext(
                request.getMediaType(), 
                request.getMediaId(), 
                request.getSeasonCutoff(), 
                request.getEpisodeCutoff()
        );

        return chatClient.prompt()
                .system(sp -> sp.text(loadPromptTemplate("recap-chat.st"))
                        .param("mediaTitle", request.getTitle())
                        .param("mediaType", request.getMediaType())
                        .param("seasonCutoff", request.getSeasonCutoff())
                        .param("episodeCutoff", request.getEpisodeCutoff())
                        .param("authorizedRecapContext", authorizedContext))
                .user(request.getMessage())
                .stream()
                .content();
    }
}
```

---

## 6. Modelo de Dados e Esquema Relacional (Flyway)

### 6.1 Esquema Inicial (`V1__initial_schema.sql`)

```sql
CREATE TABLE medias (
    id UUID PRIMARY KEY,
    external_id VARCHAR(64) NOT NULL,
    media_type VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    poster_url VARCHAR(512),
    backdrop_url VARCHAR(512),
    release_year INT,
    total_seasons INT DEFAULT 1,
    total_episodes INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_media_source_external UNIQUE (media_type, external_id)
);

CREATE TABLE season_recaps (
    id UUID PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES medias(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title VARCHAR(255),
    summary TEXT NOT NULL,
    key_takeaways JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_season_recap UNIQUE (media_id, season_number)
);

CREATE TABLE episode_recaps (
    id UUID PRIMARY KEY,
    season_recap_id UUID NOT NULL REFERENCES season_recaps(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title VARCHAR(255),
    summary TEXT NOT NULL,
    key_events JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_episode_recap UNIQUE (season_recap_id, episode_number)
);

CREATE TABLE feedbacks (
    id UUID PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES medias(id),
    context_type VARCHAR(32) NOT NULL,
    rating VARCHAR(16) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## 7. Requisitos Não Funcionais e Resiliência

1. **Tratamento de Rate Limit:** O `RestClient` para TMDb e Jikan deve possuir interceptor de retry exponencial com Resilience4j em caso de status HTTP `429 Too Many Requests`.
2. **Caffeine Cache Local:** Metadados e buscas cacheados em memória por 30 minutos para evitar chamadas redundantes a APIs de terceiros.
3. **Segurança contra Injeções de Prompt:** Sanitização e delimitação estrita de blocos de contexto no Spring AI.
4. **Health Check e Observabilidade:** Ativação do `spring-boot-starter-actuator` em `/actuator/health` e métricas de latência da IA.

---

## 8. Critérios de Aceite de Backend

- [ ] Todos os controladores aderem ao Nível 2 de Richardson e utilizam `@RequestMapping` no nível de classe.
- [ ] Nenhum controlador captura exceções via `try/catch`; todo erro retorna `ProblemDetail` (RFC 7807) padronizado.
- [ ] As entidades JPA possuem chaves UUID, `@Table(name = "...")` plural, `@Column` explícito e implementam `Serializable`.
- [ ] O endpoint de chat realiza streaming de tokens em menos de 1.5s via SSE e respeita rigorosamente a trava anti-spoiler.
- [ ] As migrações do banco de dados executam com sucesso via Flyway.
