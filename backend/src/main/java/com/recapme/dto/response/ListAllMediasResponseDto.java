package com.recapme.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta contendo a lista de mídias encontradas na busca")
public class ListAllMediasResponseDto implements Serializable {

    @Schema(description = "Lista de obras (filmes, séries, animes) resultantes da pesquisa")
    private List<MediaItemDto> items;

    @Schema(description = "Quantidade total de resultados retornados", example = "10")
    private int total;
}
