package com.recapme.client.anilist;

import com.recapme.common.exception.ExternalIntegrationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class AniListClient {

    private final RestClient anilistRestClient;

    private static final String GET_ANIME_INFO_QUERY = """
        query getAnimeInfo($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
            }
            coverImage {
              color
              medium
              large
              extraLarge
            }
            bannerImage
            format
            duration
            meanScore
            status
            genres
            seasonYear
            season
            description
            episodes
          }
        }
    """;

    private static final String SEARCH_ANIME_QUERY = """
        query searchAnime($page: Int, $perPage: Int, $keyword: String) {
          Page(perPage: $perPage, page: $page) {
            media(type: ANIME, search: $keyword) {
              id
              title {
                romaji
                english
              }
              coverImage {
                color
                medium
                large
                extraLarge
              }
              bannerImage
              format
              duration
              meanScore
              status
              genres
              seasonYear
              season
              description
              episodes
            }
          }
        }
    """;

    private static final String GET_POPULAR_BANNER_QUERY = """
        query getPopularBanner($seasonYear: Int) {
          Page(perPage: 20, page: 1) {
            media(type: ANIME, sort: POPULARITY_DESC, seasonYear: $seasonYear) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
                extraLarge
              }
              bannerImage
              format
              duration
              meanScore
              status
              genres
              seasonYear
              season
              description
              episodes
            }
          }
        }
    """;

    public AniListClient(@Qualifier("anilistRestClient") RestClient anilistRestClient) {
        this.anilistRestClient = anilistRestClient;
    }

    public Optional<AniListDto.MediaContainer> getAnimeInfo(Integer id) {
        if (id == null) {
            return Optional.empty();
        }

        try {
            AniListDto.GraphQLRequest request = new AniListDto.GraphQLRequest(
                    GET_ANIME_INFO_QUERY,
                    Map.of("id", id)
            );

            AniListDto.GraphQLResponse response = anilistRestClient.post()
                    .body(request)
                    .retrieve()
                    .body(AniListDto.GraphQLResponse.class);

            if (response == null || response.getData() == null) {
                return Optional.empty();
            }

            return Optional.ofNullable(response.getData().getMedia());
        } catch (Exception e) {
            log.error("Failed to fetch anime info from AniList for id {}: {}", id, e.getMessage());
            throw new ExternalIntegrationException("AniList", "Failed to retrieve media with id " + id, e);
        }
    }

    public List<AniListDto.MediaContainer> searchAnime(String keyword, int page, int perPage) {
        if (keyword == null || keyword.trim().isBlank()) {
            return Collections.emptyList();
        }

        try {
            AniListDto.GraphQLRequest request = new AniListDto.GraphQLRequest(
                    SEARCH_ANIME_QUERY,
                    Map.of(
                            "keyword", keyword.trim(),
                            "page", Math.max(1, page),
                            "perPage", Math.max(1, perPage)
                    )
            );

            AniListDto.GraphQLResponse response = anilistRestClient.post()
                    .body(request)
                    .retrieve()
                    .body(AniListDto.GraphQLResponse.class);

            if (response == null || response.getData() == null || response.getData().getPage() == null) {
                return Collections.emptyList();
            }

            List<AniListDto.MediaContainer> list = response.getData().getPage().getMedia();
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to search anime from AniList for keyword '{}': {}", keyword, e.getMessage());
            throw new ExternalIntegrationException("AniList", "Failed to search anime for keyword: " + keyword, e);
        }
    }

    public List<AniListDto.MediaContainer> getPopularBanner(Integer seasonYear) {
        try {
            AniListDto.GraphQLRequest request = new AniListDto.GraphQLRequest(
                    GET_POPULAR_BANNER_QUERY,
                    seasonYear != null ? Map.of("seasonYear", seasonYear) : Map.of()
            );

            AniListDto.GraphQLResponse response = anilistRestClient.post()
                    .body(request)
                    .retrieve()
                    .body(AniListDto.GraphQLResponse.class);

            if (response == null || response.getData() == null || response.getData().getPage() == null) {
                return Collections.emptyList();
            }

            List<AniListDto.MediaContainer> list = response.getData().getPage().getMedia();
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch popular banners from AniList: {}", e.getMessage());
            throw new ExternalIntegrationException("AniList", "Failed to fetch popular banners", e);
        }
    }
}
