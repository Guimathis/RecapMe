package com.recapme.repository;

import com.recapme.model.EpisodeRecapModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EpisodeRecapRepository extends JpaRepository<EpisodeRecapModel, UUID> {
    Optional<EpisodeRecapModel> findBySeasonRecapIdAndEpisodeNumber(UUID seasonRecapId, Integer episodeNumber);
    List<EpisodeRecapModel> findBySeasonRecapIdOrderByEpisodeNumberAsc(UUID seasonRecapId);
}
