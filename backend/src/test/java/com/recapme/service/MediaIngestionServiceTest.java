package com.recapme.service;

import com.recapme.client.anilist.AniListClient;
import com.recapme.client.anilist.AniListDto;
import com.recapme.client.kitsu.KitsuClient;
import com.recapme.client.kitsu.KitsuDto;
import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.model.Episode;
import com.recapme.model.Media;
import com.recapme.model.Season;
import com.recapme.repository.EpisodeRepository;
import com.recapme.repository.MediaRepository;
import com.recapme.repository.SeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaIngestionServiceTest {

    @Mock
    private AniListClient aniListClient;

    @Mock
    private KitsuClient kitsuClient;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private EpisodeRepository episodeRepository;

    @InjectMocks
    private MediaIngestionService ingestionService;

    private AniListDto.MediaContainer aniContainer;
    private KitsuDto.AnimeNode kitsuNode;

    @BeforeEach
    void setUp() {
        aniContainer = AniListDto.MediaContainer.builder()
                .id(16498)
                .title(new AniListDto.Title("Shingeki no Kyojin", "Attack on Titan"))
                .coverImage(new AniListDto.CoverImage(null, "med.jpg", "large.jpg", "extra.jpg"))
                .bannerImage("banner.jpg")
                .format("TV")
                .status("FINISHED")
                .meanScore(86.5)
                .seasonYear(2013)
                .season("SPRING")
                .duration(24)
                .episodes(25)
                .genres(List.of("Action", "Drama"))
                .description("Desc <i>test</i>")
                .build();

        kitsuNode = KitsuDto.AnimeNode.builder()
                .id("7442")
                .season("SPRING")
                .startDate("2013-04-07")
                .episodeCount(1)
                .episodes(new KitsuDto.EpisodesConnection(List.of(
                        KitsuDto.EpisodeNode.builder()
                                .number(1)
                                .titles(new KitsuDto.EpisodeTitles("To You, in 2000 Years"))
                                .thumbnail(new KitsuDto.EpisodeThumbnail(new KitsuDto.ThumbnailOriginal("thumb.jpg")))
                                .length(24)
                                .build()
                )))
                .build();
    }

    @Test
    @DisplayName("ingestByAnilistId deve retornar mídia existente se já cadastrada")
    void shouldReturnExistingMedia() {
        Media existing = Media.builder().id(UUID.randomUUID()).anilistId(16498).build();
        when(mediaRepository.findByAnilistId(16498)).thenReturn(Optional.of(existing));

        Media result = ingestionService.ingestByAnilistId(16498);

        assertThat(result).isSameAs(existing);
    }

    @Test
    @DisplayName("ingestByAnilistId deve consultar AniList e Kitsu, persistir e retornar nova Media")
    void shouldIngestAndPersistSuccessfully() {
        when(mediaRepository.findByAnilistId(16498)).thenReturn(Optional.empty());
        when(aniListClient.getAnimeInfo(16498)).thenReturn(Optional.of(aniContainer));
        when(kitsuClient.getKitsuEpisodes("Attack on Titan", "Shingeki no Kyojin", "SPRING", 2013))
                .thenReturn(Optional.of(kitsuNode));

        when(mediaRepository.saveAndFlush(any(Media.class))).thenAnswer(inv -> {
            Media m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        when(seasonRepository.saveAndFlush(any(Season.class))).thenAnswer(inv -> {
            Season s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        Media result = ingestionService.ingestByAnilistId(16498);

        assertThat(result).isNotNull();
        assertThat(result.getAnilistId()).isEqualTo(16498);
        assertThat(result.getTitleRomaji()).isEqualTo("Shingeki no Kyojin");
        assertThat(result.getTitleEnglish()).isEqualTo("Attack on Titan");
        assertThat(result.getKitsuId()).isEqualTo("7442");
        assertThat(result.getSynopsis()).isEqualTo("Desc *test*");

        verify(episodeRepository).saveAllAndFlush(anyList());
    }

    @Test
    @DisplayName("ingestByAnilistId deve lançar ResourceNotFoundException quando não encontrado no AniList")
    void shouldThrowWhenAnimeNotFoundInAniList() {
        when(mediaRepository.findByAnilistId(99999)).thenReturn(Optional.empty());
        when(aniListClient.getAnimeInfo(99999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ingestionService.ingestByAnilistId(99999))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
