package com.recapme.controller;

import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.OneMediaResponseDto;
import com.recapme.model.MediaType;
import com.recapme.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/medias")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/search")
    public ResponseEntity<ListAllMediasResponseDto> searchMedias(
            @RequestParam(value = "query") String query,
            @RequestParam(value = "type", required = false) MediaType type) {
        ListAllMediasResponseDto response = mediaService.search(query, type);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{type}/{externalId}")
    public ResponseEntity<OneMediaResponseDto> getOneMedia(
            @PathVariable(value = "type") MediaType type,
            @PathVariable(value = "externalId") String externalId) {
        OneMediaResponseDto response = mediaService.getDetails(type, externalId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
