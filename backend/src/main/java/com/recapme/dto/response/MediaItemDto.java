package com.recapme.dto.response;

import com.recapme.model.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaItemDto implements Serializable {
    private String externalId;
    private MediaType type;
    private String source;
    private String title;
    private String originalTitle;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private Integer releaseYear;
    private Integer totalSeasons;
    private Integer totalEpisodes;
}
