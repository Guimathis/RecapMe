package com.recapme.dto.request;

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
public class SaveFeedbackRequestDto implements Serializable {

    private UUID mediaId;

    @NotBlank(message = "O tipo de contexto é obrigatório (ex: RECAP, CHAT)")
    private String contextType;

    @NotBlank(message = "A avaliação é obrigatória (ex: POSITIVE, NEGATIVE)")
    private String rating;

    private String comment;
}
