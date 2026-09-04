package com.recapme.controller;

import com.recapme.dto.request.SendChatMessageRequestDto;
import com.recapme.service.ChatAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chat com IA Anti-Spoiler", description = "Assistente conversacional com IA e barreira contextual anti-spoiler")
public class ChatController {

    private final ChatAiService chatAiService;

    @Operation(
            summary = "Transmitir resposta do assistente (Stream SSE)",
            description = "Envia uma mensagem ao assistente inteligente para tirar dúvidas sobre a obra. A resposta é transmitida via Server-Sent Events (SSE / text/event-stream) respeitando rigorosamente a barreira de spoiler informada (upToSeasonNumber e upToEpisodeNumber)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Fluxo SSE de texto transmitido em tempo real com sucesso",
                    content = @Content(
                            mediaType = MediaType.TEXT_EVENT_STREAM_VALUE,
                            schema = @Schema(type = "string", description = "Fragmentos incrementais de texto da resposta da IA"),
                            examples = @ExampleObject(value = "data: Olá! Até a 1ª temporada, episódio 5...\n\n")
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados da requisição inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ou na comunicação com o modelo de IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Payload contendo a mensagem do usuário, identificador da obra e limites de spoiler",
                    required = true
            )
            @RequestBody @Valid SendChatMessageRequestDto sendChatMessageRequestDto) {
        return chatAiService.streamChat(sendChatMessageRequestDto);
    }
}
