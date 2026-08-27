package com.recapme.client.jikan;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.recapme.dto.response.MediaItemDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.model.MediaType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JikanClient {

    private final RestClient restClient;

    public JikanClient(@Qualifier("jikanRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<MediaItemDto> search(String query) {
        try {
            JikanSearchResponse response = restClient.get()
                    .uri("/anime?q={q}&limit=10&sfw=true", query)
                    .retrieve()
                    .body(JikanSearchResponse.class);

            if (response == null || response.getData() == null) {
                return List.of();
            }

            return response.getData().stream()
                    .map(this::toMediaItemDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Falha ao consultar Jikan API para query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    public OneMediaResponseDto getDetails(String externalId) {
        try {
            JikanDetailResponse response = restClient.get()
                    .uri("/anime/{id}/full", externalId)
                    .retrieve()
                    .body(JikanDetailResponse.class);

            if (response == null || response.getData() == null) {
                return null;
            }

            JikanAnimeData data = response.getData();
            String poster = data.getImages() != null && data.getImages().getJpg() != null 
                    ? data.getImages().getJpg().getLargeImageUrl() : null;

            return OneMediaResponseDto.builder()
                    .externalId(externalId)
                    .type(MediaType.ANIME)
                    .source("JIKAN")
                    .title(data.getTitle())
                    .originalTitle(data.getTitleJapanese())
                    .overview(data.getSynopsis())
                    .posterUrl(poster)
                    .backdropUrl(poster)
                    .releaseYear(data.getYear())
                    .totalSeasons(1)
                    .totalEpisodes(data.getEpisodes() != null ? data.getEpisodes() : 1)
                    .availableSeasons(List.of(1))
                    .build();
        } catch (Exception e) {
            log.warn("Erro ao buscar detalhes de anime no Jikan (id: {}): {}", externalId, e.getMessage());
            return null;
        }
    }

    private MediaItemDto toMediaItemDto(JikanAnimeData data) {
        String poster = data.getImages() != null && data.getImages().getJpg() != null 
                ? data.getImages().getJpg().getImageUrl() : null;

        return MediaItemDto.builder()
                .externalId(String.valueOf(data.getMalId()))
                .type(MediaType.ANIME)
                .source("JIKAN")
                .title(data.getTitle())
                .originalTitle(data.getTitleJapanese())
                .overview(data.getSynopsis())
                .posterUrl(poster)
                .backdropUrl(poster)
                .releaseYear(data.getYear())
                .totalSeasons(1)
                .totalEpisodes(data.getEpisodes() != null ? data.getEpisodes() : 1)
                .build();
    }

    @Data
    public static class JikanSearchResponse {
        private List<JikanAnimeData> data = new ArrayList<>();
    }

    @Data
    public static class JikanDetailResponse {
        private JikanAnimeData data;
    }

    @Data
    public static class JikanAnimeData {
        @JsonProperty("mal_id")
        private Long malId;
        private String title;
        @JsonProperty("title_japanese")
        private String titleJapanese;
        private String synopsis;
        private Integer year;
        private Integer episodes;
        private JikanImages images;
    }

    @Data
    public static class JikanImages {
        private JikanImageFormats jpg;
    }

    @Data
    public static class JikanImageFormats {
        @JsonProperty("image_url")
        private String imageUrl;
        @JsonProperty("large_image_url")
        private String largeImageUrl;
    }
}
