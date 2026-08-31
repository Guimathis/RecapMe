package com.recapme.repository;

import com.recapme.model.Recap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecapRepository extends JpaRepository<Recap, UUID> {

    Optional<Recap> findByMediaIdAndSeasonIdAndEpisodeId(UUID mediaId, UUID seasonId, UUID episodeId);

    Optional<Recap> findByMediaIdAndSeasonIdAndEpisodeIdIsNull(UUID mediaId, UUID seasonId);

    Optional<Recap> findByMediaIdAndSeasonIdIsNullAndEpisodeIdIsNull(UUID mediaId);

    List<Recap> findByMediaId(UUID mediaId);

    List<Recap> findByMediaIdAndSeasonId(UUID mediaId, UUID seasonId);
}
