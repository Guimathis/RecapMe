CREATE SEQUENCE IF NOT EXISTS revinfo_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE medias
(
    id             UUID                           NOT NULL,
    external_id    VARCHAR(64)                    NOT NULL,
    media_type     VARCHAR(32)                    NOT NULL,
    title          VARCHAR(255)                   NOT NULL,
    original_title VARCHAR(255),
    overview       TEXT,
    poster_url     VARCHAR(512),
    backdrop_url   VARCHAR(512),
    release_year   INTEGER,
    total_seasons  INTEGER                        NOT NULL,
    total_episodes INTEGER                        NOT NULL,
    created_at     TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    updated_at     TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_medias PRIMARY KEY (id),
    CONSTRAINT uk_medias_type_external_id UNIQUE (media_type, external_id)
);

CREATE TABLE season_recaps
(
    id            UUID                           NOT NULL,
    media_id      UUID                           NOT NULL,
    season_number INTEGER                        NOT NULL,
    title         VARCHAR(255),
    summary       TEXT                           NOT NULL,
    key_takeaways TEXT,
    created_at    TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    updated_at    TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_season_recaps PRIMARY KEY (id),
    CONSTRAINT uk_season_recaps_media_season UNIQUE (media_id, season_number)
);

CREATE TABLE episode_recaps
(
    id              UUID                           NOT NULL,
    season_recap_id UUID                           NOT NULL,
    episode_number  INTEGER                        NOT NULL,
    title           VARCHAR(255),
    summary         TEXT                           NOT NULL,
    key_events      TEXT,
    created_at      TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    updated_at      TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_episode_recaps PRIMARY KEY (id),
    CONSTRAINT uk_episode_recaps_season_episode UNIQUE (season_recap_id, episode_number)
);

CREATE TABLE feedbacks
(
    id           UUID                           NOT NULL,
    media_id     UUID,
    context_type VARCHAR(32)                    NOT NULL,
    rating       VARCHAR(16)                    NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_feedbacks PRIMARY KEY (id)
);

CREATE TABLE revchanges
(
    rev        BIGINT NOT NULL,
    entityname VARCHAR(255)
);

CREATE TABLE revinfo
(
    rev      BIGINT NOT NULL,
    revtstmp BIGINT,
    CONSTRAINT pk_revinfo PRIMARY KEY (rev)
);

ALTER TABLE episode_recaps
    ADD CONSTRAINT FK_EPISODE_RECAPS_ON_SEASON_RECAP FOREIGN KEY (season_recap_id) REFERENCES season_recaps (id);

ALTER TABLE season_recaps
    ADD CONSTRAINT FK_SEASON_RECAPS_ON_MEDIA FOREIGN KEY (media_id) REFERENCES medias (id);

ALTER TABLE revchanges
    ADD CONSTRAINT fk_revchanges_on_default_tracking_modified_entities_changelog FOREIGN KEY (rev) REFERENCES revinfo (rev);
