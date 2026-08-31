package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Builder
@Schema(description = "Lista de episódios de uma determinada temporada")
public record ListAllEpisodesResponseDto(
        @Schema(description = "Identificador único da temporada", example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
        UUID seasonId,

        @Schema(description = "Número da temporada", example = "1")
        Integer seasonNumber,

        @Schema(description = "Lista de episódios da temporada")
        List<EpisodeSummaryDto> episodes
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
