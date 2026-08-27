package com.recapme.service;

import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.response.SaveFeedbackResponseDto;
import com.recapme.model.FeedbackModel;
import com.recapme.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional
    public SaveFeedbackResponseDto saveFeedback(SaveFeedbackRequestDto requestDto) {
        FeedbackModel feedback = new FeedbackModel();
        feedback.setMediaId(requestDto.getMediaId());
        feedback.setContextType(requestDto.getContextType());
        feedback.setRating(requestDto.getRating());
        feedback.setComment(requestDto.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        FeedbackModel saved = feedbackRepository.save(feedback);

        return SaveFeedbackResponseDto.builder()
                .id(saved.getId())
                .status("SUCCESS")
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
