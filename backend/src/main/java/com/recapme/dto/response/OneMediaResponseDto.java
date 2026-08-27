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
public class OneMediaResponseDto implements Serializable {
    private String id;
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
    private List<Integer> availableSeasons;
}
