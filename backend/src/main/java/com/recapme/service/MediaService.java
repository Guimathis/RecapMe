package com.recapme.service;

import com.recapme.common.exception.ResourceNotFoundException;
import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.ListAllSeasonsResponseDto;
import com.recapme.dto.response.MediaSummaryDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.dto.response.SeasonSummaryDto;
import com.recapme.model.Media;
import com.recapme.model.Season;
import com.recapme.repository.MediaRepository;
import com.recapme.repository.SeasonRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final SeasonRepository seasonRepository;
    private final MediaIngestionService mediaIngestionService;

    @Transactional(readOnly = true)
    public ListAllMediasResponseDto listAll(int page, int size, String genre, String status, Integer year, String sort) {
        Pageable pageable = createPageable(page, size, sort);

        Specification<Media> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (genre != null && !genre.isBlank()) {
                Join<Media, String> genresJoin = root.join("genres");
                predicates.add(cb.equal(cb.lower(genresJoin), genre.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (year != null) {
                predicates.add(cb.equal(root.get("seasonYear"), year));
            }

            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Media> mediaPage = mediaRepository.findAll(spec, pageable);
        return toListAllMediasResponseDto(mediaPage);
    }

    @Transactional
    @Cacheable(value = "media-details", key = "#query + #page + #size")
    public ListAllMediasResponseDto search(String query, int page, int size) {
        if (query == null || query.trim().isBlank()) {
            return ListAllMediasResponseDto.builder()
                    .content(Collections.emptyList())
                    .pageNumber(page)
                    .pageSize(size)
                    .totalElements(0)
                    .totalPages(0)
                    .isLast(true)
                    .build();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Media> localResults = mediaRepository.searchByTitleUnaccent(query.trim(), pageable);

        // Lazy Ingestion: se nenhum resultado for encontrado localmente, busca e ingere no AniList/Kitsu
        if (localResults.isEmpty() && page == 0) {
            log.info("No local results for search query '{}'. Triggering lazy ingestion from AniList/Kitsu...", query);
            try {
                List<Media> ingested = mediaIngestionService.searchAndIngest(query.trim());
                if (!ingested.isEmpty()) {
                    localResults = mediaRepository.searchByTitleUnaccent(query.trim(), pageable);
                }
            } catch (Exception e) {
                log.warn("Lazy ingestion failed for query '{}': {}", query, e.getMessage());
            }
        }

        return toListAllMediasResponseDto(localResults);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "media-details", key = "#id")
    public OneMediaResponseDto getById(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media with identifier '" + id + "' was not found in local database"));

        List<Season> seasons = seasonRepository.findByMediaIdOrderBySeasonNumberAsc(media.getId());
        return toOneMediaResponseDto(media, seasons);
    }

    @Transactional
    public OneMediaResponseDto forceIngest(Integer anilistId) {
        log.info("Forcing ingestion for AniList ID: {}", anilistId);
        Media media = mediaIngestionService.ingestByAnilistId(anilistId);
        List<Season> seasons = seasonRepository.findByMediaIdOrderBySeasonNumberAsc(media.getId());
        return toOneMediaResponseDto(media, seasons);
    }

    @Transactional(readOnly = true)
    public ListAllSeasonsResponseDto getSeasonsByMediaId(UUID mediaId) {
        if (!mediaRepository.existsById(mediaId)) {
            throw new ResourceNotFoundException("Media with identifier '" + mediaId + "' was not found");
        }

        List<Season> seasons = seasonRepository.findByMediaIdOrderBySeasonNumberAsc(mediaId);
        List<SeasonSummaryDto> seasonSummaries = seasons.stream()
                .map(this::toSeasonSummaryDto)
                .collect(Collectors.toList());

        return ListAllSeasonsResponseDto.builder()
                .mediaId(mediaId)
                .seasons(seasonSummaries)
                .build();
    }

    private Pageable createPageable(int page, int size, String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "score"));
        }

        String[] parts = sortParam.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = (parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, property));
    }

    private ListAllMediasResponseDto toListAllMediasResponseDto(Page<Media> mediaPage) {
        List<MediaSummaryDto> content = mediaPage.getContent().stream()
                .map(this::toMediaSummaryDto)
                .collect(Collectors.toList());

        return ListAllMediasResponseDto.builder()
                .content(content)
                .pageNumber(mediaPage.getNumber())
                .pageSize(mediaPage.getSize())
                .totalElements(mediaPage.getTotalElements())
                .totalPages(mediaPage.getTotalPages())
                .isLast(mediaPage.isLast())
                .build();
    }

    private MediaSummaryDto toMediaSummaryDto(Media m) {
        return MediaSummaryDto.builder()
                .id(m.getId())
                .anilistId(m.getAnilistId())
                .titleRomaji(m.getTitleRomaji())
                .titleEnglish(m.getTitleEnglish())
                .titlePortuguese(m.getTitlePortuguese())
                .synopsis(m.getSynopsis())
                .coverImageUrl(m.getCoverImageUrl())
                .bannerImageUrl(m.getBannerImageUrl())
                .format(m.getFormat())
                .status(m.getStatus())
                .score(m.getScore())
                .seasonYear(m.getSeasonYear())
                .totalEpisodes(m.getTotalEpisodes())
                .genres(m.getGenres())
                .build();
    }

    private OneMediaResponseDto toOneMediaResponseDto(Media m, List<Season> seasons) {
        List<SeasonSummaryDto> seasonSummaries = seasons.stream()
                .map(this::toSeasonSummaryDto)
                .collect(Collectors.toList());

        return OneMediaResponseDto.builder()
                .id(m.getId())
                .anilistId(m.getAnilistId())
                .kitsuId(m.getKitsuId())
                .titleRomaji(m.getTitleRomaji())
                .titleEnglish(m.getTitleEnglish())
                .titlePortuguese(m.getTitlePortuguese())
                .synopsis(m.getSynopsis())
                .coverImageUrl(m.getCoverImageUrl())
                .bannerImageUrl(m.getBannerImageUrl())
                .format(m.getFormat())
                .status(m.getStatus())
                .score(m.getScore())
                .seasonYear(m.getSeasonYear())
                .seasonPeriod(m.getSeasonPeriod())
                .durationMinutes(m.getDurationMinutes())
                .totalEpisodes(m.getTotalEpisodes())
                .genres(m.getGenres())
                .seasons(seasonSummaries)
                .build();
    }

    private SeasonSummaryDto toSeasonSummaryDto(Season s) {
        return SeasonSummaryDto.builder()
                .id(s.getId())
                .seasonNumber(s.getSeasonNumber())
                .title(s.getTitle())
                .episodeCount(s.getEpisodeCount())
                .build();
    }
}
