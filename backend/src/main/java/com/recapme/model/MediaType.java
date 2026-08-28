package com.recapme.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tipo de conteúdo audiovisual (MOVIE = Filme, SERIES = Série, ANIME = Anime)")
public enum MediaType {
    MOVIE,
    SERIES,
    ANIME
}
