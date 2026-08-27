package com.recapme.controller;

import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.model.MediaType;
import com.recapme.service.RecapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recaps")
@RequiredArgsConstructor
public class RecapController {

    private final RecapService recapService;

    @GetMapping("/{type}/{externalId}")
    public ResponseEntity<OneRecapResponseDto> getOneRecap(
            @PathVariable(value = "type") MediaType type,
            @PathVariable(value = "externalId") String externalId,
            @RequestParam(value = "season", required = false, defaultValue = "1") Integer season) {
        OneRecapResponseDto response = recapService.getSeasonRecap(type, externalId, season);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
