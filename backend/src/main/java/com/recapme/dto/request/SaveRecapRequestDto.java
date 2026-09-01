package com.recapme.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Builder
@Schema(description = "Payload para solicitação de geração ou salvamento de resumo inteligente")
public record SaveRecapRequestDto(
        @NotNull(message = "O ID da mídia é obrigatório")
        @Schema(description = "Identificador único da obra", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID mediaId,

        @Schema(description = "Identificador da temporada (opcional caso o resumo seja para a obra inteira)", example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
        UUID seasonId,

        @Schema(description = "Identificador do episódio (opcional caso o resumo seja para temporada ou obra inteira)", example = "9bb95f64-5717-4562-b3fc-2c963f66af22")
        UUID episodeId,

        @NotBlank(message = "O tipo do resumo é obrigatório (MEDIA, SEASON, EPISODE)")
        @Schema(description = "Escopo do resumo", allowableValues = {"MEDIA", "SEASON", "EPISODE"}, example = "EPISODE", requiredMode = Schema.RequiredMode.REQUIRED)
        String targetType,

        @NotBlank(message = "O nível de spoiler é obrigatório")
        @Schema(description = "Nível de corte de spoiler aplicado ao resumo", example = "S1E1", requiredMode = Schema.RequiredMode.REQUIRED)
        String spoilerLevel
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
