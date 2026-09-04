package com.recapme.client.anilist;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AniListDto {

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
        private Integer status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataContainer {
        private MediaContainer banner;
        private PageContainer trending;
        private PageContainer popular;
        private PageContainer topRated;
        private MediaContainer Media;
        private PageContainer Page;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PageContainer {
        private List<MediaContainer> media;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MediaContainer {
        private Integer id;
        private Title title;
        private CoverImage coverImage;
        private String bannerImage;
        private String format;
        private Integer duration;
        private Double meanScore;
        private String status;
        private List<String> genres;
        private Integer seasonYear;
        private String season;
        private String description;
        private Integer episodes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Title {
        private String romaji;
        private String english;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoverImage {
        private String color;
        private String medium;
        private String large;
        private String extraLarge;

        public String getBestQualityUrl() {
            if (extraLarge != null && !extraLarge.isBlank()) return extraLarge;
            if (large != null && !large.isBlank()) return large;
            return medium;
        }
    }
}
