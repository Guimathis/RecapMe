package com.recapme.controller;

import com.recapme.dto.request.SaveRecapRequestDto;
import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.dto.response.SaveRecapResponseDto;
import com.recapme.service.RecapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recaps")
@RequiredArgsConstructor
@Tag(name = "Resumos Inteligentes", description = "Operações para geração e consulta de resumos por obra, temporada ou episódio")
public class RecapController {

    private final RecapService recapService;

    @Operation(
            summary = "Obter resumo inteligente existente",
            description = "Recupera um resumo persistido na base local com base no escopo solicitado (obra, temporada ou episódio específico)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Resumo recuperado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneRecapResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Resumo não encontrado para o escopo solicitado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping
    public ResponseEntity<OneRecapResponseDto> getOneRecap(
            @Parameter(description = "Identificador único UUID da obra", required = true, example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
            @RequestParam(value = "mediaId") UUID mediaId,
            @Parameter(description = "Identificador único UUID da temporada (opcional)", example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
            @RequestParam(value = "seasonId", required = false) UUID seasonId,
            @Parameter(description = "Identificador único UUID do episódio (opcional)", example = "9bb95f64-5717-4562-b3fc-2c963f66af22")
            @RequestParam(value = "episodeId", required = false) UUID episodeId) {
        OneRecapResponseDto response = recapService.getRecap(mediaId, seasonId, episodeId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Gerar e salvar novo resumo inteligente",
            description = "Gera um novo resumo via IA para o escopo especificado, persiste o conteúdo no banco de dados e retorna os detalhes."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Resumo gerado e salvo com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SaveRecapResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados da requisição inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Mídia, temporada ou episódio informado não existe",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ao sintetizar o resumo com IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PostMapping
    public ResponseEntity<SaveRecapResponseDto> saveRecap(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Payload com identificadores e configurações de spoiler para o resumo",
                    required = true
            )
            @RequestBody @Valid SaveRecapRequestDto saveRecapRequestDto) {
        SaveRecapResponseDto response = recapService.createRecap(saveRecapRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
