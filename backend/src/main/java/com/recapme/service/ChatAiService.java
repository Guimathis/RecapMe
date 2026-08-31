package com.recapme.service;

import com.recapme.dto.request.SendChatMessageRequestDto;
import com.recapme.model.Media;
import com.recapme.repository.MediaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Service
public class ChatAiService {

    private final ChatClient chatClient;
    private final RecapService recapService;
    private final MediaRepository mediaRepository;

    @Value("classpath:prompts/recap-chat.st")
    private Resource promptTemplateResource;

    @Value("${spring.ai.google.genai.api-key:${GOOGLE_GENAI_APIKEY:}}")
    private String geminiApiKey;

    @Autowired
    public ChatAiService(
            @Autowired(required = false) ChatClient.Builder chatClientBuilder,
            RecapService recapService,
            MediaRepository mediaRepository
    ) {
        if (chatClientBuilder != null) {
            this.chatClient = chatClientBuilder.build();
        } else {
            this.chatClient = null;
        }
        this.recapService = recapService;
        this.mediaRepository = mediaRepository;
    }

    public Flux<String> streamChat(SendChatMessageRequestDto request) {
        Media media = mediaRepository.findById(request.mediaId()).orElse(null);
        String mediaTitle = (media != null && media.getTitleEnglish() != null)
                ? media.getTitleEnglish()
                : (media != null ? media.getTitleRomaji() : "Obra");
        String format = (media != null) ? media.getFormat() : "ANIME";

        int seasonCutoff = (request.upToSeasonNumber() != null && request.upToSeasonNumber() > 0) ? request.upToSeasonNumber() : 1;
        int episodeCutoff = (request.upToEpisodeNumber() != null && request.upToEpisodeNumber() > 0) ? request.upToEpisodeNumber() : 1;

        String authorizedContext = recapService.getAuthorizedContext(
                request.mediaId(),
                seasonCutoff,
                episodeCutoff
        );

        if (chatClient == null || geminiApiKey == null || geminiApiKey.isBlank() || "demo-key".equalsIgnoreCase(geminiApiKey)) {
            return generateMockStreamResponse(mediaTitle, seasonCutoff, episodeCutoff, request.userMessage());
        }

        try {
            String systemPromptText = promptTemplateResource.getContentAsString(StandardCharsets.UTF_8);

            return chatClient.prompt()
                    .system(sp -> sp.text(systemPromptText)
                            .param("mediaTitle", mediaTitle)
                            .param("mediaType", format)
                            .param("seasonCutoff", seasonCutoff)
                            .param("episodeCutoff", episodeCutoff)
                            .param("authorizedRecapContext", authorizedContext))
                    .user(request.userMessage())
                    .stream()
                    .content();
        } catch (Exception e) {
            log.error("Error invoking Spring AI ChatClient: {}", e.getMessage());
            return Flux.just("Desculpe, ocorreu uma instabilidade na conexão com o modelo de IA. Por favor, tente novamente.");
        }
    }

    private Flux<String> generateMockStreamResponse(String mediaTitle, int seasonCutoff, int episodeCutoff, String userMessage) {
        String simulated = "Olá! Como assistente do RecapMe para **" + mediaTitle +
                "**, estou limitando minhas respostas rigorosamente até a **Temporada " + seasonCutoff +
                ", Episódio " + episodeCutoff + "**.\n\n" +
                "Com base no que você já assistiu: você perguntou sobre *\"" + userMessage + "\"*.\n" +
                "Até este ponto da narrativa, os acontecimentos confirmados indicam o desenvolvimento do conflito atual sem revelar spoilers futuros além do corte configurado!";

        String[] words = simulated.split(" ");
        return Flux.interval(Duration.ofMillis(40))
                .take(words.length)
                .map(i -> words[i.intValue()] + " ");
    }
}
