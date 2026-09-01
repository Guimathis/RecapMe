package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.EpisodeSummaryDto;
import com.recapme.dto.response.ListAllEpisodesResponseDto;
import com.recapme.model.Episode;
import com.recapme.model.Season;
import com.recapme.repository.EpisodeRepository;
import com.recapme.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeasonService {

    private final SeasonRepository seasonRepository;
    private final EpisodeRepository episodeRepository;

    @Transactional(readOnly = true)
    public ListAllEpisodesResponseDto getEpisodesBySeasonId(UUID seasonId) {
        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new ResourceNotFoundException("Season with identifier '" + seasonId + "' was not found"));

        List<Episode> episodes = episodeRepository.findBySeasonIdOrderByEpisodeNumberAsc(seasonId);
        List<EpisodeSummaryDto> episodeSummaries = episodes.stream()
                .map(this::toEpisodeSummaryDto)
                .collect(Collectors.toList());

        return ListAllEpisodesResponseDto.builder()
                .seasonId(season.getId())
                .seasonNumber(season.getSeasonNumber())
                .episodes(episodeSummaries)
                .build();
    }

    private EpisodeSummaryDto toEpisodeSummaryDto(Episode ep) {
        return EpisodeSummaryDto.builder()
                .id(ep.getId())
                .episodeNumber(ep.getEpisodeNumber())
                .title(ep.getTitle())
                .thumbnailUrl(ep.getThumbnailUrl())
                .synopsis(ep.getSynopsis())
                .durationMinutes(ep.getDurationMinutes())
                .build();
    }
}
