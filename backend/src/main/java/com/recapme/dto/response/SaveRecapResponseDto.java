package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Builder
@Schema(description = "Resposta após salvar ou gerar um resumo")
public record SaveRecapResponseDto(
        @Schema(description = "Identificador único do resumo gerado", example = "1cc95f64-5717-4562-b3fc-2c963f66af33")
        UUID id,

        @Schema(description = "Identificador único da obra", example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID mediaId,

        @Schema(description = "Identificador da temporada (se aplicável)", example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
        UUID seasonId,

        @Schema(description = "Identificador do episódio (se aplicável)", example = "9bb95f64-5717-4562-b3fc-2c963f66af22")
        UUID episodeId,

        @Schema(description = "Escopo do resumo", example = "EPISODE")
        String targetType,

        @Schema(description = "Nível de corte de spoiler aplicado", example = "S1E1")
        String spoilerLevel,

        @Schema(description = "Conteúdo narrativo do resumo formatado em Markdown")
        String content,

        @Schema(description = "Data e hora de geração")
        Instant createdAt
) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
