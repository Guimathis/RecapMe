# Especificação Técnica: Contrato da API de Obras e Padronização das Seções da Home

> **Documento:** Auditoria de Contrato e Requisitos de Ajuste na API do Backend  
> **Status:** Aberto para Adequação no Backend  
> **Alvo:** Backend Spring Boot (`com.recapme.dto.response`, `com.recapme.controller.MediaController`)  
> **Data:** 02/09/2026  

---

## 1. Contexto e Motivação

Na interface web (`frontend`), as seções da página inicial (`HomePage`) e os componentes de exibição (`MediaCard`, `MediaCarouselSection`) foram projetados de forma declarativa e desacoplada. Cada seção consome um endpoint configurável (por exemplo, `/api/v1/medias/trending`, `/api/v1/medias/popular`, `/api/v1/medias/top-rated`).

Para evitar **"gambiarras" ou adaptadores improvisados no frontend** convertendo propriedades soltas em tempo de execução, este documento detalha:
1. As discrepâncias existentes entre o que a API do backend (`MediaSummaryDto` / `ListAllMediasResponseDto`) retorna hoje e o que o frontend consome.
2. As alterações e correções necessárias no backend para padronizar o contrato REST.

---

## 2. Contrato Requerido pelo Frontend (`MediaItem`)

Todo componente visual de catálogo no frontend consome estritamente a interface TypeScript `MediaItem`:

```typescript
export type MediaType = 'MOVIE' | 'SERIES' | 'ANIME';

export interface MediaItem {
  externalId: string;       // ID identificador da obra no provedor (ou UUID)
  type: MediaType;          // 'SERIES' | 'ANIME' | 'MOVIE'
  source: string;           // 'TMDB' | 'ANILIST' | 'JIKAN'
  title: string;            // Título legível principal exibido no card
  originalTitle?: string;   // Título na língua original
  overview?: string;        // Sinopse descritiva
  posterUrl?: string;       // URL da imagem vertical do pôster (proporção 2:3)
  backdropUrl?: string;     // URL da imagem horizontal panorâmica
  releaseYear?: number;     // Ano de lançamento (ex: 2024)
  totalSeasons?: number;    // Total de temporadas
  totalEpisodes?: number;   // Total de episódios
}
```

---

## 3. Discrepâncias Identificadas no Backend Atual

### 3.1 DTO de Resposta: `MediaSummaryDto`

Atualmente, a classe [`MediaSummaryDto.java`](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/backend/src/main/java/com/recapme/dto/response/MediaSummaryDto.java) está modelada da seguinte forma:

```java
public record MediaSummaryDto(
    UUID id,
    Integer anilistId,
    String titleRomaji,
    String titleEnglish,
    String titlePortuguese,
    String synopsis,
    String coverImageUrl,
    String bannerImageUrl,
    String format,
    String status,
    BigDecimal score,
    Integer seasonYear,
    Integer totalEpisodes,
    Set<String> genres
) implements Serializable
```

### 3.2 Tabela Comparativa de Campos

| Campo no Backend Atual (`MediaSummaryDto`) | Campo Esperado no Contrato (`MediaItem`) | Problema Identificado | Correção Recomendada no Backend |
| :--- | :--- | :--- | :--- |
| `anilistId` (Integer) ou `id` (UUID) | `externalId` (String) | Nomes diferentes; falta identificador externo genérico compatível com TMDB e AniList. | Expor campo `externalId` (String) ou adicionar alias `@JsonProperty("externalId")`. |
| `format` (String: "TV", "MOVIE", "OVA") | `type` (Enum: `ANIME`, `SERIES`, `MOVIE`) | Formato cru do AniList em vez do tipo semântico da obra. | Expor campo `type` (`ANIME`, `SERIES`, `MOVIE`). |
| Inexistente | `source` (String: "ANILIST", "TMDB") | O frontend não sabe de qual provedor veio a obra para roteamento de detalhes. | Adicionar campo `source` indicando a fonte dos metadados. |
| `titlePortuguese` / `titleEnglish` / `titleRomaji` | `title` (String) | Título fragmentado em 3 campos, forçando o frontend a escolher qual exibir. | O backend deve consolidar o título prioritário em `title` (`titlePortuguese` ?? `titleEnglish` ?? `titleRomaji`). |
| `titleRomaji` | `originalTitle` (String) | Nome específico do AniList; no TMDB o campo é originalTitle. | Expor `originalTitle`. |
| `synopsis` (String) | `overview` (String) | Divergência de nomenclatura. | Expor `overview` ou `@JsonProperty("overview")`. |
| `coverImageUrl` (String) | `posterUrl` (String) | Divergência de nomenclatura de imagem vertical. | Expor `posterUrl` ou `@JsonProperty("posterUrl")`. |
| `bannerImageUrl` (String) | `backdropUrl` (String) | Divergência de nomenclatura de imagem panorâmica. | Expor `backdropUrl` ou `@JsonProperty("backdropUrl")`. |
| `seasonYear` (Integer) | `releaseYear` (Integer) | AniList chama de seasonYear, TMDB/Padrão chama de releaseYear. | Expor `releaseYear` ou `@JsonProperty("releaseYear")`. |
| Inexistente em listagens | `totalSeasons` (Integer) | Séries precisam informar a contagem de temporadas no card. | Incluir `totalSeasons` no DTO de resumo. |

---

## 4. Estrutura do Envelope de Paginação (`ListAllMediasResponseDto`)

Os endpoints de listagem do backend (`/trending`, `/popular`, `/top-rated`, `/search` e `/`) retornam:

```json
{
  "content": [
    { /* MediaItem */ }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 50,
  "totalPages": 5,
  "isLast": false
}
```

Essa estrutura de paginação com a lista em **`content`** é padrão do Spring Data e está correta. O frontend consome o array contido em `.content`.

---

## 5. Proposta de Solução Limpa no Backend

Para que o backend atenda o contrato sem quebrar integrações existentes nem exigir gambiarras no frontend, recomendamos:

### Opção Recomendada: Atualizar `MediaSummaryDto` com Anotações Jackson
Adicionar os campos padronizados ou aliases `@JsonProperty` e getters de conveniência no record do backend:

```java
package com.recapme.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Builder
@Schema(description = "Resumo padronizado de uma obra para catálogo e carrosséis")
public record MediaSummaryDto(
        UUID id,

        @JsonProperty("externalId")
        String externalId,

        @JsonProperty("type")
        String type, // ANIME, SERIES, MOVIE

        @JsonProperty("source")
        String source, // ANILIST, TMDB

        @JsonProperty("title")
        String title,

        @JsonProperty("originalTitle")
        String originalTitle,

        @JsonProperty("overview")
        String overview,

        @JsonProperty("posterUrl")
        String posterUrl,

        @JsonProperty("backdropUrl")
        String backdropUrl,

        @JsonProperty("releaseYear")
        Integer releaseYear,

        @JsonProperty("totalSeasons")
        Integer totalSeasons,

        @JsonProperty("totalEpisodes")
        Integer totalEpisodes,

        BigDecimal score,
        Set<String> genres
) implements Serializable {
    // Preserva compatibilidade mantendo os métodos legado se necessário
}
```

---

## 6. Configuração de Proxy no Frontend (`vite.config.ts`)

Foi identificado que o proxy do Vite continha uma regra de reescrita incorreta:
```typescript
// INCORRETO (removia /api/v1 antes de repassar para o Spring Boot):
'/api': {
  target: 'http://localhost:8080',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/v1/, ''),
}
```
Como o backend mapeia `@RequestMapping("/api/v1/medias")`, a reescrita impedia que as requisições chegassem ao controlador correto. A correção consiste em repassar `/api` diretamente sem reescrita.
