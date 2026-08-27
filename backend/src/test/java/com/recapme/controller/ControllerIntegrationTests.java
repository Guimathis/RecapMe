package com.recapme.controller;

import tools.jackson.databind.ObjectMapper;
import com.recapme.dto.request.SaveFeedbackRequestDto;
import com.recapme.dto.response.ListAllMediasResponseDto;
import com.recapme.dto.response.MediaItemDto;
import com.recapme.dto.response.OneRecapResponseDto;
import com.recapme.model.MediaType;
import com.recapme.service.FeedbackService;
import com.recapme.service.MediaService;
import com.recapme.service.RecapService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
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

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private RecapService recapService;

    @MockitoBean
    private FeedbackService feedbackService;

    @Test
    @DisplayName("GET /medias/search deve retornar 200 OK com lista de mídias")
    void shouldSearchMediasSuccessfully() throws Exception {
        MediaItemDto item = MediaItemDto.builder()
                .externalId("1399")
                .type(MediaType.SERIES)
                .title("Game of Thrones")
                .releaseYear(2011)
                .build();

        when(mediaService.search(eq("thrones"), any()))
                .thenReturn(ListAllMediasResponseDto.builder().items(List.of(item)).total(1).build());

        mockMvc.perform(get("/medias/search")
                        .param("query", "thrones")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].title").value("Game of Thrones"));
    }

    @Test
    @DisplayName("GET /recaps/{type}/{externalId} deve retornar 200 OK com resumo")
    void shouldGetRecapSuccessfully() throws Exception {
        OneRecapResponseDto recap = OneRecapResponseDto.builder()
                .externalId("1399")
                .mediaType(MediaType.SERIES)
                .mediaTitle("Game of Thrones")
                .seasonNumber(1)
                .seasonSummary("Resumo da 1ª temporada")
                .build();

        when(recapService.getSeasonRecap(eq(MediaType.SERIES), eq("1399"), eq(1)))
                .thenReturn(recap);

        mockMvc.perform(get("/recaps/SERIES/1399")
                        .param("season", "1")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mediaTitle").value("Game of Thrones"))
                .andExpect(jsonPath("$.seasonNumber").value(1));
    }

    @Test
    @DisplayName("POST /feedbacks com payload inválido deve retornar 400 Bad Request no formato RFC 7807")
    void shouldReturnBadRequestForInvalidFeedback() throws Exception {
        SaveFeedbackRequestDto invalidDto = SaveFeedbackRequestDto.builder()
                .contextType("") // Inválido (@NotBlank)
                .rating("")      // Inválido (@NotBlank)
                .build();

        mockMvc.perform(post("/feedbacks")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem-type:validation-error"))
                .andExpect(jsonPath("$.title").value("Validation Failed"))
                .andExpect(jsonPath("$.status").value(400));
    }
}
