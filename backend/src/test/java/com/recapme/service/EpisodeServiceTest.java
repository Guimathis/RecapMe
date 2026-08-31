package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.OneEpisodeResponseDto;
import com.recapme.model.Episode;
import com.recapme.model.Season;
import com.recapme.repository.EpisodeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EpisodeServiceTest {

    @Mock
    private EpisodeRepository episodeRepository;

    @InjectMocks
    private EpisodeService episodeService;

    @Test
    @DisplayName("getById deve retornar OneEpisodeResponseDto quando encontrado")
    void shouldGetEpisodeByIdSuccessfully() {
        UUID episodeId = UUID.randomUUID();
        UUID seasonId = UUID.randomUUID();
        Season season = Season.builder().id(seasonId).build();

        Episode episode = Episode.builder()
                .id(episodeId)
                .season(season)
                .episodeNumber(1)
                .title("Para Você, 2000 Anos no Futuro")
                .thumbnailUrl("https://thumb.jpg")
                .synopsis("Sinopse")
                .durationMinutes(24)
                .createdAt(Instant.now())
                .build();

        when(episodeRepository.findById(episodeId)).thenReturn(Optional.of(episode));

        OneEpisodeResponseDto result = episodeService.getById(episodeId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(episodeId);
        assertThat(result.seasonId()).isEqualTo(seasonId);
        assertThat(result.title()).isEqualTo("Para Você, 2000 Anos no Futuro");
    }

    @Test
    @DisplayName("getById deve lançar ResourceNotFoundException quando não encontrado")
    void shouldThrowWhenEpisodeNotFound() {
        UUID randomId = UUID.randomUUID();
        when(episodeRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> episodeService.getById(randomId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
