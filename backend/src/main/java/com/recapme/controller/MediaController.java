package com.recapme.controller;

import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.model.MediaType;
import com.recapme.service.MediaService;
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
@RequestMapping("/medias")
@RequiredArgsConstructor
@Tag(name = "Mídias", description = "Operações para busca e consulta de detalhes de obras (filmes, séries e animes)")
public class MediaController {

    private final MediaService mediaService;

    @Operation(
            summary = "Buscar mídias por título",
            description = "Pesquisa obras em bases integradas (TMDB para filmes/séries e Jikan para animes) com suporte a filtro opcional por tipo de mídia."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Busca executada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Parâmetros de requisição inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ou falha na integração com APIs externas",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/search")
    public ResponseEntity<ListAllMediasResponseDto> searchMedias(
            @Parameter(description = "Termo de busca com o nome ou título da obra", required = true, example = "Game of Thrones")
            @RequestParam(value = "query") String query,
            @Parameter(description = "Filtro opcional pelo tipo de mídia (MOVIE, SERIES, ANIME)", example = "SERIES")
            @RequestParam(value = "type", required = false) MediaType type) {
        ListAllMediasResponseDto response = mediaService.search(query, type);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Obter detalhes de uma mídia",
            description = "Retorna os detalhes completos de uma obra (título, sinopse, temporadas, número de episódios e pôsteres) a partir do seu tipo e ID externo."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Detalhes da obra recuperados com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneMediaResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Mídia não encontrada para os parâmetros informados",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor ao processar os detalhes da obra",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{type}/{externalId}")
    public ResponseEntity<OneMediaResponseDto> getOneMedia(
            @Parameter(description = "Tipo da obra (MOVIE, SERIES ou ANIME)", required = true, example = "SERIES")
            @PathVariable(value = "type") MediaType type,
            @Parameter(description = "Identificador externo da obra no provedor original (TMDB/Jikan)", required = true, example = "1399")
            @PathVariable(value = "externalId") String externalId) {
        OneMediaResponseDto response = mediaService.getDetails(type, externalId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
