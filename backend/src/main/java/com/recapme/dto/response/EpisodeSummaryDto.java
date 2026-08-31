package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Builder
@Schema(description = "Resumo dos metadados de um episódio")
public record EpisodeSummaryDto(
        @Schema(description = "Identificador único do episódio", example = "9bb95f64-5717-4562-b3fc-2c963f66af22")
        UUID id,

        @Schema(description = "Número do episódio", example = "1")
        Integer episodeNumber,

        @Schema(description = "Título do episódio", example = "Para Você, 2000 Anos no Futuro")
        String title,

        @Schema(description = "URL do thumbnail oficial do episódio", example = "https://media.kitsu.io/episodes/thumbnails/142981/original.jpg")
        String thumbnailUrl,

        @Schema(description = "Sinopse do episódio se disponível", example = "A vida pacífica dos humanos é interrompida...")
        String synopsis,

        @Schema(description = "Duração em minutos do episódio", example = "24")
        Integer durationMinutes
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
