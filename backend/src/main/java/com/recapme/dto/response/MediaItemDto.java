package com.recapme.dto.response;

import com.recapme.model.MediaType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Item resumido de mídia retornado em buscas de catálogo")
public class MediaItemDto implements Serializable {

    @Schema(description = "Identificador externo da obra no catálogo de origem (TMDB/Jikan)", example = "1399")
    private String externalId;

    @Schema(description = "Tipo da obra", example = "SERIES")
    private MediaType type;

    @Schema(description = "Provedor dos metadados da obra", example = "TMDB", allowableValues = {"TMDB", "JIKAN"})
    private String source;

    @Schema(description = "Título da mídia em português ou formatado", example = "Game of Thrones")
    private String title;

    @Schema(description = "Título original da obra", example = "Game of Thrones")
    private String originalTitle;

    @Schema(description = "Sinopse e descrição geral da obra", example = "Em uma terra onde os verões podem durar décadas e os invernos uma vida inteira...")
    private String overview;

    @Schema(description = "URL do poster promocional", example = "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg")
    private String posterUrl;

    @Schema(description = "URL do backdrop / plano de fundo", example = "https://image.tmdb.org/t/p/original/2OMB0ynKlyIen9SuFsqwhBSQDIP.jpg")
    private String backdropUrl;

    @Schema(description = "Ano de lançamento da obra", example = "2011")
    private Integer releaseYear;

    @Schema(description = "Total de temporadas da obra (se aplicável)", example = "8")
    private Integer totalSeasons;

    @Schema(description = "Total de episódios da obra (se aplicável)", example = "73")
    private Integer totalEpisodes;
}
