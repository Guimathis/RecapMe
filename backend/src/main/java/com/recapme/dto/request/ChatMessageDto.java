package com.recapme.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Representação de uma mensagem individual no histórico de conversa do chat")
public class ChatMessageDto implements Serializable {

    @NotBlank(message = "O papel (role) da mensagem não pode ser vazio")
    @Schema(description = "Papel do autor da mensagem", example = "user", allowableValues = {"user", "assistant", "system"})
    private String role;

    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio")
    @Schema(description = "Conteúdo textual da mensagem", example = "Quem é o líder dos White Walkers?")
    private String content;
}
