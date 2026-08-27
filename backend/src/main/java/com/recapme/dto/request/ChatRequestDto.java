package com.recapme.dto.request;

import com.recapme.model.MediaType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto implements Serializable {

    @NotBlank(message = "O ID externo da obra é obrigatório")
    private String externalId;

    @NotNull(message = "O tipo de mídia é obrigatório")
    private MediaType mediaType;

    @NotBlank(message = "O título da obra é obrigatório")
    private String title;

    @NotBlank(message = "A mensagem do usuário não pode estar em branco")
    private String message;

    @NotNull(message = "A temporada máxima permitida é obrigatória")
    @Min(value = 1, message = "A temporada deve ser no mínimo 1")
    private Integer seasonCutoff;

    @NotNull(message = "O episódio máximo permitido é obrigatório")
    @Min(value = 1, message = "O episódio deve ser no mínimo 1")
    private Integer episodeCutoff;

    @Builder.Default
    private List<ChatMessageDto> history = new ArrayList<>();
}
