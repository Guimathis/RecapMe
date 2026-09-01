# Review Log & Retrospectiva — Requirement Writer

## 📅 Data: 27/08/2026
### Documentos: 
- [PRD_recapme.md](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_recapme.md) (Visão Geral de Produto)
- [PRD_frontend.md](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_frontend.md) (Especificação Técnica Frontend)
- [PRD_backend.md](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_backend.md) (Especificação Técnica Backend & IA)

---

### 🔍 Revisão Multi-Papéis (Multi-Role Review)

* 🎯 **Perspectiva de Produto (Product):**
  * **Problema e Proposta de Valor:** Claros, atacando diretamente a dor de esquecimento de enredos e falta de centralização.
  * **Escopo e Limites:** Delimitação nítida entre MVP (sem login, persistência local) e V2/V3 (OAuth, áudio, sincronização).
  * **Métricas:** Definidas com metas claras (retenção, taxa de engajamento no chat e satisfação de feedback).

* 🎨 **Perspectiva de Design & UX (Frontend PRD):**
  * **Stack Aprovada:** Vite + React + TypeScript + Tailwind CSS + Shadcn UI + Zustand + Zod + TanStack Query.
  * **Interatividade & Estados Visuais:** Trava anti-spoiler no topo da obra com blur dinâmico nos episódios e drawer lateral de chat com streaming token a token.
  * **Persistência Local:** Store Zustand configurada com `persist` para reter o histórico recente e a posição da trava anti-spoiler sem requisições desnecessárias.

* 🔧 **Perspectiva de Engenharia (Backend PRD):**
  * **Stack Aprovada:** Java 21 + Spring Boot 3.3+ + Spring AI + Spring Data JPA + PostgreSQL + Flyway + Spring RestClient.
  * **Conformidade com Convenções:**
    * `api-conventions`: Richardson Nível 2, sem HATEOAS, URIs no plural (`/medias`, `/recaps`, `/chats`, `/feedbacks`), mapeamento de classe único, DTOs padronizados.
    * `exception-handling-conventions`: Sem try/catch em controllers, `@RestControllerAdvice` global retornando `ProblemDetail` (RFC 7807).
    * `jpa-conventions`: UUIDs como chave primária, tabelas no plural, colunas explícitas, `Serializable` e migrações Flyway.
  * **Orquestração de IA:** Restrição estrita de spoiler injetada diretamente no *System Prompt* com corte temporal baseado na seleção do usuário.

---

### 📝 Retrospectiva do Processo

* **Seções mais densas:** Lógica de negócio da IA / Trava Anti-Spoiler, integração com Spring AI via SSE e componentização rica do frontend.
* **Próximos Passos:** Criação da estrutura dos diretórios `/frontend` e `/backend` e bootstrap dos projetos.

---

## 📅 Data: 28/08/2026
### Documento:
- [PRD_backend.md](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_backend.md) (Refatoração da Arquitetura do Backend — Catálogo Relacional Local & Ingestão Sob Demanda)

---

### 🔍 Revisão Multi-Papéis (Multi-Role Review)

* 🎯 **Perspectiva de Produto (Product):**
  * **Eliminação de Dependência de Proxy:** A aplicação ganha soberania sobre os dados e elimina falhas/lentidões decorrentes de consultas síncronas a APIs externas de terceiros.
  * **Escopo Estrito:** Autenticação descartada para esta fase; foco total no catálogo persistente, busca local e resumos/chats de IA sobre dados locais.
  * **Experiência do Usuário:** Latência de navegação drasticamente reduzida (tempo de resposta P95 < 50ms para títulos já no banco).

* 🎨 **Perspectiva de Design & Integração Frontend:**
  * **Contrato de API Estável:** O frontend passa a consumir contratos uniformes (`/api/v1/medias`, `/api/v1/seasons`, `/api/v1/episodes`), com URLs de thumbnails e banners de alta definição já normalizadas.
  * **Busca Otimizada:** Endpoint `/api/v1/medias/search` unificado, suportando busca tolerante a ausência de acentos.

* 🔧 **Perspectiva de Engenharia (Engineering & Architecture):**
  * **Ingestão Sob Demanda Inspirada no AnimeFlix:**
    * **AniList GraphQL (`https://graphql.anilist.co`):** Metadados, capas, banners e pontuações.
    * **Kitsu GraphQL (`https://kitsu.io/api/graphql`):** Árvore detalhada de episódios (títulos canônicos e thumbnails) com matching por título + temporada + ano.
  * **Modelo Relacional Completo:** Mapeamento JPA com hierarquia `Media` ➔ `Season` ➔ `Episode` ➔ `Recap` em PostgreSQL com chaves `UUID` e integridade referencial.
  * **Busca Full-Text com `unaccent`:** Configuração de extensão PostgreSQL e índice `GIN` para busca sem acentos em títulos (Romaji, English, Portuguese).
  * **Conformidade Total com Padrões:** Richardson Nível 2, RFC 7807 (`ProblemDetail`), ausência de `try/catch` em controllers e migrações Flyway.

---

### 📝 Retrospectiva do Processo

* **Seções mais fortes:** Mapeamento detalhado da hierarquia de entidades JPA, especificação precisa das queries GraphQL de AniList/Kitsu baseadas no repositório de referência e design de índices PostgreSQL com `unaccent`.
* **Próximos Passos:** Alinhar o início do desenvolvimento backend com base na especificação do PRD v1.0 assim que aprovado pelo usuário.

