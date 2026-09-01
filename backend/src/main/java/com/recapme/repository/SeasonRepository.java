package com.recapme.repository;

import com.recapme.model.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeasonRepository extends JpaRepository<Season, UUID> {

    List<Season> findByMediaIdOrderBySeasonNumberAsc(UUID mediaId);

    Optional<Season> findByMediaIdAndSeasonNumber(UUID mediaId, Integer seasonNumber);
}
