---
title: "Alinhamento de Arquitetura do Backend RecapMe e Ingestão AnimeFlix"
date: "2026-08-28 15:02:07"
tags: [recapme, backend, arquitetura, animeflix, anilist, kitsu, postgresql, spring-boot]
---

```markdown
Requirements Progress:
- [x] Phase 1: Confirm document type + initial project context (PRD Backend — Arquitetura de Catálogo Local)
- [x] Phase 2: Layered questioning to collect information (Ingestão AnimeFlix + DB Relacional + Busca Unaccent)
- [x] Phase 3: Identify project type + confirm optional sections
- [ ] Phase 4: Completeness scoring + user confirmation
- [ ] Phase 5: Generate document
- [ ] Phase 6: Multi-role review + retrospective
```

### Análise Concreta da Arquitetura do AnimeFlix (GitHub)

Para garantir que não houvesse nenhuma suposição ou "alucinação", inspecionei diretamente a base de código do **AnimeFlix** no GitHub (`chirag-droid/animeflix` / pacotes GraphQL de AniList e Kitsu):

1. **AniList GraphQL (`https://graphql.anilist.co`)**:
   - Utilizado para **Metadados Principais**: Título (Romaji, English), banners de alta resolução (`AnimeBanner`), imagens de capa (`AnimeInfo`), formato (TV, MOVIE, OVA), duração, pontuação média (`meanScore`), status e recomendações.
2. **Kitsu GraphQL (`https://kitsu.io/api/graphql`)**:
   - Utilizado para a **Árvore Estruturada de Episódios**: Consulta `searchAnimeByTitle` + fragmento `EpisodesList` para extrair cada episódio com número (`number`), título canônico (`titles.canonical`) e thumbnail (`thumbnail.original.url`).
   - **Algoritmo de Matching**: Faz o cruzamento entre AniList e Kitsu casando `title` + `season` + `startDate` (ano de lançamento).

---

### Mapeamento para a Nossa Stack (Java 21 + Spring Boot 3 + PostgreSQL)

Na nossa arquitetura com a **Abordagem B (Lazy Ingestion)**:
```
Cliente ──(1. Busca / Get)──► RecapMe API ──(2. Consulta)──► PostgreSQL (Local)
                                    │                             ▲
                          (Se não existir no banco)               │ (4. Salva Hierarquia Completa)
                                    ▼                             │
                         [ AniList + Kitsu Ingestion ] ───────────┘
```
1. **Cliente consulta apenas a nossa API e o nosso PostgreSQL**.
2. Se a obra já existe no banco local ➔ Retorna imediatamente do banco local (< 30ms).
3. Se a obra for buscada e ainda não existir ➔ O serviço de ingestão consulta **AniList** (metadados) e **Kitsu** (episódios), normaliza os dados, persiste a hierarquia completa no PostgreSQL (`Obra` ➔ `Temporada` ➔ `Episódio`) de forma atômica/idempotente e retorna o dado já vindo do banco.
4. **Busca Local**: PostgreSQL Full-Text Search com extensão `unaccent` (ignorando acentuação, mas estrito a termos).
5. **Autenticação**: Fora de escopo neste momento (todas as rotas públicas).

---

### Phase 4: Completeness Scoring (Pontuação de Completude)

| Campo / Dimensão | Status | Justificativa |
| :--- | :---: | :--- |
| **Problema & Motivação** | 🟢 Suficiente | Eliminação da arquitetura proxy; independência de chamadas externas em tempo de leitura. |
| **Público / Atores** | 🟢 Suficiente | Frontend RecapMe consumindo catálogo próprio de obras, episódios e resumos. |
| **Estratégia de Ingestão** | 🟢 Suficiente | Baseada no código concreto do AnimeFlix (AniList + Kitsu GraphQL) via Lazy Ingestion. |
| **Modelo Relacional** | 🟢 Suficiente | Hierarquia completa mapeada (`Obra` ➔ `Temporada` ➔ `Episódio` ➔ `Resumo`). |
| **Mecanismo de Busca** | 🟢 Suficiente | PostgreSQL Full-Text Search com `unaccent` configurado via Flyway. |
| **Escopo de Usuário / Auth** | 🟢 Suficiente | Descartado explicitamente para esta fase (100% público). |
| **Padrões de Engenharia** | 🟢 Suficiente | Richardson Nível 2, RFC 7807 (`ProblemDetail`), DTOs estritos, Flyway e Spring Data JPA. |

---

### Estrutura do Novo `PRD_backend.md` a ser Gerado:

1. **Histórico de Revisão**
2. **Contexto & Decisão de Design Arquitetural** (Catálogo Próprio vs. Proxy)
3. **Padrões Técnicos e Stack Backend**
4. **Modelo de Dados Relacional Completo** (Entidades JPA, Chaves Estrangeiras, Índices e Extensão `unaccent`)
5. **Módulo de Ingestão Sob Demanda (AniList + Kitsu Adapter)**
6. **Módulo de Busca Full-Text no PostgreSQL**
7. **Especificação de Endpoints RESTful (Nível 2 de Richardson + DTOs)**
   - `/api/v1/medias` (Busca, Listagem, Detalhes, Forçar Ingestão)
   - `/api/v1/recaps` (Resumos de Obra, Temporada e Episódio)
   - `/api/v1/chats` (Chat Anti-Spoiler via Spring AI sobre dados locais)
8. **Requisitos Não Funcionais & Resiliência** (Idempotência de Ingestão, Concorrência, Tratamento de Erros RFC 7807)
9. **Estratégia de Migrações Flyway**

Posso prosseguir com a geração completa do arquivo [docs/PRD_backend.md](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/docs/PRD_backend.md)?
