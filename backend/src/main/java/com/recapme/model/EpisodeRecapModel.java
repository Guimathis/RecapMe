package com.recapme.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "episode_recaps", uniqueConstraints = {
        @UniqueConstraint(name = "uk_episode_recaps_season_episode", columnNames = {"season_recap_id", "episode_number"})
})
@Getter
@Setter
@NoArgsConstructor
public class EpisodeRecapModel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_recap_id", nullable = false)
    private SeasonRecapModel seasonRecap;

    @Column(name = "episode_number", nullable = false)
    private Integer episodeNumber;

    @Column(name = "title", nullable = true, length = 255)
    private String title;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "key_events", nullable = true, columnDefinition = "TEXT")
    private String keyEvents;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
