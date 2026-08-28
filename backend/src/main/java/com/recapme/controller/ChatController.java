package com.recapme.controller;

import com.recapme.dto.request.ChatRequestDto;
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
@RequestMapping("/chats")
@RequiredArgsConstructor
@Tag(name = "Chat com IA", description = "Assistente de conversação com inteligência artificial e contenção de spoilers")
public class ChatController {

    private final ChatAiService chatAiService;

    @Operation(
            summary = "Transmitir resposta do assistente (Stream SSE)",
            description = "Envia uma mensagem ao assistente inteligente para tirar dúvidas sobre a obra. A resposta é transmitida via Server-Sent Events (SSE / text/event-stream) respeitando rigorosamente os limites anti-spoiler configurados (seasonCutoff e episodeCutoff)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Fluxo SSE de texto transmitido em tempo real com sucesso",
                    content = @Content(
                            mediaType = MediaType.TEXT_EVENT_STREAM_VALUE,
                            schema = @Schema(type = "string", description = "Fragmentos de texto da resposta da IA gerados incrementalmente"),
                            examples = @ExampleObject(value = "data: Olá! Até o episódio 9 da 1ª temporada...\n\n")
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados da requisição inválidos ou campos obrigatórios ausentes",
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
                    description = "Payload com parâmetros da pergunta, contexto da obra, histórico de chat e corte anti-spoiler",
                    required = true
            )
            @RequestBody @Valid ChatRequestDto chatRequestDto) {
        return chatAiService.streamChat(chatRequestDto);
    }
}
