package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Builder
@Schema(description = "Resumo resumido dos metadados de uma obra para listagens e buscas")
public record MediaSummaryDto(
        @Schema(description = "Identificador único da obra", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID id,

        @Schema(description = "Identificador no AniList", example = "16498")
        Integer anilistId,

        @Schema(description = "Título em Romaji", example = "Shingeki no Kyojin")
        String titleRomaji,

        @Schema(description = "Título em Inglês", example = "Attack on Titan")
        String titleEnglish,

        @Schema(description = "Título em Português se disponível", example = "Ataque dos Titãs")
        String titlePortuguese,

        @Schema(description = "Sinopse da obra", example = "Centenas de anos atrás, criaturas gigantescas...")
        String synopsis,

        @Schema(description = "URL da imagem de capa em alta definição", example = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498.jpg")
        String coverImageUrl,

        @Schema(description = "URL do banner panorâmico", example = "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498.jpg")
        String bannerImageUrl,

        @Schema(description = "Formato de exibição", example = "TV")
        String format,

        @Schema(description = "Status de exibição", example = "FINISHED")
        String status,

        @Schema(description = "Nota média de avaliação", example = "8.65")
        BigDecimal score,

        @Schema(description = "Ano de lançamento", example = "2013")
        Integer seasonYear,

        @Schema(description = "Total de episódios cadastrados", example = "25")
        Integer totalEpisodes,

        @Schema(description = "Lista de gêneros da obra", example = "[\"Action\", \"Drama\", \"Fantasy\"]")
        Set<String> genres
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
