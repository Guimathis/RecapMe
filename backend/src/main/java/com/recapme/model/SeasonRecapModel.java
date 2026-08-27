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
@Table(name = "season_recaps", uniqueConstraints = {
        @UniqueConstraint(name = "uk_season_recaps_media_season", columnNames = {"media_id", "season_number"})
})
@Getter
@Setter
@NoArgsConstructor
public class SeasonRecapModel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "media_id", nullable = false)
    private MediaModel media;

    @Column(name = "season_number", nullable = false)
    private Integer seasonNumber;

    @Column(name = "title", nullable = true, length = 255)
    private String title;

    @Column(name = "summary", nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "key_takeaways", nullable = true, columnDefinition = "TEXT")
    private String keyTakeaways;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "seasonRecap", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EpisodeRecapModel> episodeRecaps = new ArrayList<>();
}
