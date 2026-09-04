package com.recapme.service;

import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.response.SaveFeedbackResponseDto;
import com.recapme.model.Feedback;
import com.recapme.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional
    public SaveFeedbackResponseDto saveFeedback(SaveFeedbackRequestDto requestDto) {
        Feedback feedback = Feedback.builder()
                .mediaId(requestDto.mediaId())
                .contextType(requestDto.contextType())
                .rating(requestDto.rating())
                .comment(requestDto.comment())
                .createdAt(Instant.now())
                .build();

        Feedback saved = feedbackRepository.save(feedback);

        return SaveFeedbackResponseDto.builder()
                .id(saved.getId())
                .mediaId(saved.getMediaId())
                .contextType(saved.getContextType())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
