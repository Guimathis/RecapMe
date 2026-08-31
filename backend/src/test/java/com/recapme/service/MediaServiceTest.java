package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.ListAllSeasonsResponseDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.model.Media;
import com.recapme.model.Season;
import com.recapme.repository.MediaRepository;
import com.recapme.repository.SeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private MediaIngestionService mediaIngestionService;

    @InjectMocks
    private MediaService mediaService;

    private Media sampleMedia;

    @BeforeEach
    void setUp() {
        sampleMedia = Media.builder()
                .id(UUID.randomUUID())
                .anilistId(16498)
                .kitsuId("7442")
                .titleRomaji("Shingeki no Kyojin")
                .titleEnglish("Attack on Titan")
                .synopsis("Centenas de anos atrás...")
                .coverImageUrl("https://cover.jpg")
                .bannerImageUrl("https://banner.jpg")
                .format("TV")
                .status("FINISHED")
                .score(BigDecimal.valueOf(8.65))
                .seasonYear(2013)
                .totalEpisodes(25)
                .genres(Set.of("Action", "Drama"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("listAll deve retornar página de mídias mapeadas para DTO")
    void shouldListAllMediasSuccessfully() {
        Page<Media> page = new PageImpl<>(List.of(sampleMedia), PageRequest.of(0, 20), 1);
        when(mediaRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        ListAllMediasResponseDto result = mediaService.listAll(0, 20, "Action", "FINISHED", 2013, "score,desc");

        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content().getFirst().titleRomaji()).isEqualTo("Shingeki no Kyojin");
        assertThat(result.content().getFirst().anilistId()).isEqualTo(16498);
    }

    @Test
    @DisplayName("search com query local deve retornar mídias encontradas sem acionar ingestão")
    void shouldReturnLocalSearchResults() {
        Page<Media> page = new PageImpl<>(List.of(sampleMedia));
        when(mediaRepository.searchByTitleUnaccent(eq("shingeki"), any())).thenReturn(page);

        ListAllMediasResponseDto result = mediaService.search("shingeki", 0, 20);

        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content().getFirst().titleRomaji()).isEqualTo("Shingeki no Kyojin");
    }

    @Test
    @DisplayName("search sem resultado local no page 0 deve acionar lazy ingestion e re-consultar")
    void shouldTriggerLazyIngestionWhenNoLocalResults() {
        when(mediaRepository.searchByTitleUnaccent(eq("naruto"), any()))
                .thenReturn(Page.empty())
                .thenReturn(new PageImpl<>(List.of(sampleMedia)));
        when(mediaIngestionService.searchAndIngest("naruto")).thenReturn(List.of(sampleMedia));

        ListAllMediasResponseDto result = mediaService.search("naruto", 0, 20);

        verify(mediaIngestionService).searchAndIngest("naruto");
        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("getById deve retornar OneMediaResponseDto com temporadas")
    void shouldGetMediaByIdSuccessfully() {
        UUID id = sampleMedia.getId();
        Season season = Season.builder()
                .id(UUID.randomUUID())
                .media(sampleMedia)
                .seasonNumber(1)
                .title("Temporada 1")
                .episodeCount(25)
                .build();

        when(mediaRepository.findById(id)).thenReturn(Optional.of(sampleMedia));
        when(seasonRepository.findByMediaIdOrderBySeasonNumberAsc(id)).thenReturn(List.of(season));

        OneMediaResponseDto result = mediaService.getById(id);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(id);
        assertThat(result.seasons()).hasSize(1);
        assertThat(result.seasons().get(0).title()).isEqualTo("Temporada 1");
    }

    @Test
    @DisplayName("getById para UUID inexistente deve lançar ResourceNotFoundException")
    void shouldThrowWhenMediaNotFoundById() {
        UUID randomId = UUID.randomUUID();
        when(mediaRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mediaService.getById(randomId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(randomId.toString());
    }

    @Test
    @DisplayName("getSeasonsByMediaId deve retornar lista de temporadas")
    void shouldGetSeasonsByMediaId() {
        UUID id = sampleMedia.getId();
        Season season = Season.builder()
                .id(UUID.randomUUID())
                .media(sampleMedia)
                .seasonNumber(1)
                .title("Temporada 1")
                .episodeCount(25)
                .build();

        when(mediaRepository.existsById(id)).thenReturn(true);
        when(seasonRepository.findByMediaIdOrderBySeasonNumberAsc(id)).thenReturn(List.of(season));

        ListAllSeasonsResponseDto result = mediaService.getSeasonsByMediaId(id);

        assertThat(result).isNotNull();
        assertThat(result.mediaId()).isEqualTo(id);
        assertThat(result.seasons()).hasSize(1);
    }
}
