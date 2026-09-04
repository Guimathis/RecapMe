package com.recapme.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Builder
@Schema(description = "Payload para envio de mensagem de chat com IA anti-spoiler")
public record SendChatMessageRequestDto(
        @NotNull(message = "O ID da mídia é obrigatório")
        @Schema(description = "Identificador único da obra consultada", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID mediaId,

        @JsonAlias({"seasonCutoff", "season"})
        @Min(value = 1, message = "O corte de temporada deve ser no mínimo 1")
        @Schema(description = "Número máximo da temporada já assistida", example = "1", defaultValue = "1")
        Integer upToSeasonNumber,

        @JsonAlias({"episodeCutoff", "episode"})
        @Min(value = 1, message = "O corte de episódio deve ser no mínimo 1")
        @Schema(description = "Número máximo do episódio já assistido na temporada limite", example = "5", defaultValue = "1")
        Integer upToEpisodeNumber,

        @JsonAlias({"message", "content"})
        @NotBlank(message = "A mensagem do usuário não pode estar em branco")
        @Schema(description = "Pergunta ou comentário do usuário", example = "Quem destruiu o portão da muralha?", requiredMode = Schema.RequiredMode.REQUIRED)
        String userMessage
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
