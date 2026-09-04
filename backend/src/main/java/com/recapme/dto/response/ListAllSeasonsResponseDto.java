package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Builder
@Schema(description = "Lista de temporadas cadastradas para uma obra")
public record ListAllSeasonsResponseDto(
        @Schema(description = "Identificador único da obra", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID mediaId,

        @Schema(description = "Lista de temporadas da obra")
        List<SeasonSummaryDto> seasons
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
