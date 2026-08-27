package com.recapme.controller;

import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.response.SaveFeedbackResponseDto;
import com.recapme.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<SaveFeedbackResponseDto> saveFeedback(
            @RequestBody @Valid SaveFeedbackRequestDto saveFeedbackRequestDto) {
        SaveFeedbackResponseDto response = feedbackService.saveFeedback(saveFeedbackRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
