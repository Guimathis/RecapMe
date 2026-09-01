package com.recapme.repository;

import com.recapme.model.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, UUID> {

    List<Episode> findBySeasonIdOrderByEpisodeNumberAsc(UUID seasonId);

    Optional<Episode> findBySeasonIdAndEpisodeNumber(UUID seasonId, Integer episodeNumber);
}
