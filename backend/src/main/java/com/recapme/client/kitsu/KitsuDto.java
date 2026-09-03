package com.recapme.client.kitsu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class KitsuDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GraphQLRequest {
        private String query;
        private Object variables;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GraphQLResponse {
        private DataContainer data;
        private List<GraphQLError> errors;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GraphQLError {
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataContainer {
        private SearchAnimeByTitle searchAnimeByTitle;
        private AnimeNode findAnimeById;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SearchAnimeByTitle {
        private List<AnimeNode> animes;
        private List<AnimeNode> nodes;

        public List<AnimeNode> getAnimeList() {
            if (animes != null) return animes;
            if (nodes != null) return nodes;
            return List.of();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AnimeNode {
        private String id;
        private String season;
        private String startDate;
        private Integer episodeCount;
        private EpisodesConnection episodes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EpisodesConnection {
        private List<EpisodeNode> nodes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EpisodeNode {
        private Integer number;
        private EpisodeTitles titles;
        private EpisodeThumbnail thumbnail;
        private String description;
        private Integer length;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EpisodeTitles {
        private String canonical;
        private String romanized;
        private String original;
        private String translated;

        public String getPreferredTitle(int episodeNumber) {
            if (canonical != null && !canonical.isBlank()) return canonical;
            if (translated != null && !translated.isBlank()) return translated;
            if (romanized != null && !romanized.isBlank()) return romanized;
            if (original != null && !original.isBlank()) return original;
            return "Episódio " + episodeNumber;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EpisodeThumbnail {
        private ThumbnailOriginal original;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ThumbnailOriginal {
        private String url;
    }
}
