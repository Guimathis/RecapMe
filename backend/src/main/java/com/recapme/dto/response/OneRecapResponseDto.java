package com.recapme.dto.response;

import com.recapme.model.MediaType;
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
@Schema(description = "Recapitulação completa de uma temporada com resumo geral, pontos-chave e breakdown de episódios")
public class OneRecapResponseDto implements Serializable {

    @Schema(description = "Identificador único interno da mídia na base de dados", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    private String mediaId;

    @Schema(description = "Identificador externo da obra", example = "1399")
    private String externalId;

    @Schema(description = "Tipo da mídia recapitulada", example = "SERIES")
    private MediaType mediaType;

    @Schema(description = "Título da mídia", example = "Game of Thrones")
    private String mediaTitle;

    @Schema(description = "Número da temporada recapitulada", example = "1")
    private Integer seasonNumber;

    @Schema(description = "Título da temporada", example = "Temporada 1")
    private String seasonTitle;

    @Schema(description = "Resumo detalhado dos acontecimentos da temporada completa", example = "A primeira temporada foca no conflito político pelo Trono de Ferro após a morte de Jon Arryn...")
    private String seasonSummary;

    @Schema(description = "Principais conclusões e pontos cruciais a serem lembrados", example = "[\"Ned Stark é executado em Porto Real\", \"Daenerys Targaryen choca três ovos de dragão\"]")
    private List<String> keyTakeaways;

    @Schema(description = "Lista detalhada com resumos individuais de cada episódio da temporada")
    private List<EpisodeItemDto> episodes;
}
