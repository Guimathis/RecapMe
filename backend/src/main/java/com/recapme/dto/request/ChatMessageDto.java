package com.recapme.dto.request;

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
public class ChatMessageDto implements Serializable {

    @NotBlank(message = "O papel (role) da mensagem não pode ser vazio")
    private String role;

    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio")
    private String content;
}
