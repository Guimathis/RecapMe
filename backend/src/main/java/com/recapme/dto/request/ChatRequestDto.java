package com.recapme.dto.request;

import com.recapme.model.MediaType;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Requisição para envio de mensagem ao assistente com controle de spoilers por temporada e episódio")
public class ChatRequestDto implements Serializable {

    @NotBlank(message = "O ID externo da obra é obrigatório")
    @Schema(description = "Identificador externo da obra na base de dados de origem (ex: TMDB ID)", example = "1399")
    private String externalId;

    @NotNull(message = "O tipo de mídia é obrigatório")
    @Schema(description = "Tipo da obra selecionada", example = "SERIES")
    private MediaType mediaType;

    @NotBlank(message = "O título da obra é obrigatório")
    @Schema(description = "Título da obra para contexto do assistente", example = "Game of Thrones")
    private String title;

    @NotBlank(message = "A mensagem do usuário não pode estar em branco")
    @Schema(description = "Pergunta ou comentário do usuário para o assistente", example = "O que aconteceu com o Ned Stark?")
    private String message;

    @NotNull(message = "A temporada máxima permitida é obrigatória")
    @Min(value = 1, message = "A temporada deve ser no mínimo 1")
    @Schema(description = "Temporada limite assistida pelo usuário (barreira anti-spoiler)", example = "1")
    private Integer seasonCutoff;

    @NotNull(message = "O episódio máximo permitido é obrigatório")
    @Min(value = 1, message = "O episódio deve ser no mínimo 1")
    @Schema(description = "Episódio limite assistido pelo usuário na temporada de corte (barreira anti-spoiler)", example = "9")
    private Integer episodeCutoff;

    @Builder.Default
    @Schema(description = "Histórico prévio de mensagens trocadas na sessão atual")
    private List<ChatMessageDto> history = new ArrayList<>();
}
