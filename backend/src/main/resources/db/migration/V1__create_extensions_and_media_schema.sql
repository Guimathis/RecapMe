CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função wrapper IMMUTABLE para permitir uso do unaccent em índices do PostgreSQL
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text AS
$func$
  SELECT public.unaccent('public.unaccent', $1)
$func$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

CREATE TABLE medias
(
    id               UUID                         NOT NULL,
    anilist_id       INTEGER,
    kitsu_id         VARCHAR(50),
    title_romaji     VARCHAR(255)                 NOT NULL,
    title_english    VARCHAR(255),
    title_portuguese VARCHAR(255),
    synopsis         TEXT,
    cover_image_url  VARCHAR(500),
    banner_image_url VARCHAR(500),
    format           VARCHAR(30)                  NOT NULL,
    status           VARCHAR(30)                  NOT NULL,
    score            NUMERIC(4, 2),
    season_year      INTEGER,
    season_period    VARCHAR(20),
    duration_minutes INTEGER,
    total_episodes   INTEGER                      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP WITH TIME ZONE     NOT NULL,
    updated_at       TIMESTAMP WITH TIME ZONE     NOT NULL,
    CONSTRAINT pk_medias PRIMARY KEY (id),
    CONSTRAINT uk_medias_anilist_id UNIQUE (anilist_id)
);

CREATE TABLE media_genres
(
    media_id UUID        NOT NULL,
    genre    VARCHAR(50) NOT NULL,
    CONSTRAINT pk_media_genres PRIMARY KEY (media_id, genre),
    CONSTRAINT fk_media_genres_on_media FOREIGN KEY (media_id) REFERENCES medias (id) ON DELETE CASCADE
);

CREATE TABLE seasons
(
    id            UUID                     NOT NULL,
    media_id      UUID                     NOT NULL,
    season_number INTEGER                  NOT NULL DEFAULT 1,
    title         VARCHAR(255)             NOT NULL,
    episode_count INTEGER                  NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_seasons PRIMARY KEY (id),
    CONSTRAINT uk_seasons_media_season UNIQUE (media_id, season_number),
    CONSTRAINT fk_seasons_on_media FOREIGN KEY (media_id) REFERENCES medias (id) ON DELETE CASCADE
);

CREATE TABLE episodes
(
    id               UUID                     NOT NULL,
    season_id        UUID                     NOT NULL,
    episode_number   INTEGER                  NOT NULL,
    title            VARCHAR(255)             NOT NULL,
    thumbnail_url    VARCHAR(500),
    synopsis         TEXT,
    duration_minutes INTEGER,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_episodes PRIMARY KEY (id),
    CONSTRAINT uk_episodes_season_episode UNIQUE (season_id, episode_number),
    CONSTRAINT fk_episodes_on_season FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE
);

CREATE TABLE recaps
(
    id            UUID                     NOT NULL,
    media_id      UUID                     NOT NULL,
    season_id     UUID,
    episode_id    UUID,
    target_type   VARCHAR(30)              NOT NULL,
    spoiler_level VARCHAR(50)              NOT NULL,
    content       TEXT                     NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_recaps PRIMARY KEY (id),
    CONSTRAINT fk_recaps_on_media FOREIGN KEY (media_id) REFERENCES medias (id) ON DELETE CASCADE,
    CONSTRAINT fk_recaps_on_season FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE,
    CONSTRAINT fk_recaps_on_episode FOREIGN KEY (episode_id) REFERENCES episodes (id) ON DELETE CASCADE
);

CREATE TABLE feedbacks
(
    id           UUID                     NOT NULL,
    media_id     UUID,
    context_type VARCHAR(32)              NOT NULL,
    rating       VARCHAR(16)              NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_feedbacks PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_medias_title_unaccent ON medias USING gin(
    to_tsvector('simple', immutable_unaccent(coalesce(title_romaji, '') || ' ' || coalesce(title_english, '') || ' ' || coalesce(title_portuguese, '')))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_recaps_media_season_episode
    ON recaps (media_id, season_id, episode_id) NULLS NOT DISTINCT;
