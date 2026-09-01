package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.OneEpisodeResponseDto;
import com.recapme.model.Episode;
import com.recapme.repository.EpisodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EpisodeService {

    private final EpisodeRepository episodeRepository;

    @Transactional(readOnly = true)
    public OneEpisodeResponseDto getById(UUID id) {
        Episode ep = episodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Episode with identifier '" + id + "' was not found"));

        return OneEpisodeResponseDto.builder()
                .id(ep.getId())
                .seasonId(ep.getSeason().getId())
                .episodeNumber(ep.getEpisodeNumber())
                .title(ep.getTitle())
                .thumbnailUrl(ep.getThumbnailUrl())
                .synopsis(ep.getSynopsis())
                .durationMinutes(ep.getDurationMinutes())
                .createdAt(ep.getCreatedAt())
                .build();
    }
}
