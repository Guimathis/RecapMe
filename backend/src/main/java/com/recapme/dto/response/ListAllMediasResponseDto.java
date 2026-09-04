package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Builder
@Schema(description = "Resposta paginada da listagem ou busca de obras")
public record ListAllMediasResponseDto(
        @Schema(description = "Lista de obras retornadas para a página atual")
        List<MediaSummaryDto> content,

        @Schema(description = "Número da página atual (iniciando em 0)", example = "0")

        int pageNumber,

        @Schema(description = "Tamanho da página", example = "20")
        int pageSize,

        @Schema(description = "Total de elementos correspondentes ao filtro", example = "42")
        long totalElements,

        @Schema(description = "Total de páginas disponíveis", example = "3")
        int totalPages,

        @Schema(description = "Indica se esta é a última página disponível", example = "false")
        boolean isLast
) implements Serializable {
    @Serial
    static final long serialVersionUID = 1L;
}
