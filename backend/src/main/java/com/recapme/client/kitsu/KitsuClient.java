package com.recapme.client.kitsu;

import com.recapme.common.exception.ExternalIntegrationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Component
public class KitsuClient {

    private final RestClient kitsuRestClient;

    private static final String GET_ANIMES_KITSU_QUERY = """
        query getAnimesKitsu($first: Int, $title: String!) {
          searchAnimeByTitle(title: $title, first: $first) {
            animes: nodes {
              id
              season
              startDate
              episodeCount
              episodes(first: 100) {
                nodes {
                  number
                  titles {
                    canonical
                    romanized
                    original
                    translated
                  }
                  description(locales: ["en"])
                  thumbnail {
                    original {
                      url
                    }
                  }
                  length
                }
              }
            }
          }
        }
    """;

    private static final String GET_EPISODE_KITSU_QUERY = """
        query getEpisodeKitsu($id: ID!, $first: Int) {
          findAnimeById(id: $id) {
            id
            episodeCount
            episodes(first: $first) {
              nodes {
                number
                titles {
                  romanized
                  original
                  translated
                }
                thumbnail {
                  original {
                    url
                  }
                }
                length
              }
            }
          }
        }
    """;

    public KitsuClient(@Qualifier("kitsuRestClient") RestClient kitsuRestClient) {
        this.kitsuRestClient = kitsuRestClient;
    }

    public List<KitsuDto.AnimeNode> getAnimesKitsu(String title, int first) {
        if (title == null || title.trim().isBlank()) {
            return Collections.emptyList();
        }

        try {
            KitsuDto.GraphQLRequest request = new KitsuDto.GraphQLRequest(
                    GET_ANIMES_KITSU_QUERY,
                    Map.of("title", title.trim(), "first", Math.max(1, first))
            );

            KitsuDto.GraphQLResponse response = kitsuRestClient.post()
                    .body(request)
                    .retrieve()
                    .body(KitsuDto.GraphQLResponse.class);

            if (response == null || response.getData() == null || response.getData().getSearchAnimeByTitle() == null) {
                return Collections.emptyList();
            }

            return response.getData().getSearchAnimeByTitle().getAnimeList();
        } catch (Exception e) {
            log.warn("Kitsu GraphQL query failed for title '{}': {}", title, e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<KitsuDto.AnimeNode> getEpisodeKitsu(String id, int first) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }

        try {
            KitsuDto.GraphQLRequest request = new KitsuDto.GraphQLRequest(
                    GET_EPISODE_KITSU_QUERY,
                    Map.of("id", id, "first", Math.max(1, first))
            );

            KitsuDto.GraphQLResponse response = kitsuRestClient.post()
                    .body(request)
                    .retrieve()
                    .body(KitsuDto.GraphQLResponse.class);

            if (response == null || response.getData() == null) {
                return Optional.empty();
            }

            return Optional.ofNullable(response.getData().getFindAnimeById());
        } catch (Exception e) {
            log.warn("Kitsu GraphQL findAnimeById failed for id '{}': {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Implements the exact matching algorithm from AnimeFlix (packages/api/src/api.ts & frontend/pages/anime/[id].tsx):
     * Matches title + season + startDate.year, checking both english and romaji titles.
     */
    public Optional<KitsuDto.AnimeNode> getKitsuEpisodes(String englishTitle, String romajiTitle, String season, Integer startDateYear) {
//        KitsuDto.AnimeNode englishMatch = findKitsuMatch(englishTitle, season, startDateYear);
        KitsuDto.AnimeNode romajiMatch = findKitsuMatch(romajiTitle, season, startDateYear);

        int romajiCount = (romajiMatch != null && romajiMatch.getEpisodes() != null && romajiMatch.getEpisodes().getNodes() != null)
                ? romajiMatch.getEpisodes().getNodes().size() : 0;

        if (romajiCount > 0) {
            return Optional.of(romajiMatch);
        } else if (romajiMatch != null) {
            return Optional.of(romajiMatch);
        }

        return Optional.empty();
    }

    private KitsuDto.AnimeNode findKitsuMatch(String title, String season, Integer startDateYear) {
        if (title == null || title.trim().isBlank()) {
            return null;
        }

        List<KitsuDto.AnimeNode> nodes = getAnimesKitsu(title, 8);
        if (nodes.isEmpty()) {
            return null;
        }

        // 1. Strict match: startDate.year + season
        for (KitsuDto.AnimeNode node : nodes) {
            if (node == null || node.getStartDate() == null) continue;
            String nodeYear = node.getStartDate().trim().split("-")[0];

            boolean yearMatches = startDateYear != null && nodeYear.equals(startDateYear.toString());
            boolean seasonMatches = (season == null || season.isBlank()) || (node.getSeason() != null && node.getSeason().equalsIgnoreCase(season));

            if (yearMatches && seasonMatches) {
                return enrichNodeIfEmpty(node);
            }
        }

        // 2. Fallback match: startDate.year
        if (startDateYear != null) {
            for (KitsuDto.AnimeNode node : nodes) {
                if (node == null || node.getStartDate() == null) continue;
                String nodeYear = node.getStartDate().trim().split("-")[0];
                if (nodeYear.equals(startDateYear.toString())) {
                    return enrichNodeIfEmpty(node);
                }
            }
        }

        // 3. Last fallback: first node if any
        return enrichNodeIfEmpty(nodes.get(0));
    }

    private KitsuDto.AnimeNode enrichNodeIfEmpty(KitsuDto.AnimeNode node) {
        if (node == null) return null;
        if (node.getEpisodes() == null || node.getEpisodes().getNodes() == null || node.getEpisodes().getNodes().isEmpty()) {
            if (node.getId() != null && !node.getId().isBlank()) {
                Optional<KitsuDto.AnimeNode> detailed = getEpisodeKitsu(node.getId(), 100);
                if (detailed.isPresent()) {
                    KitsuDto.AnimeNode d = detailed.get();
                    if (d.getEpisodes() != null && d.getEpisodes().getNodes() != null) {
                        node.setEpisodes(d.getEpisodes());
                        node.setEpisodeCount(d.getEpisodes().getNodes().size());
                    }
                }
            }
        }
        return node;
    }
}
