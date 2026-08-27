package com.recapme.service;

import com.recapme.dto.request.ChatRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
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

    @Value("classpath:prompts/recap-chat.st")
    private Resource promptTemplateResource;

    @Value("${spring.ai.openai.api-key:demo-key}")
    private String openaiApiKey;

    public ChatAiService(ChatClient.Builder chatClientBuilder, RecapService recapService) {
        this.chatClient = chatClientBuilder.build();
        this.recapService = recapService;
    }

    public Flux<String> streamChat(ChatRequestDto request) {
        String authorizedContext = recapService.getAuthorizedContext(
                request.getMediaType(),
                request.getExternalId(),
                request.getSeasonCutoff(),
                request.getEpisodeCutoff()
        );

        // Fallback simulado para desenvolvimento local se chave não estiver configurada
        if ("demo-key".equalsIgnoreCase(openaiApiKey) || openaiApiKey.isBlank()) {
            return generateMockStreamResponse(request, authorizedContext);
        }

        try {
            String systemPromptText = promptTemplateResource.getContentAsString(StandardCharsets.UTF_8);

            return chatClient.prompt()
                    .system(sp -> sp.text(systemPromptText)
                            .param("mediaTitle", request.getTitle())
                            .param("mediaType", request.getMediaType().name())
                            .param("seasonCutoff", request.getSeasonCutoff())
                            .param("episodeCutoff", request.getEpisodeCutoff())
                            .param("authorizedRecapContext", authorizedContext))
                    .user(request.getMessage())
                    .stream()
                    .content();
        } catch (Exception e) {
            log.error("Erro ao chamar Spring AI ChatClient: {}", e.getMessage());
            return Flux.just("Desculpe, ocorreu uma instabilidade na conexão com o modelo de IA. Por favor, tente novamente.");
        }
    }

    private Flux<String> generateMockStreamResponse(ChatRequestDto request, String context) {
        String simulated = "Olá! Como assistente do RecapMe para **" + request.getTitle() + 
                "**, estou limitando minhas respostas rigorosamente até a **Temporada " + request.getSeasonCutoff() + 
                ", Episódio " + request.getEpisodeCutoff() + "**.\n\n" +
                "Com base no que você já viu: você perguntou sobre *\"" + request.getMessage() + "\"*.\n" +
                "Até este momento da história, os eventos confirmados indicam que o enredo está focado nas tensões apresentadas nesses primeiros episódios sem revelar nenhum spoiler futuro!";

        String[] words = simulated.split(" ");
        return Flux.interval(Duration.ofMillis(40))
                .take(words.length)
                .map(i -> words[i.intValue()] + " ");
    }
}
