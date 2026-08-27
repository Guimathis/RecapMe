package com.recapme.repository;

import com.recapme.model.MediaModel;
import com.recapme.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<MediaModel, UUID> {
    Optional<MediaModel> findByMediaTypeAndExternalId(MediaType mediaType, String externalId);
}
