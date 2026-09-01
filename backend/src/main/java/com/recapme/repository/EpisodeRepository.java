package com.recapme.repository;

import com.recapme.model.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, UUID> {

    List<Episode> findBySeasonIdOrderByEpisodeNumberAsc(UUID seasonId);

    Optional<Episode> findBySeasonIdAndEpisodeNumber(UUID seasonId, Integer episodeNumber);

    @Query("SELECT count(e) FROM Episode e WHERE e.season.media.id = :mediaId")
    long countBySeasonMediaId(@Param("mediaId") UUID mediaId);
}
