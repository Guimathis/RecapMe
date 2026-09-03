package com.recapme.controller;

import com.recapme.dto.response.HomeSectionsResponseDto;
import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.ListAllSeasonsResponseDto;
import com.recapme.dto.response.OneMediaResponseDto;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medias")
@RequiredArgsConstructor
@Tag(name = "Obras e Catálogo", description = "Operações para listagem, busca full-text unaccent, detalhes e ingestão de obras")
public class MediaController {

    private final MediaService mediaService;


    @Operation(
            summary = "Obter seções de destaque para a Home",
            description = "Recupera as 4 seções principais de exibição da Home (Banner Hero, Trending Now, Popular e Top Rated de todos os tempos), sincronizando metadados com o banco de dados local com suporte a cache Caffeine."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Seções da Home recuperadas com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HomeSectionsResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/home")
    public ResponseEntity<HomeSectionsResponseDto> getHomeSections(
            @Parameter(description = "Quantidade de itens por seção", example = "10")
            @RequestParam(value = "perPage", defaultValue = "10") int perPage,
            @Parameter(description = "Ano da temporada para filtrar o banner (opcional)", example = "2024")
            @RequestParam(value = "seasonYear", required = false) Integer seasonYear) {
        HomeSectionsResponseDto response = mediaService.getHomeSections(perPage, seasonYear);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Listar obras em alta (Trending Now)",
            description = "Recupera a lista paginada de obras em alta no momento com base no engajamento recente da comunidade."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de obras em alta recuperada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/trending")
    public ResponseEntity<ListAllMediasResponseDto> getTrending(
            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Quantidade de elementos por página", example = "10")
            @RequestParam(value = "size", defaultValue = "10") int size) {
        ListAllMediasResponseDto response = mediaService.getTrending(page, size);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Listar obras mais populares (Popular)",
            description = "Recupera a lista paginada de obras com maior número de membros e popularidade geral."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de obras populares recuperada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/popular")
    public ResponseEntity<ListAllMediasResponseDto> getPopular(
            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Quantidade de elementos por página", example = "10")
            @RequestParam(value = "size", defaultValue = "10") int size) {
        ListAllMediasResponseDto response = mediaService.getPopular(page, size);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Listar obras mais bem avaliadas (Top Rated All Time)",
            description = "Recupera a lista paginada de obras com as maiores notas médias de avaliação de todos os tempos."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de obras mais bem avaliadas recuperada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/top-rated")
    public ResponseEntity<ListAllMediasResponseDto> getTopRated(
            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Quantidade de elementos por página", example = "10")
            @RequestParam(value = "size", defaultValue = "10") int size) {
        ListAllMediasResponseDto response = mediaService.getTopRated(page, size);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Listar e filtrar obras do catálogo",
            description = "Recupera uma lista paginada de obras cadastradas na base de dados relacional local com suporte a filtros opcionais por gênero, status e ano de lançamento."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de obras recuperada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping
    public ResponseEntity<ListAllMediasResponseDto> listMedias(
            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Quantidade de elementos por página", example = "20")
            @RequestParam(value = "size", defaultValue = "20") int size,
            @Parameter(description = "Gênero da obra para filtro", example = "Action")
            @RequestParam(value = "genre", required = false) String genre,
            @Parameter(description = "Status de exibição (FINISHED, RELEASING, etc.)", example = "FINISHED")
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Ano de lançamento", example = "2024")
            @RequestParam(value = "year", required = false) Integer year,
            @Parameter(description = "Critério de ordenação (ex: score,desc ou seasonYear,desc)", example = "score,desc")
            @RequestParam(value = "sort", defaultValue = "score,desc") String sort) {
        ListAllMediasResponseDto response = mediaService.listAll(page, size, genre, status, year, sort);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Buscar obras por título (Full-Text unaccent e Lazy Ingestion)",
            description = "Executa busca de alta performance tolerante a acentuação na base local. Se nenhum resultado for encontrado localmente, aciona automaticamente o módulo de Ingestão Sob Demanda (AniList + Kitsu), persiste a hierarquia e retorna o resultado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Busca executada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllMediasResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Parâmetros de busca inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/search")
    public ResponseEntity<ListAllMediasResponseDto> searchMedias(
            @Parameter(description = "Termo de busca com o nome ou título da obra", required = true, example = "shingeki")
            @RequestParam(value = "query") String query,
            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página", example = "20")
            @RequestParam(value = "size", defaultValue = "20") int size) {
        ListAllMediasResponseDto response = mediaService.search(query, page, size);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Obter detalhes de uma obra por ID",
            description = "Retorna os detalhes completos de uma obra cadastrada no banco de dados local através de seu identificador único UUID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Obra encontrada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneMediaResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Obra não encontrada no banco de dados local",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<OneMediaResponseDto> getOneMedia(
            @Parameter(description = "Identificador único UUID da obra", required = true, example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
            @PathVariable(value = "id") UUID id) {
        OneMediaResponseDto response = mediaService.getById(id);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(
            summary = "Forçar ingestão ou re-sincronização de obra por ID do AniList",
            description = "Consulta metadados consolidados no AniList e árvore de episódios no Kitsu para persistir ou atualizar uma obra na base local."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Obra ingerida e persistida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OneMediaResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Obra não encontrada no provedor externo AniList",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "Falha na comunicação com as APIs externas de AniList ou Kitsu",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @PostMapping("/ingest/{externalId}")
    public ResponseEntity<OneMediaResponseDto> forceIngest(
            @Parameter(description = "ID da obra no AniList", required = true, example = "16498")
            @PathVariable(value = "externalId") Integer externalId) {
        OneMediaResponseDto response = mediaService.forceIngest(externalId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Listar temporadas de uma obra",
            description = "Retorna todas as temporadas cadastradas para a obra especificada."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Temporadas recuperadas com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ListAllSeasonsResponseDto.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Obra não encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erro interno no servidor",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProblemDetail.class))
            )
    })
    @GetMapping("/{mediaId}/seasons")
    public ResponseEntity<ListAllSeasonsResponseDto> getMediaSeasons(
            @Parameter(description = "Identificador único UUID da obra", required = true, example = "7fa85f64-5717-4562-b3fc-2c963f66afa6")
            @PathVariable(value = "mediaId") UUID mediaId) {
        ListAllSeasonsResponseDto response = mediaService.getSeasonsByMediaId(mediaId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
