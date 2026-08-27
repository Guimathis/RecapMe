package com.recapme.client.tmdb;

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
import java.util.stream.IntStream;

@Slf4j
@Component
public class TmdbClient {

    private final RestClient restClient;

    public TmdbClient(@Qualifier("tmdbRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<MediaItemDto> search(String query, MediaType type) {
        try {
            String endpoint = "/search/multi?query=" + query + "&language=pt-BR&include_adult=false";
            if (type == MediaType.MOVIE) {
                endpoint = "/search/movie?query=" + query + "&language=pt-BR&include_adult=false";
            } else if (type == MediaType.SERIES) {
                endpoint = "/search/tv?query=" + query + "&language=pt-BR&include_adult=false";
            }

            TmdbSearchResponse response = restClient.get()
                    .uri(endpoint)
                    .retrieve()
                    .body(TmdbSearchResponse.class);

            if (response == null || response.getResults() == null) {
                return List.of();
            }

            return response.getResults().stream()
                    .filter(r -> "movie".equals(r.getMediaType()) || "tv".equals(r.getMediaType()) || type != null)
                    .map(this::toMediaItemDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Falha ao consultar TMDb API para query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    public OneMediaResponseDto getDetails(String externalId, MediaType type) {
        try {
            String endpoint = (type == MediaType.MOVIE ? "/movie/" : "/tv/") + externalId + "?language=pt-BR";
            TmdbMediaDetail detail = restClient.get()
                    .uri(endpoint)
                    .retrieve()
                    .body(TmdbMediaDetail.class);

            if (detail == null) {
                return null;
            }

            int seasons = detail.getNumberOfSeasons() != null ? detail.getNumberOfSeasons() : 1;
            List<Integer> availableSeasons = IntStream.rangeClosed(1, seasons).boxed().collect(Collectors.toList());

            return OneMediaResponseDto.builder()
                    .externalId(externalId)
                    .type(type)
                    .source("TMDB")
                    .title(detail.getTitle() != null ? detail.getTitle() : detail.getName())
                    .originalTitle(detail.getOriginalTitle() != null ? detail.getOriginalTitle() : detail.getOriginalName())
                    .overview(detail.getOverview())
                    .posterUrl(detail.getPosterPath() != null ? "https://image.tmdb.org/t/p/w500" + detail.getPosterPath() : null)
                    .backdropUrl(detail.getBackdropPath() != null ? "https://image.tmdb.org/t/p/original" + detail.getBackdropPath() : null)
                    .releaseYear(extractYear(detail.getReleaseDate() != null ? detail.getReleaseDate() : detail.getFirstAirDate()))
                    .totalSeasons(seasons)
                    .totalEpisodes(detail.getNumberOfEpisodes() != null ? detail.getNumberOfEpisodes() : 1)
                    .availableSeasons(availableSeasons)
                    .build();
        } catch (Exception e) {
            log.warn("Erro ao buscar detalhes da obra no TMDb (id: {}, tipo: {}): {}", externalId, type, e.getMessage());
            return null;
        }
    }

    private MediaItemDto toMediaItemDto(TmdbResult result) {
        MediaType itemType = "movie".equalsIgnoreCase(result.getMediaType()) ? MediaType.MOVIE : MediaType.SERIES;
        String title = result.getTitle() != null ? result.getTitle() : result.getName();
        String originalTitle = result.getOriginalTitle() != null ? result.getOriginalTitle() : result.getOriginalName();
        String date = result.getReleaseDate() != null ? result.getReleaseDate() : result.getFirstAirDate();

        return MediaItemDto.builder()
                .externalId(String.valueOf(result.getId()))
                .type(itemType)
                .source("TMDB")
                .title(title)
                .originalTitle(originalTitle)
                .overview(result.getOverview())
                .posterUrl(result.getPosterPath() != null ? "https://image.tmdb.org/t/p/w500" + result.getPosterPath() : null)
                .backdropUrl(result.getBackdropPath() != null ? "https://image.tmdb.org/t/p/original" + result.getBackdropPath() : null)
                .releaseYear(extractYear(date))
                .totalSeasons(1)
                .totalEpisodes(1)
                .build();
    }

    private Integer extractYear(String dateStr) {
        if (dateStr == null || dateStr.length() < 4) return null;
        try {
            return Integer.parseInt(dateStr.substring(0, 4));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Data
    public static class TmdbSearchResponse {
        private List<TmdbResult> results = new ArrayList<>();
    }

    @Data
    public static class TmdbResult {
        private Long id;
        @JsonProperty("media_type")
        private String mediaType;
        private String title;
        private String name;
        @JsonProperty("original_title")
        private String originalTitle;
        @JsonProperty("original_name")
        private String originalName;
        private String overview;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("backdrop_path")
        private String backdropPath;
        @JsonProperty("release_date")
        private String releaseDate;
        @JsonProperty("first_air_date")
        private String firstAirDate;
    }

    @Data
    public static class TmdbMediaDetail {
        private Long id;
        private String title;
        private String name;
        @JsonProperty("original_title")
        private String originalTitle;
        @JsonProperty("original_name")
        private String originalName;
        private String overview;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("backdrop_path")
        private String backdropPath;
        @JsonProperty("release_date")
        private String releaseDate;
        @JsonProperty("first_air_date")
        private String firstAirDate;
        @JsonProperty("number_of_seasons")
        private Integer numberOfSeasons;
        @JsonProperty("number_of_episodes")
        private Integer numberOfEpisodes;
    }
}
