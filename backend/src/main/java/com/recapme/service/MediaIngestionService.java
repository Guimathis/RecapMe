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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaIngestionService {

    private final AniListClient aniListClient;
    private final KitsuClient kitsuClient;
    private final MediaRepository mediaRepository;
    private final SeasonRepository seasonRepository;
    private final EpisodeRepository episodeRepository;

    @Transactional
    public Media ingestByAnilistId(Integer anilistId) {
        if (anilistId == null) {
            throw new IllegalArgumentException("Anilist ID cannot be null");
        }

        // Check if already in DB
        Optional<Media> existing = mediaRepository.findByAnilistId(anilistId);
        if (existing.isPresent()) {
            Media media = existing.get();
            if (episodeRepository.countBySeasonMediaId(media.getId()) == 0) {
                return ensureEpisodesIngested(media);
            }
            return media;
        }

        // 1. Fetch metadata from AniList
        AniListDto.MediaContainer aniData = aniListClient.getAnimeInfo(anilistId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found in AniList with id " + anilistId));

        Media media = persistOrUpdateSummary(aniData);
        return ensureEpisodesIngested(media);
    }

    @Transactional
    public List<Media> searchAndIngest(String keyword) {
        if (keyword == null || keyword.trim().isBlank()) {
            return List.of();
        }

        List<AniListDto.MediaContainer> results = aniListClient.searchAnime(keyword, 1, 10);
        if (results.isEmpty()) {
            return List.of();
        }

        return syncMediaSummaries(results);
    }

    @Transactional
    public Media persistOrUpdateSummary(AniListDto.MediaContainer aniData) {
        if (aniData == null || aniData.getId() == null) {
            return null;
        }

        Optional<Media> existing = mediaRepository.findByAnilistId(aniData.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        String romajiTitle = (aniData.getTitle() != null && aniData.getTitle().getRomaji() != null)
                ? aniData.getTitle().getRomaji()
                : (aniData.getTitle() != null ? aniData.getTitle().getEnglish() : "Unknown Title");

        String englishTitle = (aniData.getTitle() != null) ? aniData.getTitle().getEnglish() : null;

        BigDecimal score = null;
        if (aniData.getMeanScore() != null) {
            score = BigDecimal.valueOf(aniData.getMeanScore() / 10.0).setScale(2, RoundingMode.HALF_UP);
        }

        Instant now = Instant.now();
        Media media = Media.builder()
                .anilistId(aniData.getId())
                .titleRomaji(romajiTitle)
                .titleEnglish(englishTitle)
                .titlePortuguese(null)
                .synopsis(cleanHtmlDescription(aniData.getDescription()))
                .coverImageUrl(aniData.getCoverImage() != null ? aniData.getCoverImage().getBestQualityUrl() : null)
                .bannerImageUrl(aniData.getBannerImage())
                .format(aniData.getFormat() != null ? aniData.getFormat() : "TV")
                .status(aniData.getStatus() != null ? aniData.getStatus() : "FINISHED")
                .score(score)
                .seasonYear(aniData.getSeasonYear())
                .seasonPeriod(aniData.getSeason())
                .durationMinutes(aniData.getDuration())
                .totalEpisodes(aniData.getEpisodes() != null ? aniData.getEpisodes() : 0)
                .genres(aniData.getGenres() != null ? new HashSet<>(aniData.getGenres()) : new HashSet<>())
                .createdAt(now)
                .updatedAt(now)
                .build();

        try {
            return mediaRepository.saveAndFlush(media);
        } catch (DataIntegrityViolationException ex) {
            return mediaRepository.findByAnilistId(aniData.getId())
                    .orElseThrow(() -> ex);
        }
    }

    @Transactional
    public List<Media> syncMediaSummaries(List<AniListDto.MediaContainer> containers) {
        if (containers == null || containers.isEmpty()) {
            return Collections.emptyList();
        }

        List<Media> result = new ArrayList<>();
        for (AniListDto.MediaContainer container : containers) {
            try {
                Media m = persistOrUpdateSummary(container);
                if (m != null) {
                    result.add(m);
                }
            } catch (Exception e) {
                log.warn("Failed to persist summary for AniList ID {}: {}", container.getId(), e.getMessage());
            }
        }
        return result;
    }

    @Transactional
    public Media ensureEpisodesIngested(Media media) {
        if (media == null) {
            return null;
        }

        long existingEpCount = episodeRepository.countBySeasonMediaId(media.getId());
        if (existingEpCount > 0) {
            return media;
        }

        log.info("Ensuring episodes are ingested for media '{}' (ID: {}, AniList: {})",
                media.getTitleRomaji(), media.getId(), media.getAnilistId());

        AniListDto.MediaContainer aniData = null;
        if (media.getAnilistId() != null) {
            try {
                aniData = aniListClient.getAnimeInfo(media.getAnilistId()).orElse(null);
            } catch (Exception e) {
                log.warn("Could not fetch AniList metadata for id {}: {}", media.getAnilistId(), e.getMessage());
            }
        }

        String englishTitle = media.getTitleEnglish();
        String romajiTitle = media.getTitleRomaji();
        String seasonPeriod = media.getSeasonPeriod();
        Integer seasonYear = media.getSeasonYear();
        Integer aniEpisodes = aniData != null ? aniData.getEpisodes() : media.getTotalEpisodes();
        Integer duration = aniData != null ? aniData.getDuration() : media.getDurationMinutes();

        Optional<KitsuDto.AnimeNode> kitsuNodeOpt = kitsuClient.getKitsuEpisodes(
                englishTitle,
                romajiTitle,
                seasonPeriod,
                seasonYear
        );

        String kitsuId = kitsuNodeOpt.map(KitsuDto.AnimeNode::getId).filter(id -> !"-1".equals(id)).orElse(media.getKitsuId());
        if (kitsuId != null && !Objects.equals(media.getKitsuId(), kitsuId)) {
            media.setKitsuId(kitsuId);
        }

        List<KitsuDto.EpisodeNode> episodeNodes = kitsuNodeOpt
                .map(KitsuDto.AnimeNode::getEpisodes)
                .map(KitsuDto.EpisodesConnection::getNodes)
                .orElse(Collections.emptyList());

        int episodeCount = !episodeNodes.isEmpty()
                ? episodeNodes.size()
                : (aniEpisodes != null && aniEpisodes > 0 ? aniEpisodes : (media.getTotalEpisodes() != null ? media.getTotalEpisodes() : 0));

        Instant now = Instant.now();

        Season season = seasonRepository.findByMediaIdAndSeasonNumber(media.getId(), 1)
                .orElseGet(() -> {
                    Season newSeason = Season.builder()
                            .media(media)
                            .seasonNumber(1)
                            .title("Temporada 1")
                            .episodeCount(episodeCount)
                            .createdAt(now)
                            .build();
                    try {
                        return seasonRepository.saveAndFlush(newSeason);
                    } catch (DataIntegrityViolationException ex) {
                        return seasonRepository.findByMediaIdAndSeasonNumber(media.getId(), 1).orElseThrow(() -> ex);
                    }
                });

        if (season.getEpisodeCount() == 0 && episodeCount > 0) {
            season.setEpisodeCount(episodeCount);
            seasonRepository.save(season);
        }

        if (!episodeNodes.isEmpty()) {
            List<Episode> episodesToSave = new ArrayList<>();
            for (KitsuDto.EpisodeNode node : episodeNodes) {
                if (node == null || node.getNumber() == null) continue;

                String epTitle = (node.getTitles() != null)
                        ? node.getTitles().getPreferredTitle(node.getNumber())
                        : "Episódio " + node.getNumber();

                String thumbnailUrl = (node.getThumbnail() != null && node.getThumbnail().getOriginal() != null)
                        ? node.getThumbnail().getOriginal().getUrl()
                        : null;

                Integer epDuration = node.getLength() != null
                        ? (node.getLength() > 100 ? node.getLength() / 60 : node.getLength())
                        : duration;

                Episode episode = Episode.builder()
                        .season(season)
                        .episodeNumber(node.getNumber())
                        .title(epTitle)
                        .thumbnailUrl(thumbnailUrl)
                        .durationMinutes(epDuration)
                        .createdAt(now)
                        .build();

                episodesToSave.add(episode);
            }

            try {
                episodeRepository.saveAllAndFlush(episodesToSave);
            } catch (DataIntegrityViolationException ex) {
                log.warn("Episodes for season {} were concurrently saved", season.getId());
            }
        } else if (episodeCount > 0) {
            List<Episode> fallbackEpisodes = new ArrayList<>();
            for (int i = 1; i <= Math.min(episodeCount, 100); i++) {
                Episode episode = Episode.builder()
                        .season(season)
                        .episodeNumber(i)
                        .title("Episódio " + i)
                        .durationMinutes(duration)
                        .createdAt(now)
                        .build();
                fallbackEpisodes.add(episode);
            }
            try {
                episodeRepository.saveAllAndFlush(fallbackEpisodes);
            } catch (DataIntegrityViolationException ignored) {}
        }

        if ((media.getTotalEpisodes() == null || media.getTotalEpisodes() == 0) && episodeCount > 0) {
            media.setTotalEpisodes(episodeCount);
        }
        return mediaRepository.save(media);
    }

    private String cleanHtmlDescription(String desc) {
        if (desc == null) return null;
        return desc.replaceAll("<br\\s*/?>", "\n")
                   .replaceAll("<i>", "*")
                   .replaceAll("</i>", "*")
                   .replaceAll("<b>", "**")
                   .replaceAll("</b>", "**")
                   .replaceAll("<[^>]*>", "")
                   .trim();
    }
}
