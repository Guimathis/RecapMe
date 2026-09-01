package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.ListAllEpisodesResponseDto;
import com.recapme.model.Episode;
import com.recapme.model.Season;
import com.recapme.repository.EpisodeRepository;
import com.recapme.repository.SeasonRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeasonServiceTest {

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private EpisodeRepository episodeRepository;

    @InjectMocks
    private SeasonService seasonService;

    @Test
    @DisplayName("getEpisodesBySeasonId deve retornar lista de episódios da temporada")
    void shouldGetEpisodesBySeasonIdSuccessfully() {
        UUID seasonId = UUID.randomUUID();
        Season season = Season.builder()
                .id(seasonId)
                .seasonNumber(1)
                .build();

        Episode episode = Episode.builder()
                .id(UUID.randomUUID())
                .season(season)
                .episodeNumber(1)
                .title("Para Você, 2000 Anos no Futuro")
                .thumbnailUrl("https://thumb.jpg")
                .durationMinutes(24)
                .build();

        when(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season));
        when(episodeRepository.findBySeasonIdOrderByEpisodeNumberAsc(seasonId)).thenReturn(List.of(episode));

        ListAllEpisodesResponseDto result = seasonService.getEpisodesBySeasonId(seasonId);

        assertThat(result).isNotNull();
        assertThat(result.seasonId()).isEqualTo(seasonId);
        assertThat(result.seasonNumber()).isEqualTo(1);
        assertThat(result.episodes()).hasSize(1);
        assertThat(result.episodes().get(0).title()).isEqualTo("Para Você, 2000 Anos no Futuro");
    }

    @Test
    @DisplayName("getEpisodesBySeasonId deve lançar ResourceNotFoundException quando temporada não existir")
    void shouldThrowWhenSeasonNotFound() {
        UUID randomId = UUID.randomUUID();
        when(seasonRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> seasonService.getEpisodesBySeasonId(randomId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
