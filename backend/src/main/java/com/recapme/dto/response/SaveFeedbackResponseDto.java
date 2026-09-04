package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Builder
@Schema(description = "Confirmação de recebimento de feedback")
public record SaveFeedbackResponseDto(
        @Schema(description = "Identificador único do feedback", example = "9ee95f64-5717-4562-b3fc-2c963f66af55")
        UUID id,

        @Schema(description = "Identificador da mídia associada (se informado)", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID mediaId,

        @Schema(description = "Contexto avaliado", example = "RECAP")
        String contextType,

        @Schema(description = "Avaliação informada", example = "POSITIVE")
        String rating,

        @Schema(description = "Comentário registrado", example = "Resumo muito preciso e sem spoilers!")
        String comment,

        @Schema(description = "Data e hora do registro")
        Instant createdAt
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
