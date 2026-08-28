package com.recapme.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para envio de avaliação e feedback do usuário sobre resumos ou conversas com o assistente")
public class SaveFeedbackRequestDto implements Serializable {

    @Schema(description = "ID interno da mídia associada ao feedback (opcional)", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private UUID mediaId;

    @NotBlank(message = "O tipo de contexto é obrigatório (ex: RECAP, CHAT)")
    @Schema(description = "Contexto no qual o feedback foi originado", example = "RECAP", allowableValues = {"RECAP", "CHAT"})
    private String contextType;

    @NotBlank(message = "A avaliação é obrigatória (ex: POSITIVE, NEGATIVE)")
    @Schema(description = "Classificação da experiência do usuário", example = "POSITIVE", allowableValues = {"POSITIVE", "NEGATIVE"})
    private String rating;

    @Schema(description = "Comentário adicional opcional fornecido pelo usuário", example = "Resumo excelente e com todos os detalhes cruciais da temporada.")
    private String comment;
}
