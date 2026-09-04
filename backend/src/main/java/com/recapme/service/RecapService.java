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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecapService {

    private final RecapRepository recapRepository;
    private final MediaRepository mediaRepository;
    private final SeasonRepository seasonRepository;
    private final EpisodeRepository episodeRepository;
    private final RecapAiService recapAiService;

    @Transactional(readOnly = true)
    public OneRecapResponseDto getRecap(UUID mediaId, UUID seasonId, UUID episodeId) {
        if (!mediaRepository.existsById(mediaId)) {
            throw new ResourceNotFoundException("Media with identifier '" + mediaId + "' was not found");
        }

        Optional<Recap> recapOpt = findExistingRecap(mediaId, seasonId, episodeId);

        Recap recap = recapOpt.orElseThrow(() -> new ResourceNotFoundException(
                "Recap was not found for mediaId=" + mediaId +
                (seasonId != null ? ", seasonId=" + seasonId : "") +
                (episodeId != null ? ", episodeId=" + episodeId : "")
        ));

        return toOneRecapResponseDto(recap);
    }

    @Transactional
    public SaveRecapResponseDto createRecap(SaveRecapRequestDto request) {
        Media media = mediaRepository.findById(request.mediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media with identifier '" + request.mediaId() + "' was not found"));

        Season season = null;
        if (request.seasonId() != null) {
            season = seasonRepository.findById(request.seasonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Season with identifier '" + request.seasonId() + "' was not found"));
        }

        Episode episode = null;
        if (request.episodeId() != null) {
            episode = episodeRepository.findById(request.episodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Episode with identifier '" + request.episodeId() + "' was not found"));
        }

        UUID mediaId = media.getId();
        UUID seasonId = season != null ? season.getId() : null;
        UUID episodeId = episode != null ? episode.getId() : null;

        // Check if recap already exists
        Optional<Recap> existing = findExistingRecap(mediaId, seasonId, episodeId);
        if (existing.isPresent()) {
            return toSaveRecapResponseDto(existing.get());
        }

        // JVM lock based on entity identifiers to serialize concurrent synthesis for the exact same scope
        String lockKey = (mediaId + ":" + (seasonId != null ? seasonId : "null") + ":" + (episodeId != null ? episodeId : "null")).intern();
        synchronized (lockKey) {
            existing = findExistingRecap(mediaId, seasonId, episodeId);
            if (existing.isPresent()) {
                return toSaveRecapResponseDto(existing.get());
            }

            // Generate content with AI
            String content = recapAiService.generateRecap(
                    media,
                    season,
                    episode,
                    request.targetType(),
                    request.spoilerLevel()
            );

            Recap recap = Recap.builder()
                    .media(media)
                    .season(season)
                    .episode(episode)
                    .targetType(request.targetType().toUpperCase())
                    .spoilerLevel(request.spoilerLevel())
                    .content(content)
                    .createdAt(Instant.now())
                    .build();

            try {
                Recap saved = recapRepository.save(recap);
                return toSaveRecapResponseDto(saved);
            } catch (Exception e) {
                // If another concurrent thread committed in the meantime, return the existing record
                Optional<Recap> foundAfterConflict = findExistingRecap(mediaId, seasonId, episodeId);
                if (foundAfterConflict.isPresent()) {
                    return toSaveRecapResponseDto(foundAfterConflict.get());
                }
                if (e instanceof RuntimeException re) {
                    throw re;
                }
                throw new RuntimeException("Failed to persist recap: " + e.getMessage(), e);
            }
        }
    }

    private Optional<Recap> findExistingRecap(UUID mediaId, UUID seasonId, UUID episodeId) {
        if (episodeId != null) {
            return recapRepository.findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(mediaId, seasonId, episodeId);
        } else if (seasonId != null) {
            return recapRepository.findFirstByMediaIdAndSeasonIdAndEpisodeIdIsNullOrderByCreatedAtDesc(mediaId, seasonId);
        } else {
            return recapRepository.findFirstByMediaIdAndSeasonIdIsNullAndEpisodeIdIsNullOrderByCreatedAtDesc(mediaId);
        }
    }

    @Transactional(readOnly = true)
    public String getAuthorizedContext(UUID mediaId, Integer upToSeasonNumber, Integer upToEpisodeNumber) {
        Media media = mediaRepository.findById(mediaId).orElse(null);
        if (media == null) {
            return "Informações da obra indisponíveis.";
        }

        int maxSeason = (upToSeasonNumber != null && upToSeasonNumber > 0) ? upToSeasonNumber : 1;
        int maxEpisode = (upToEpisodeNumber != null && upToEpisodeNumber > 0) ? upToEpisodeNumber : 1;

        StringBuilder sb = new StringBuilder();
        sb.append("Obra: ").append(media.getTitleRomaji());
        if (media.getTitleEnglish() != null) {
            sb.append(" (").append(media.getTitleEnglish()).append(")");
        }
        sb.append("\n");

        if (media.getSynopsis() != null) {
            sb.append("Sinopse: ").append(media.getSynopsis()).append("\n\n");
        }

        List<Season> seasons = seasonRepository.findByMediaIdOrderBySeasonNumberAsc(mediaId);
        for (Season season : seasons) {
            if (season.getSeasonNumber() <= maxSeason) {
                sb.append("== Temporada ").append(season.getSeasonNumber()).append(": ").append(season.getTitle()).append(" ==\n");

                List<Episode> episodes = episodeRepository.findBySeasonIdOrderByEpisodeNumberAsc(season.getId());
                for (Episode ep : episodes) {
                    if (season.getSeasonNumber() < maxSeason || ep.getEpisodeNumber() <= maxEpisode) {
                        sb.append("  - Ep. ").append(ep.getEpisodeNumber()).append(": ").append(ep.getTitle());
                        if (ep.getSynopsis() != null && !ep.getSynopsis().isBlank()) {
                            sb.append(" — ").append(ep.getSynopsis());
                        }
                        sb.append("\n");
                    }
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    private OneRecapResponseDto toOneRecapResponseDto(Recap recap) {
        return OneRecapResponseDto.builder()
                .id(recap.getId())
                .mediaId(recap.getMedia().getId())
                .seasonId(recap.getSeason() != null ? recap.getSeason().getId() : null)
                .episodeId(recap.getEpisode() != null ? recap.getEpisode().getId() : null)
                .targetType(recap.getTargetType())
                .spoilerLevel(recap.getSpoilerLevel())
                .content(recap.getContent())
                .createdAt(recap.getCreatedAt())
                .build();
    }

    private SaveRecapResponseDto toSaveRecapResponseDto(Recap recap) {
        return SaveRecapResponseDto.builder()
                .id(recap.getId())
                .mediaId(recap.getMedia().getId())
                .seasonId(recap.getSeason() != null ? recap.getSeason().getId() : null)
                .episodeId(recap.getEpisode() != null ? recap.getEpisode().getId() : null)
                .targetType(recap.getTargetType())
                .spoilerLevel(recap.getSpoilerLevel())
                .content(recap.getContent())
                .createdAt(recap.getCreatedAt())
                .build();
    }
}
