package com.recapme.repository;

import com.recapme.model.FeedbackModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<FeedbackModel, UUID> {
}
