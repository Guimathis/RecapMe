package com.recapme.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medias", uniqueConstraints = {
        @UniqueConstraint(name = "uk_medias_type_external_id", columnNames = {"media_type", "external_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class MediaModel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "external_id", nullable = false, length = 64)
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 32)
    private MediaType mediaType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", nullable = true, length = 255)
    private String originalTitle;

    @Column(name = "overview", nullable = true, columnDefinition = "TEXT")
    private String overview;

    @Column(name = "poster_url", nullable = true, length = 512)
    private String posterUrl;

    @Column(name = "backdrop_url", nullable = true, length = 512)
    private String backdropUrl;

    @Column(name = "release_year", nullable = true)
    private Integer releaseYear;

    @Column(name = "total_seasons", nullable = false)
    private Integer totalSeasons = 1;

    @Column(name = "total_episodes", nullable = false)
    private Integer totalEpisodes = 1;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "media", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SeasonRecapModel> seasonRecaps = new ArrayList<>();
}
