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
@Schema(description = "Detalhes e resumo de um episódio individual")
public class EpisodeItemDto implements Serializable {

    @Schema(description = "Número ordinal do episódio dentro da temporada", example = "1")
    private Integer episodeNumber;

    @Schema(description = "Título do episódio", example = "Winter Is Coming")
    private String title;

    @Schema(description = "Resumo detalhado dos acontecimentos do episódio", example = "Lord Eddard Stark é preocupado com relatos de um desertor da Patrulha da Noite...")
    private String summary;

    @Schema(description = "Lista dos principais acontecimentos e revelações do episódio", example = "[\"Rei Robert chega a Winterfell\", \"Bran Stark descobre o segredo de Jaime e Cersei\"]")
    private List<String> keyEvents;
}
