package com.recapme.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Builder
@Schema(description = "Payload para registro de feedback de usuário")
public record SaveFeedbackRequestDto(
        @Schema(description = "Identificador opcional da mídia associada", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID mediaId,

        @NotBlank(message = "O contexto do feedback é obrigatório")
        @Schema(description = "Contexto da interação avaliada (RECAP, CHAT, APP)", example = "RECAP", requiredMode = Schema.RequiredMode.REQUIRED)
        String contextType,

        @NotBlank(message = "A avaliação é obrigatória")
        @Schema(description = "Avaliação informada (POSITIVE, NEGATIVE, etc.)", example = "POSITIVE", requiredMode = Schema.RequiredMode.REQUIRED)
        String rating,

        @Schema(description = "Comentário opcional do usuário", example = "Resumo muito preciso e sem spoilers!")
        String comment
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
