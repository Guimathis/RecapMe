package com.recapme.repository;

import com.recapme.model.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID>, JpaSpecificationExecutor<Media> {

    Optional<Media> findByAnilistId(Integer anilistId);

    Optional<Media> findByKitsuId(String kitsuId);

    @Query(value = """
        SELECT m.* FROM medias m
        WHERE to_tsvector('simple', immutable_unaccent(coalesce(m.title_romaji, '') || ' ' || coalesce(m.title_english, '') || ' ' || coalesce(m.title_portuguese, '')))
              @@ plainto_tsquery('simple', immutable_unaccent(:searchTerm))
           OR immutable_unaccent(lower(m.title_romaji)) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
           OR immutable_unaccent(lower(coalesce(m.title_english, ''))) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
           OR immutable_unaccent(lower(coalesce(m.title_portuguese, ''))) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
        ORDER BY m.score DESC NULLS LAST
    """,
    countQuery = """
        SELECT count(m.id) FROM medias m
        WHERE to_tsvector('simple', immutable_unaccent(coalesce(m.title_romaji, '') || ' ' || coalesce(m.title_english, '') || ' ' || coalesce(m.title_portuguese, '')))
              @@ plainto_tsquery('simple', immutable_unaccent(:searchTerm))
           OR immutable_unaccent(lower(m.title_romaji)) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
           OR immutable_unaccent(lower(coalesce(m.title_english, ''))) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
           OR immutable_unaccent(lower(coalesce(m.title_portuguese, ''))) LIKE immutable_unaccent(lower(concat('%', :searchTerm, '%')))
    """,
    nativeQuery = true)
    Page<Media> searchByTitleUnaccent(@Param("searchTerm") String searchTerm, Pageable pageable);
}
