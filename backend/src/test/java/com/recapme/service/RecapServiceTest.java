package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.request.SaveRecapRequestDto;
import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.dto.response.SaveRecapResponseDto;
import com.recapme.model.Episode;
import com.recapme.model.Media;
import com.recapme.model.Recap;
import com.recapme.model.Season;
import com.recapme.repository.EpisodeRepository;
import com.recapme.repository.MediaRepository;
import com.recapme.repository.RecapRepository;
import com.recapme.repository.SeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecapServiceTest {

    @Mock
    private RecapRepository recapRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private EpisodeRepository episodeRepository;

    @Mock
    private RecapAiService recapAiService;

    @InjectMocks
    private RecapService recapService;

    private Media sampleMedia;
    private Season sampleSeason;
    private Episode sampleEpisode;
    private Recap sampleRecap;

    @BeforeEach
    void setUp() {
        sampleMedia = Media.builder()
                .id(UUID.randomUUID())
                .titleRomaji("Shingeki no Kyojin")
                .titleEnglish("Attack on Titan")
                .build();

        sampleSeason = Season.builder()
                .id(UUID.randomUUID())
                .media(sampleMedia)
                .seasonNumber(1)
                .title("Temporada 1")
                .build();

        sampleEpisode = Episode.builder()
                .id(UUID.randomUUID())
                .season(sampleSeason)
                .episodeNumber(1)
                .title("Para Você, 2000 Anos no Futuro")
                .build();

        sampleRecap = Recap.builder()
                .id(UUID.randomUUID())
                .media(sampleMedia)
                .season(sampleSeason)
                .episode(sampleEpisode)
                .targetType("EPISODE")
                .spoilerLevel("S1E1")
                .content("### Resumo do Episódio 1")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("getRecap deve retornar OneRecapResponseDto quando recap existir")
    void shouldGetRecapSuccessfully() {
        when(mediaRepository.existsById(sampleMedia.getId())).thenReturn(true);
        when(recapRepository.findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(sampleMedia.getId(), sampleSeason.getId(), sampleEpisode.getId()))
                .thenReturn(Optional.of(sampleRecap));

        OneRecapResponseDto result = recapService.getRecap(sampleMedia.getId(), sampleSeason.getId(), sampleEpisode.getId());

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(sampleRecap.getId());
        assertThat(result.content()).isEqualTo("### Resumo do Episódio 1");
    }

    @Test
    @DisplayName("getRecap deve lançar ResourceNotFoundException quando recap não existir")
    void shouldThrowWhenRecapNotFound() {
        when(mediaRepository.existsById(sampleMedia.getId())).thenReturn(true);
        when(recapRepository.findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(sampleMedia.getId(), sampleSeason.getId(), sampleEpisode.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> recapService.getRecap(sampleMedia.getId(), sampleSeason.getId(), sampleEpisode.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createRecap deve sintetizar novo resumo e persistir no banco")
    void shouldCreateRecapSuccessfully() {
        SaveRecapRequestDto requestDto = SaveRecapRequestDto.builder()
                .mediaId(sampleMedia.getId())
                .seasonId(sampleSeason.getId())
                .episodeId(sampleEpisode.getId())
                .targetType("EPISODE")
                .spoilerLevel("S1E1")
                .build();

        when(mediaRepository.findById(sampleMedia.getId())).thenReturn(Optional.of(sampleMedia));
        when(seasonRepository.findById(sampleSeason.getId())).thenReturn(Optional.of(sampleSeason));
        when(episodeRepository.findById(sampleEpisode.getId())).thenReturn(Optional.of(sampleEpisode));
        when(recapRepository.findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(sampleMedia.getId(), sampleSeason.getId(), sampleEpisode.getId()))
                .thenReturn(Optional.empty());
        when(recapAiService.generateRecap(sampleMedia, sampleSeason, sampleEpisode, "EPISODE", "S1E1"))
                .thenReturn("### Novo Resumo Gerado");
        when(recapRepository.save(any(Recap.class))).thenAnswer(inv -> {
            Recap r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        SaveRecapResponseDto result = recapService.createRecap(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.content()).isEqualTo("### Novo Resumo Gerado");
        assertThat(result.targetType()).isEqualTo("EPISODE");
    }

    @Test
    @DisplayName("getAuthorizedContext deve montar string contextual até os cortes informados")
    void shouldBuildAuthorizedContext() {
        when(mediaRepository.findById(sampleMedia.getId())).thenReturn(Optional.of(sampleMedia));
        when(seasonRepository.findByMediaIdOrderBySeasonNumberAsc(sampleMedia.getId())).thenReturn(List.of(sampleSeason));
        when(episodeRepository.findBySeasonIdOrderByEpisodeNumberAsc(sampleSeason.getId())).thenReturn(List.of(sampleEpisode));

        String context = recapService.getAuthorizedContext(sampleMedia.getId(), 1, 1);

        assertThat(context).contains("Shingeki no Kyojin");
        assertThat(context).contains("Temporada 1");
        assertThat(context).contains("Ep. 1: Para Você, 2000 Anos no Futuro");
    }
}
