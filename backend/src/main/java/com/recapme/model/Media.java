package com.recapme.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "medias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "anilist_id", unique = true)
    private Integer anilistId;

    @Column(name = "kitsu_id", length = 50)
    private String kitsuId;

    @Column(name = "title_romaji", nullable = false, length = 255)
    private String titleRomaji;

    @Column(name = "title_english", length = 255)
    private String titleEnglish;

    @Column(name = "title_portuguese", length = 255)
    private String titlePortuguese;

    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "banner_image_url", length = 500)
    private String bannerImageUrl;

    @Column(name = "format", nullable = false, length = 30)
    private String format;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "score", precision = 4, scale = 2)
    private BigDecimal score;

    @Column(name = "season_year")
    private Integer seasonYear;

    @Column(name = "season_period", length = 20)
    private String seasonPeriod;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_episodes", nullable = false)
    @Builder.Default
    private Integer totalEpisodes = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "media_genres", joinColumns = @JoinColumn(name = "media_id"))
    @Column(name = "genre", length = 50, nullable = false)
    @Builder.Default
    private Set<String> genres = new HashSet<>();

    @OneToMany(mappedBy = "media", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Season> seasons = new ArrayList<>();

    @OneToMany(mappedBy = "media", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Recap> recaps = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.totalEpisodes == null) {
            this.totalEpisodes = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
