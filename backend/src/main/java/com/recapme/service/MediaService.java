package com.recapme.service;

import com.recapme.client.jikan.JikanClient;
import com.recapme.client.tmdb.TmdbClient;
import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.MediaItemDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.model.MediaModel;
import com.recapme.model.MediaType;
import com.recapme.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final TmdbClient tmdbClient;
    private final JikanClient jikanClient;
    private final MediaRepository mediaRepository;

    @Cacheable(value = "search-medias", key = "#query + '-' + #type")
    public ListAllMediasResponseDto search(String query, MediaType type) {
        if (query == null || query.trim().isBlank()) {
            return ListAllMediasResponseDto.builder().items(List.of()).total(0).build();
        }

        List<MediaItemDto> results = new ArrayList<>();

        if (type == null || type == MediaType.ANIME) {
            results.addAll(jikanClient.search(query));
        }

        if (type == null || type == MediaType.SERIES || type == MediaType.MOVIE) {
            results.addAll(tmdbClient.search(query, type));
        }

        return ListAllMediasResponseDto.builder()
                .items(results)
                .total(results.size())
                .build();
    }

    @Transactional
    @Cacheable(value = "media-details", key = "#type.name() + '-' + #externalId")
    public OneMediaResponseDto getDetails(MediaType type, String externalId) {
        // Verificar se já existe na base
        var existingMedia = mediaRepository.findByMediaTypeAndExternalId(type, externalId);
        if (existingMedia.isPresent()) {
            MediaModel m = existingMedia.get();
            return toOneMediaResponseDto(m);
        }

        // Caso contrário, consultar APIs externas
        OneMediaResponseDto fetched = (type == MediaType.ANIME)
                ? jikanClient.getDetails(externalId)
                : tmdbClient.getDetails(externalId, type);

        if (fetched == null) {
            throw new ResourceNotFoundException("Media", type + ":" + externalId);
        }

        // Salvar na base local para indexação
        MediaModel newMedia = new MediaModel();
        newMedia.setExternalId(externalId);
        newMedia.setMediaType(type);
        newMedia.setTitle(fetched.getTitle());
        newMedia.setOriginalTitle(fetched.getOriginalTitle());
        newMedia.setOverview(fetched.getOverview());
        newMedia.setPosterUrl(fetched.getPosterUrl());
        newMedia.setBackdropUrl(fetched.getBackdropUrl());
        newMedia.setReleaseYear(fetched.getReleaseYear());
        newMedia.setTotalSeasons(fetched.getTotalSeasons() != null ? fetched.getTotalSeasons() : 1);
        newMedia.setTotalEpisodes(fetched.getTotalEpisodes() != null ? fetched.getTotalEpisodes() : 1);
        newMedia.setCreatedAt(LocalDateTime.now());
        newMedia.setUpdatedAt(LocalDateTime.now());

        try {
            MediaModel saved = mediaRepository.save(newMedia);
            fetched.setId(saved.getId().toString());
            return fetched;
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.info("Media {}:{} já persistida por requisição concorrente.", type, externalId);
            return mediaRepository.findByMediaTypeAndExternalId(type, externalId)
                    .map(this::toOneMediaResponseDto)
                    .orElse(fetched);
        }
    }

    @Transactional
    public MediaModel getOrSaveMedia(MediaType type, String externalId, String title) {
        var existing = mediaRepository.findByMediaTypeAndExternalId(type, externalId);
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            getDetails(type, externalId);
        } catch (Exception e) {
            log.warn("Erro ao buscar detalhes para {}:{}: {}", type, externalId, e.getMessage());
        }

        return mediaRepository.findByMediaTypeAndExternalId(type, externalId)
                .orElseGet(() -> {
                    MediaModel m = new MediaModel();
                    m.setExternalId(externalId);
                    m.setMediaType(type);
                    m.setTitle(title != null ? title : "Obra " + externalId);
                    m.setCreatedAt(LocalDateTime.now());
                    m.setUpdatedAt(LocalDateTime.now());
                    try {
                        return mediaRepository.save(m);
                    } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                        return mediaRepository.findByMediaTypeAndExternalId(type, externalId)
                                .orElseThrow(() -> new IllegalStateException("Concorrência ao salvar mídia"));
                    }
                });
    }

    private OneMediaResponseDto toOneMediaResponseDto(MediaModel m) {
        List<Integer> seasons = new ArrayList<>();
        int totalSeasons = m.getTotalSeasons() != null ? m.getTotalSeasons() : 1;
        for (int i = 1; i <= totalSeasons; i++) {
            seasons.add(i);
        }

        return OneMediaResponseDto.builder()
                .id(m.getId().toString())
                .externalId(m.getExternalId())
                .type(m.getMediaType())
                .source(m.getMediaType() == MediaType.ANIME ? "JIKAN" : "TMDB")
                .title(m.getTitle())
                .originalTitle(m.getOriginalTitle())
                .overview(m.getOverview())
                .posterUrl(m.getPosterUrl())
                .backdropUrl(m.getBackdropUrl())
                .releaseYear(m.getReleaseYear())
                .totalSeasons(totalSeasons)
                .totalEpisodes(m.getTotalEpisodes() != null ? m.getTotalEpisodes() : 1)
                .availableSeasons(seasons)
                .build();
    }
}
