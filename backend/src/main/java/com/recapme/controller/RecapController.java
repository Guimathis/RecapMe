package com.recapme.controller;

import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.model.MediaType;
import com.recapme.service.RecapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recaps")
@RequiredArgsConstructor
@Tag(name = "Recapitulações", description = "Operações para geração e consulta de resumos inteligentes de temporadas")
public class RecapController {

    private final RecapService recapService;

    @Operation(
            summary = "Obter recapitulação de uma temporada",
            description = "Gera ou busca em cache/persistência a recapitulação completa de uma temporada específica com resumo geral, pontos essenciais e divisão episódio por episódio."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Recapitulação da temporada obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneRecapResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Mídia ou temporada solicitada não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ao sintetizar o resumo com IA",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{type}/{externalId}")
    public ResponseEntity<OneRecapResponseDto> getOneRecap(
            @Parameter(description = "Tipo da obra (MOVIE, SERIES ou ANIME)", required = true, example = "SERIES")
            @PathVariable(value = "type") MediaType type,
            @Parameter(description = "Identificador externo da obra no provedor original", required = true, example = "1399")
            @PathVariable(value = "externalId") String externalId,
            @Parameter(description = "Número da temporada a ser recapitulada (padrão: 1)", example = "1")
            @RequestParam(value = "season", required = false, defaultValue = "1") Integer season) {
        OneRecapResponseDto response = recapService.getSeasonRecap(type, externalId, season);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
