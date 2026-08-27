package com.recapme.repository;

import com.recapme.model.SeasonRecapModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeasonRecapRepository extends JpaRepository<SeasonRecapModel, UUID> {
    Optional<SeasonRecapModel> findByMediaIdAndSeasonNumber(UUID mediaId, Integer seasonNumber);
    List<SeasonRecapModel> findByMediaIdOrderBySeasonNumberAsc(UUID mediaId);
}
