package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta de confirmação do registro de feedback")
public class SaveFeedbackResponseDto implements Serializable {

    @Schema(description = "ID único gerado para o feedback", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID id;

    @Schema(description = "Status do processamento do feedback", example = "SUCCESS")
    private String status;

    @Schema(description = "Data e hora de criação do registro de feedback", example = "2026-08-28T09:15:30")
    private LocalDateTime createdAt;
}
