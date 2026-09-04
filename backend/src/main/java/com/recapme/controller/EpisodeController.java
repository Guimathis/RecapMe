package com.recapme.controller;

import com.recapme.dto.response.OneEpisodeResponseDto;
import com.recapme.service.EpisodeService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/episodes")
@RequiredArgsConstructor
@Tag(name = "Episódios", description = "Operações para consulta detalhada de episódios individuais")
public class EpisodeController {

    private final EpisodeService episodeService;

    @Operation(
            summary = "Obter detalhes de um episódio por ID",
            description = "Recupera os dados completos de um episódio pelo seu identificador único UUID, incluindo número, título, duração e thumbnail."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Episódio encontrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneEpisodeResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Episódio não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<OneEpisodeResponseDto> getOneEpisode(
            @Parameter(description = "Identificador único UUID do episódio", required = true, example = "9bb95f64-5717-4562-b3fc-2c963f66af22")
            @   PathVariable(value = "id") UUID id) {
        OneEpisodeResponseDto response = episodeService.getById(id);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
