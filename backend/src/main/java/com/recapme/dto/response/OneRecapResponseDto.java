package com.recapme.dto.response;

import com.recapme.model.MediaType;
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
public class OneRecapResponseDto implements Serializable {
    private String mediaId;
    private String externalId;
    private MediaType mediaType;
    private String mediaTitle;
    private Integer seasonNumber;
    private String seasonTitle;
    private String seasonSummary;
    private List<String> keyTakeaways;
    private List<EpisodeItemDto> episodes;
}
