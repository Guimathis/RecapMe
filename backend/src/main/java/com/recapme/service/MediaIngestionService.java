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
            return existing.get();
        }

        // 1. Fetch metadata from AniList
        AniListDto.MediaContainer aniData = aniListClient.getAnimeInfo(anilistId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found in AniList with id " + anilistId));

        return persistIngestedMedia(aniData);
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

        List<Media> savedMedias = new ArrayList<>();
        for (AniListDto.MediaContainer container : results) {
            if (container.getId() == null) continue;

            Optional<Media> local = mediaRepository.findByAnilistId(container.getId());
            if (local.isPresent()) {
                savedMedias.add(local.get());
            } else {
                try {
                    savedMedias.add(persistIngestedMedia(container));
                } catch (Exception e) {
                    log.warn("Failed to ingest anime {} ({}): {}", container.getId(),
                            container.getTitle() != null ? container.getTitle().getRomaji() : "unknown",
                            e.getMessage());
                }
            }
        }

        return savedMedias;
    }

    private Media persistIngestedMedia(AniListDto.MediaContainer aniData) {
        String romajiTitle = (aniData.getTitle() != null && aniData.getTitle().getRomaji() != null)
                ? aniData.getTitle().getRomaji()
                : (aniData.getTitle() != null ? aniData.getTitle().getEnglish() : "Unknown Title");

        String englishTitle = (aniData.getTitle() != null) ? aniData.getTitle().getEnglish() : null;

        // 2. Fetch episode tree from Kitsu
        Optional<KitsuDto.AnimeNode> kitsuNodeOpt = kitsuClient.getKitsuEpisodes(
                englishTitle,
                romajiTitle,
                aniData.getSeason(),
                aniData.getSeasonYear()
        );

        String kitsuId = kitsuNodeOpt.map(KitsuDto.AnimeNode::getId).filter(id -> !"-1".equals(id)).orElse(null);

        // Build Media entity
        BigDecimal score = null;
        if (aniData.getMeanScore() != null) {
            score = BigDecimal.valueOf(aniData.getMeanScore() / 10.0).setScale(2, RoundingMode.HALF_UP);
        }

        Instant now = Instant.now();
        Media media = Media.builder()
                .anilistId(aniData.getId())
                .kitsuId(kitsuId)
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

        Media savedMedia;
        try {
            savedMedia = mediaRepository.saveAndFlush(media);
        } catch (DataIntegrityViolationException ex) {
            log.info("Media with anilistId {} was concurrently saved by another thread", aniData.getId());
            return mediaRepository.findByAnilistId(aniData.getId())
                    .orElseThrow(() -> ex);
        }

        // 3. Build Season 1 & Episodes
        List<KitsuDto.EpisodeNode> episodeNodes = kitsuNodeOpt
                .map(KitsuDto.AnimeNode::getEpisodes)
                .map(KitsuDto.EpisodesConnection::getNodes)
                .orElse(Collections.emptyList());

        int episodeCount = !episodeNodes.isEmpty()
                ? episodeNodes.size()
                : (aniData.getEpisodes() != null ? aniData.getEpisodes() : 0);

        Season season = Season.builder()
                .media(savedMedia)
                .seasonNumber(1)
                .title("Temporada 1")
                .episodeCount(episodeCount)
                .createdAt(now)
                .build();

        Season savedSeason;
        try {
            savedSeason = seasonRepository.saveAndFlush(season);
        } catch (DataIntegrityViolationException ex) {
            savedSeason = seasonRepository.findByMediaIdAndSeasonNumber(savedMedia.getId(), 1)
                    .orElseThrow(() -> ex);
        }

        if (!episodeNodes.isEmpty()) {
            List<Episode> episodesToSave = new ArrayList<>();
            for (KitsuDto.EpisodeNode node : episodeNodes) {
                if (node == null || node.getNumber() == null) continue;

                String epTitle = (node.getTitles() != null && node.getTitles().getCanonical() != null && !node.getTitles().getCanonical().isBlank())
                        ? node.getTitles().getCanonical()
                        : "Episódio " + node.getNumber();

                String thumbnailUrl = (node.getThumbnail() != null && node.getThumbnail().getOriginal() != null)
                        ? node.getThumbnail().getOriginal().getUrl()
                        : null;

                Episode episode = Episode.builder()
                        .season(savedSeason)
                        .episodeNumber(node.getNumber())
                        .title(epTitle)
                        .thumbnailUrl(thumbnailUrl)
                        .durationMinutes(node.getLength() != null ? node.getLength() : aniData.getDuration())
                        .createdAt(now)
                        .build();

                episodesToSave.add(episode);
            }

            try {
                episodeRepository.saveAllAndFlush(episodesToSave);
            } catch (DataIntegrityViolationException ex) {
                log.warn("Episodes for season {} were concurrently saved", savedSeason.getId());
            }
        } else if (episodeCount > 0) {
            // Create fallback placeholder episodes if count is known but nodes weren't on Kitsu
            List<Episode> fallbackEpisodes = new ArrayList<>();
            for (int i = 1; i <= Math.min(episodeCount, 100); i++) {
                Episode episode = Episode.builder()
                        .season(savedSeason)
                        .episodeNumber(i)
                        .title("Episódio " + i)
                        .durationMinutes(aniData.getDuration())
                        .createdAt(now)
                        .build();
                fallbackEpisodes.add(episode);
            }
            try {
                episodeRepository.saveAllAndFlush(fallbackEpisodes);
            } catch (DataIntegrityViolationException ignored) {}
        }

        if (savedMedia.getTotalEpisodes() == 0 && episodeCount > 0) {
            savedMedia.setTotalEpisodes(episodeCount);
            mediaRepository.save(savedMedia);
        }

        return savedMedia;
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
