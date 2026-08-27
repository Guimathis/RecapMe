# Guia de APIs: Filmes, Séries e Animes

Este documento reúne as principais APIs públicas para consulta e integração de metadados, imagens, avaliações e disponibilidade de filmes, séries e animes.

---

## 🎬 1. Filmes e Séries (Geral)

### 🔹 The Movie Database (TMDb) *(Mais recomendada)*
* **Site / Docs:** [https://developer.themoviedb.org](https://developer.themoviedb.org)
* **Acesso:** Gratuita (necessário criar conta e gerar uma chave de API).
* **O que oferece:**
  * Catálogo completo de filmes, séries e animes.
  * Suporte a múltiplos idiomas (incluindo sinopses, títulos e traduções em **Português PT-BR**).
  * Imagens em alta qualidade (pôsteres, backdrops, fotos de elenco/equipe).
  * Informações de temporadas, episódios, datas de exibição e status de produção.
  * Dados de elenco, equipe técnica, trailers oficiais (YouTube) e classificação indicativa.
  * Endpoints de tendências (*Trending*), lançamentos, recomendações e filmes similares.

---

### 🔹 OMDb API (Open Movie Database)
* **Site / Docs:** [https://www.omdbapi.com](https://www.omdbapi.com)
* **Acesso:** Gratuita até 1.000 requisições/dia (com chave de API).
* **O que oferece:**
  * Integração direta com dados do **IMDb**, **Rotten Tomatoes** e **Metacritic**.
  * Sinopse, elenco, diretor, ano de lançamento, bilheteria e prêmios.
  * Formato REST muito simples e rápido para buscas pontuais por título ou ID do IMDb (`tt...`).

---

### 🔹 Trakt.tv API
* **Site / Docs:** [https://trakt.docs.apiary.io](https://trakt.docs.apiary.io)
* **Acesso:** Gratuita (com cadastro de aplicação).
* **O que oferece:**
  * Foco em rastreamento de histórico de visualização (*scrobbling*), listas de usuários e recomendações.
  * Metadados completos de filmes e episódios de séries de TV.
  * Comentários, avaliações da comunidade e métricas de popularidade em tempo real.

---

## ⛩️ 2. Animes e Mangás

### 🔹 Jikan API (MyAnimeList Unofficial) *(Mais fácil de começar)*
* **Site / Docs:** [https://jikan.moe](https://jikan.moe)
* **Acesso:** 100% Gratuita, código aberto e **não exige chave de API**.
* **O que oferece:**
  * Todos os dados do ecossistema do **MyAnimeList (MAL)**.
  * Detalhes de animes, mangás, personagens, dubladores (*seiyuu*) e estúdios de animação.
  * Rankings mundiais (*Top Animes*, mais populares, lançamentos sazonais).
  * Cronograma semanal de episódios e links para trailers promocionais.

---

### 🔹 AniList API
* **Site / Docs:** [https://anilist.gitbook.io/anilist-api](https://anilist.gitbook.io/anilist-api)
* **Acesso:** Gratuita via **GraphQL**.
* **O que oferece:**
  * Base de dados extremamente moderna e atualizada de animes e mangás.
  * Sistema avançado de relações (sequências, prequels, spin-offs, adaptações de Light Novels).
  * Tags e gêneros muito detalhados.
  * Suporte a autenticação de usuários (OAuth) para gerenciar listas pessoais e progresso.

---

### 🔹 Kitsu API
* **Site / Docs:** [https://kitsu.docs.apiary.io](https://kitsu.docs.apiary.io)
* **Acesso:** Gratuita (padrão REST / JSON:API).
* **O que oferece:**
  * Catálogo de animes, mangás e dramas asiáticos.
  * Sinopses, contagem de episódios, notas da comunidade e links para plataformas de streaming (quando disponíveis).

---

## 📺 3. Onde Assistir (Disponibilidade em Streaming)

### 🔹 Watchmode API & Streaming Availability API
* **Watchmode:** [https://api.watchmode.com](https://api.watchmode.com)
* **Streaming Availability (RapidAPI):** [https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability)
* **O que oferecem:**
  * Informam em qual plataforma o título está disponível (ex: *Netflix, Prime Video, Max, Disney+, Crunchyroll, Apple TV+*).
  * Filtros específicos por região/país (ex: Brasil `BR`).
  * Indicam modelo de acesso (incluso na assinatura, aluguel ou compra).

---

## 💡 4. Resumo Comparativo: Qual Escolher?

| Caso de Uso | API Recomendada | Motivo Principal |
| :--- | :--- | :--- |
| **App geral de Filmes e Séries** | **TMDb** | Completa, imagens em alta definição e excelente suporte a PT-BR. |
| **Notas da crítica (Rotten Tomatoes / IMDb)** | **OMDb** | Rápida para obter notas consolidadas da crítica em uma única chamada. |
| **App de Animes (Sem burocracia)** | **Jikan (MAL)** | Não requer cadastro nem API Key; pronta para consumo imediato. |
| **App de Animes com consultas customizadas** | **AniList** | GraphQL flexível com relacionamentos detalhados e filtros avançados. |
| **Saber onde assistir um título** | **Watchmode / Streaming Availability** | Foco específico no catálogo dos serviços de streaming por país. |
