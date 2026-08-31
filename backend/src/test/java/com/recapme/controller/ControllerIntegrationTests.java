package com.recapme.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.request.SaveRecapRequestDto;
import com.recapme.dto.request.SendChatMessageRequestDto;
import com.recapme.dto.response.*;
import com.recapme.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private SeasonService seasonService;

    @MockitoBean
    private EpisodeService episodeService;

    @MockitoBean
    private RecapService recapService;

    @MockitoBean
    private ChatAiService chatAiService;

    @MockitoBean
    private FeedbackService feedbackService;

    @Test
    @DisplayName("GET /api/v1/medias deve retornar 200 OK com lista paginada de mídias")
    void shouldListMediasSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        MediaSummaryDto mediaDto = MediaSummaryDto.builder()
                .id(mediaId)
                .anilistId(16498)
                .titleRomaji("Shingeki no Kyojin")
                .titleEnglish("Attack on Titan")
                .score(BigDecimal.valueOf(8.65))
                .seasonYear(2013)
                .totalEpisodes(25)
                .genres(Set.of("Action", "Drama"))
                .build();

        ListAllMediasResponseDto responseDto = ListAllMediasResponseDto.builder()
                .content(List.of(mediaDto))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .isLast(true)
                .build();

        when(mediaService.listAll(anyInt(), anyInt(), any(), any(), any(), any()))
                .thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/medias")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].titleRomaji").value("Shingeki no Kyojin"))
                .andExpect(jsonPath("$.content[0].anilistId").value(16498));
    }

    @Test
    @DisplayName("GET /api/v1/medias/search deve retornar 200 OK com busca unaccent")
    void shouldSearchMediasSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        MediaSummaryDto mediaDto = MediaSummaryDto.builder()
                .id(mediaId)
                .anilistId(16498)
                .titleRomaji("Shingeki no Kyojin")
                .titleEnglish("Attack on Titan")
                .build();

        when(mediaService.search(eq("shingeki"), eq(0), eq(20)))
                .thenReturn(ListAllMediasResponseDto.builder().content(List.of(mediaDto)).totalElements(1).build());

        mockMvc.perform(get("/api/v1/medias/search")
                        .param("query", "shingeki")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].titleRomaji").value("Shingeki no Kyojin"));
    }

    @Test
    @DisplayName("GET /api/v1/medias/{id} deve retornar 200 OK com detalhes da obra")
    void shouldGetMediaByIdSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        OneMediaResponseDto mediaDto = OneMediaResponseDto.builder()
                .id(mediaId)
                .anilistId(16498)
                .titleRomaji("Shingeki no Kyojin")
                .seasons(List.of(SeasonSummaryDto.builder().seasonNumber(1).title("Temporada 1").build()))
                .build();

        when(mediaService.getById(mediaId)).thenReturn(mediaDto);

        mockMvc.perform(get("/api/v1/medias/{id}", mediaId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mediaId.toString()))
                .andExpect(jsonPath("$.titleRomaji").value("Shingeki no Kyojin"));
    }

    @Test
    @DisplayName("POST /api/v1/medias/ingest/{externalId} deve retornar 201 Created com a obra ingerida")
    void shouldForceIngestMediaSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        OneMediaResponseDto mediaDto = OneMediaResponseDto.builder()
                .id(mediaId)
                .anilistId(16498)
                .titleRomaji("Shingeki no Kyojin")
                .build();

        when(mediaService.forceIngest(16498)).thenReturn(mediaDto);

        mockMvc.perform(post("/api/v1/medias/ingest/{externalId}", 16498)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(mediaId.toString()))
                .andExpect(jsonPath("$.anilistId").value(16498));
    }

    @Test
    @DisplayName("GET /api/v1/medias/{mediaId}/seasons deve retornar 200 OK com lista de temporadas")
    void shouldGetMediaSeasonsSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        ListAllSeasonsResponseDto responseDto = ListAllSeasonsResponseDto.builder()
                .mediaId(mediaId)
                .seasons(List.of(SeasonSummaryDto.builder().seasonNumber(1).title("Temporada 1").episodeCount(25).build()))
                .build();

        when(mediaService.getSeasonsByMediaId(mediaId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/medias/{mediaId}/seasons", mediaId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mediaId").value(mediaId.toString()))
                .andExpect(jsonPath("$.seasons[0].seasonNumber").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/seasons/{seasonId}/episodes deve retornar 200 OK com episódios")
    void shouldGetSeasonEpisodesSuccessfully() throws Exception {
        UUID seasonId = UUID.randomUUID();
        ListAllEpisodesResponseDto responseDto = ListAllEpisodesResponseDto.builder()
                .seasonId(seasonId)
                .seasonNumber(1)
                .episodes(List.of(EpisodeSummaryDto.builder().episodeNumber(1).title("Episódio 1").build()))
                .build();

        when(seasonService.getEpisodesBySeasonId(seasonId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/seasons/{seasonId}/episodes", seasonId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seasonId").value(seasonId.toString()))
                .andExpect(jsonPath("$.episodes[0].episodeNumber").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/episodes/{id} deve retornar 200 OK com detalhes do episódio")
    void shouldGetEpisodeByIdSuccessfully() throws Exception {
        UUID episodeId = UUID.randomUUID();
        OneEpisodeResponseDto responseDto = OneEpisodeResponseDto.builder()
                .id(episodeId)
                .episodeNumber(1)
                .title("Para Você, 2000 Anos no Futuro")
                .durationMinutes(24)
                .build();

        when(episodeService.getById(episodeId)).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/episodes/{id}", episodeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(episodeId.toString()))
                .andExpect(jsonPath("$.title").value("Para Você, 2000 Anos no Futuro"));
    }

    @Test
    @DisplayName("GET /api/v1/recaps deve retornar 200 OK com resumo existente")
    void shouldGetRecapSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        OneRecapResponseDto responseDto = OneRecapResponseDto.builder()
                .id(UUID.randomUUID())
                .mediaId(mediaId)
                .targetType("MEDIA")
                .spoilerLevel("FULL_MEDIA")
                .content("### Resumo da Obra")
                .build();

        when(recapService.getRecap(eq(mediaId), any(), any())).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/recaps")
                        .param("mediaId", mediaId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mediaId").value(mediaId.toString()))
                .andExpect(jsonPath("$.content").value("### Resumo da Obra"));
    }

    @Test
    @DisplayName("POST /api/v1/recaps deve retornar 201 Created ao gerar resumo")
    void shouldSaveRecapSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        SaveRecapRequestDto requestDto = SaveRecapRequestDto.builder()
                .mediaId(mediaId)
                .targetType("MEDIA")
                .spoilerLevel("FULL_MEDIA")
                .build();

        SaveRecapResponseDto responseDto = SaveRecapResponseDto.builder()
                .id(UUID.randomUUID())
                .mediaId(mediaId)
                .targetType("MEDIA")
                .spoilerLevel("FULL_MEDIA")
                .content("### Resumo da Obra")
                .createdAt(Instant.now())
                .build();

        when(recapService.createRecap(any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/recaps")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.targetType").value("MEDIA"))
                .andExpect(jsonPath("$.content").value("### Resumo da Obra"));
    }

    @Test
    @DisplayName("POST /api/v1/chats/stream deve retornar 200 OK com SSE stream")
    void shouldStreamChatSuccessfully() throws Exception {
        UUID mediaId = UUID.randomUUID();
        SendChatMessageRequestDto requestDto = SendChatMessageRequestDto.builder()
                .mediaId(mediaId)
                .upToSeasonNumber(1)
                .upToEpisodeNumber(5)
                .userMessage("Quem destruiu o portão?")
                .build();

        when(chatAiService.streamChat(any())).thenReturn(Flux.just("O ", "Titã ", "Blindado!"));

        mockMvc.perform(post("/api/v1/chats/stream")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.TEXT_EVENT_STREAM_VALUE)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/v1/feedbacks com payload inválido deve retornar 400 Bad Request no formato RFC 7807")
    void shouldReturnBadRequestForInvalidFeedback() throws Exception {
        SaveFeedbackRequestDto invalidDto = SaveFeedbackRequestDto.builder()
                .contextType("") // Inválido (@NotBlank)
                .rating("")      // Inválido (@NotBlank)
                .build();

        mockMvc.perform(post("/api/v1/feedbacks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem-type:validation-error"))
                .andExpect(jsonPath("$.title").value("Validation Failed"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
