package com.recapme.controller;

import com.recapme.dto.response.ListAllEpisodesResponseDto;
import com.recapme.service.SeasonService;
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
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
@Tag(name = "Temporadas", description = "Operações para consulta de episódios por temporada")
public class SeasonController {

    private final SeasonService seasonService;

    @Operation(
            summary = "Listar episódios de uma temporada",
            description = "Recupera a lista completa de episódios pertencentes a uma determinada temporada, incluindo títulos canônicos, números e thumbnails."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Episódios recuperados com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllEpisodesResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Temporada não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{seasonId}/episodes")
    public ResponseEntity<ListAllEpisodesResponseDto> getSeasonEpisodes(
            @Parameter(description = "Identificador único UUID da temporada", required = true, example = "8aa95f64-5717-4562-b3fc-2c963f66af11")
            @PathVariable(value = "seasonId") UUID seasonId) {
        ListAllEpisodesResponseDto response = seasonService.getEpisodesBySeasonId(seasonId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
