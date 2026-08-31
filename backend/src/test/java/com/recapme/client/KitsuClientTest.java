package com.recapme.client;

import com.recapme.client.kitsu.KitsuClient;
import com.recapme.client.kitsu.KitsuDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KitsuClientTest {

    @Mock
    private RestClient kitsuRestClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private KitsuClient kitsuClient;

    @BeforeEach
    void setUp() {
        kitsuClient = new KitsuClient(kitsuRestClient);
    }

    @Test
    @DisplayName("getKitsuEpisodes deve casar startDate.year e season e retornar AnimeNode")
    void shouldMatchKitsuEpisodesByYearAndSeason() {
        KitsuDto.AnimeNode node = KitsuDto.AnimeNode.builder()
                .id("7442")
                .season("SPRING")
                .startDate("2013-04-07")
                .episodeCount(1)
                .episodes(new KitsuDto.EpisodesConnection(List.of(
                        KitsuDto.EpisodeNode.builder()
                                .number(1)
                                .titles(new KitsuDto.EpisodeTitles("To You, in 2000 Years"))
                                .build()
                )))
                .build();

        KitsuDto.GraphQLResponse graphQLResponse = new KitsuDto.GraphQLResponse();
        KitsuDto.DataContainer dataContainer = new KitsuDto.DataContainer();
        KitsuDto.SearchAnimeByTitle searchContainer = new KitsuDto.SearchAnimeByTitle();
        searchContainer.setAnimes(List.of(node));
        dataContainer.setSearchAnimeByTitle(searchContainer);
        graphQLResponse.setData(dataContainer);

        when(kitsuRestClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(KitsuDto.GraphQLResponse.class)).thenReturn(graphQLResponse);

        Optional<KitsuDto.AnimeNode> result = kitsuClient.getKitsuEpisodes("Attack on Titan", "Shingeki no Kyojin", "SPRING", 2013);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo("7442");
        assertThat(result.get().getEpisodes().getNodes()).hasSize(1);
    }
}
