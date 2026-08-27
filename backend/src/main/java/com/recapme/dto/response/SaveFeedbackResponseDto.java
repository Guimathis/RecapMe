package com.recapme.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveFeedbackResponseDto implements Serializable {
    private UUID id;
    private String status;
    private LocalDateTime createdAt;
}
