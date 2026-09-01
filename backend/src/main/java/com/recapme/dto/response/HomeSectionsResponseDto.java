package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Builder
@Schema(description = "Seções agregadas de destaque para exibição na página inicial (Home)")
public record HomeSectionsResponseDto(
        @Schema(description = "Obra em destaque para o banner hero principal")
        MediaSummaryDto banner,

        @Schema(description = "Obras em alta no momento (Trending Now)")
        List<MediaSummaryDto> trending,

        @Schema(description = "Obras mais populares de todos os tempos (Popular)")
        List<MediaSummaryDto> popular,

        @Schema(description = "Obras mais bem avaliadas de todos os tempos (Top Rated All Time)")
        List<MediaSummaryDto> topRated
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
