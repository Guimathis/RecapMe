package com.recapme.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
public class FeedbackModel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "media_id", nullable = true)
    private UUID mediaId;

    @Column(name = "context_type", nullable = false, length = 32)
    private String contextType;

    @Column(name = "rating", nullable = false, length = 16)
    private String rating;

    @Column(name = "comment", nullable = true, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
