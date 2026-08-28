package com.recapme.controller;

import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.response.SaveFeedbackResponseDto;
import com.recapme.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Feedbacks", description = "Operações para envio e registro de feedbacks dos usuários")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(
            summary = "Registrar feedback do usuário",
            description = "Salva a avaliação (positiva ou negativa) e comentário opcional sobre a qualidade das recapitulações ou respostas do chat."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Feedback registrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SaveFeedbackResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados do feedback inválidos ou campos obrigatórios ausentes",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ao salvar o feedback",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PostMapping
    public ResponseEntity<SaveFeedbackResponseDto> saveFeedback(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Payload com tipo de contexto, avaliação (POSITIVE/NEGATIVE) e comentário opcional",
                    required = true
            )
            @RequestBody @Valid SaveFeedbackRequestDto saveFeedbackRequestDto) {
        SaveFeedbackResponseDto response = feedbackService.saveFeedback(saveFeedbackRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
