package com.recapme.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.recapme.dto.response.EpisodeItemDto;
import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.model.EpisodeRecapModel;
import com.recapme.model.MediaModel;
import com.recapme.model.MediaType;
import com.recapme.model.SeasonRecapModel;
import com.recapme.repository.EpisodeRecapRepository;
import com.recapme.repository.SeasonRecapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecapService {

    private final MediaService mediaService;
    private final SeasonRecapRepository seasonRecapRepository;
    private final EpisodeRecapRepository episodeRecapRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @Cacheable(value = "season-recaps", key = "#type.name() + '-' + #externalId + '-' + #seasonNumber")
    public OneRecapResponseDto getSeasonRecap(MediaType type, String externalId, Integer seasonNumber) {
        int season = (seasonNumber != null && seasonNumber > 0) ? seasonNumber : 1;
        MediaModel media = mediaService.getOrSaveMedia(type, externalId, null);

        var existingRecap = seasonRecapRepository.findByMediaIdAndSeasonNumber(media.getId(), season);
        if (existingRecap.isPresent()) {
            return toOneRecapResponseDto(media, existingRecap.get());
        }

        // Criar ou sintetizar resumo base inicial para o MVP
        SeasonRecapModel newSeason = new SeasonRecapModel();
        newSeason.setMedia(media);
        newSeason.setSeasonNumber(season);
        newSeason.setTitle("Temporada " + season);
        newSeason.setSummary(generateInitialSummary(media, season));
        newSeason.setKeyTakeaways(serializeList(List.of(
                "Apresentação dos personagens centrais e premissa da trama.",
                "Desenvolvimento dos conflitos e alianças iniciais.",
                "Clímax da temporada e definição dos próximos desafios."
        )));
        newSeason.setCreatedAt(LocalDateTime.now());
        newSeason.setUpdatedAt(LocalDateTime.now());

        SeasonRecapModel savedSeason;
        try {
            savedSeason = seasonRecapRepository.save(newSeason);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.info("SeasonRecap media {} season {} já persistido por requisição concorrente.", media.getId(), season);
            return seasonRecapRepository.findByMediaIdAndSeasonNumber(media.getId(), season)
                    .map(s -> toOneRecapResponseDto(media, s))
                    .orElseThrow(() -> ex);
        }

        // Gerar episódios base
        int episodeCount = Math.min(media.getTotalEpisodes() != null ? media.getTotalEpisodes() : 10, 12);
        for (int ep = 1; ep <= episodeCount; ep++) {
            EpisodeRecapModel epModel = new EpisodeRecapModel();
            epModel.setSeasonRecap(savedSeason);
            epModel.setEpisodeNumber(ep);
            epModel.setTitle("Episódio " + ep);
            epModel.setSummary("Acontecimentos e revelações do episódio " + ep + " da obra " + media.getTitle() + ".");
            epModel.setKeyEvents(serializeList(List.of("Evento marcante do episódio " + ep)));
            epModel.setCreatedAt(LocalDateTime.now());
            epModel.setUpdatedAt(LocalDateTime.now());
            try {
                episodeRecapRepository.save(epModel);
            } catch (org.springframework.dao.DataIntegrityViolationException ignored) {
                // Episódio já persistido concorrentemente
            }
        }

        return toOneRecapResponseDto(media, savedSeason);
    }

    @Transactional(readOnly = true)
    public String getAuthorizedContext(MediaType type, String externalId, Integer seasonCutoff, Integer episodeCutoff) {
        var mediaOpt = mediaService.getOrSaveMedia(type, externalId, null);
        if (mediaOpt == null) {
            return "Informações básicas da obra.";
        }

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("Obra: ").append(mediaOpt.getTitle()).append("\n");
        if (mediaOpt.getOverview() != null) {
            contextBuilder.append("Sinopse Geral: ").append(mediaOpt.getOverview()).append("\n\n");
        }

        List<SeasonRecapModel> seasons = seasonRecapRepository.findByMediaIdOrderBySeasonNumberAsc(mediaOpt.getId());
        for (SeasonRecapModel season : seasons) {
            if (season.getSeasonNumber() <= seasonCutoff) {
                contextBuilder.append("== Temporada ").append(season.getSeasonNumber()).append(" ==\n");
                contextBuilder.append(season.getSummary()).append("\n");

                List<EpisodeRecapModel> episodes = episodeRecapRepository.findBySeasonRecapIdOrderByEpisodeNumberAsc(season.getId());
                for (EpisodeRecapModel ep : episodes) {
                    if (season.getSeasonNumber() < seasonCutoff || ep.getEpisodeNumber() <= episodeCutoff) {
                        contextBuilder.append("  - Ep. ").append(ep.getEpisodeNumber()).append(" (")
                                .append(ep.getTitle()).append("): ").append(ep.getSummary()).append("\n");
                    }
                }
                contextBuilder.append("\n");
            }
        }

        return contextBuilder.toString();
    }

    private String generateInitialSummary(MediaModel media, int season) {
        if (media.getOverview() != null && !media.getOverview().isBlank()) {
            return "Resumo da " + season + "ª temporada de " + media.getTitle() + ": " + media.getOverview();
        }
        return "Resumo da temporada " + season + " de " + media.getTitle() + ".";
    }

    private OneRecapResponseDto toOneRecapResponseDto(MediaModel media, SeasonRecapModel season) {
        List<EpisodeRecapModel> episodes = episodeRecapRepository.findBySeasonRecapIdOrderByEpisodeNumberAsc(season.getId());
        List<EpisodeItemDto> episodeDtos = episodes.stream()
                .map(ep -> EpisodeItemDto.builder()
                        .episodeNumber(ep.getEpisodeNumber())
                        .title(ep.getTitle())
                        .summary(ep.getSummary())
                        .keyEvents(deserializeList(ep.getKeyEvents()))
                        .build())
                .collect(Collectors.toList());

        return OneRecapResponseDto.builder()
                .mediaId(media.getId().toString())
                .externalId(media.getExternalId())
                .mediaType(media.getMediaType())
                .mediaTitle(media.getTitle())
                .seasonNumber(season.getSeasonNumber())
                .seasonTitle(season.getTitle())
                .seasonSummary(season.getSummary())
                .keyTakeaways(deserializeList(season.getKeyTakeaways()))
                .episodes(episodeDtos)
                .build();
    }

    private String serializeList(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
