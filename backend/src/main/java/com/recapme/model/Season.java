package com.recapme.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "seasons",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_seasons_media_season", columnNames = {"media_id", "season_number"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Season implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @Column(name = "season_number", nullable = false)
    @Builder.Default
    private Integer seasonNumber = 1;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "episode_count", nullable = false)
    @Builder.Default
    private Integer episodeCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "season", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Episode> episodes = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.seasonNumber == null) {
            this.seasonNumber = 1;
        }
        if (this.episodeCount == null) {
            this.episodeCount = 0;
        }
    }
}
