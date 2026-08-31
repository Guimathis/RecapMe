package com.recapme.client;

import com.recapme.client.anilist.AniListClient;
import com.recapme.client.anilist.AniListDto;
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
class AniListClientTest {

    @Mock
    private RestClient anilistRestClient;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private AniListClient aniListClient;

    @BeforeEach
    void setUp() {
        aniListClient = new AniListClient(anilistRestClient);
    }

    @Test
    @DisplayName("getAnimeInfo deve retornar MediaContainer quando resposta for válida")
    void shouldReturnAnimeInfoSuccessfully() {
        AniListDto.MediaContainer media = AniListDto.MediaContainer.builder()
                .id(16498)
                .title(new AniListDto.Title("Shingeki no Kyojin", "Attack on Titan"))
                .build();

        AniListDto.GraphQLResponse graphQLResponse = new AniListDto.GraphQLResponse();
        AniListDto.DataContainer dataContainer = new AniListDto.DataContainer();
        dataContainer.setMedia(media);
        graphQLResponse.setData(dataContainer);

        when(anilistRestClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(AniListDto.GraphQLResponse.class)).thenReturn(graphQLResponse);

        Optional<AniListDto.MediaContainer> result = aniListClient.getAnimeInfo(16498);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(16498);
        assertThat(result.get().getTitle().getRomaji()).isEqualTo("Shingeki no Kyojin");
    }

    @Test
    @DisplayName("searchAnime deve retornar lista de mídias")
    void shouldSearchAnimeSuccessfully() {
        AniListDto.MediaContainer media = AniListDto.MediaContainer.builder()
                .id(16498)
                .title(new AniListDto.Title("Shingeki no Kyojin", "Attack on Titan"))
                .build();

        AniListDto.GraphQLResponse graphQLResponse = new AniListDto.GraphQLResponse();
        AniListDto.DataContainer dataContainer = new AniListDto.DataContainer();
        AniListDto.PageContainer pageContainer = new AniListDto.PageContainer();
        pageContainer.setMedia(List.of(media));
        dataContainer.setPage(pageContainer);
        graphQLResponse.setData(dataContainer);

        when(anilistRestClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(AniListDto.GraphQLResponse.class)).thenReturn(graphQLResponse);

        List<AniListDto.MediaContainer> results = aniListClient.searchAnime("shingeki", 1, 10);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(16498);
    }
}
