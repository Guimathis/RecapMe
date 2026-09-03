package com.recapme.dto.response;

import com.recapme.model.Episode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Builder
@Schema(description = "Resumo dos dados de uma temporada")
public record SeasonSummaryDto(
        @Schema(description = "Identificador único da temporada", example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
        UUID id,

        @Schema(description = "Número sequencial da temporada", example = "1")
        Integer seasonNumber,

        @Schema(description = "Título da temporada", example = "Temporada 1")
        String title,

        @Schema(description = "Quantidade de episódios da temporada", example = "25")
        Integer episodeCount,

        @Schema(description = "Lista de episódios da temporada")
        List<EpisodeSummaryDto> episodes
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
