package com.recapme.repository;

import com.recapme.model.Recap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecapRepository extends JpaRepository<Recap, UUID> {

    Optional<Recap> findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(UUID mediaId, UUID seasonId, UUID episodeId);

    Optional<Recap> findFirstByMediaIdAndSeasonIdAndEpisodeIdIsNullOrderByCreatedAtDesc(UUID mediaId, UUID seasonId);

    Optional<Recap> findFirstByMediaIdAndSeasonIdIsNullAndEpisodeIdIsNullOrderByCreatedAtDesc(UUID mediaId);

    default Optional<Recap> findByMediaIdAndSeasonIdAndEpisodeId(UUID mediaId, UUID seasonId, UUID episodeId) {
        return findFirstByMediaIdAndSeasonIdAndEpisodeIdOrderByCreatedAtDesc(mediaId, seasonId, episodeId);
    }

    default Optional<Recap> findByMediaIdAndSeasonIdAndEpisodeIdIsNull(UUID mediaId, UUID seasonId) {
        return findFirstByMediaIdAndSeasonIdAndEpisodeIdIsNullOrderByCreatedAtDesc(mediaId, seasonId);
    }

    default Optional<Recap> findByMediaIdAndSeasonIdIsNullAndEpisodeIdIsNull(UUID mediaId) {
        return findFirstByMediaIdAndSeasonIdIsNullAndEpisodeIdIsNullOrderByCreatedAtDesc(mediaId);
    }

    List<Recap> findByMediaId(UUID mediaId);

    List<Recap> findByMediaIdAndSeasonId(UUID mediaId, UUID seasonId);
}
