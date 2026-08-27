package com.recapme.dto.response;

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
public class EpisodeItemDto implements Serializable {
    private Integer episodeNumber;
    private String title;
    private String summary;
    private List<String> keyEvents;
}
