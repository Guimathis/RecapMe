package com.recapme.service;

import com.recapme.model.Episode;
import com.recapme.model.Media;
import com.recapme.model.Season;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class RecapAiService {

    private final ChatClient chatClient;

    @Autowired
    public RecapAiService(@Autowired(required = false) ChatClient.Builder chatClientBuilder) {
        if (chatClientBuilder != null) {
            this.chatClient = chatClientBuilder.build();
        } else {
            this.chatClient = null;
        }
    }

    public String generateRecap(Media media, Season season, Episode episode, String targetType, String spoilerLevel) {
        String mediaTitle = media.getTitleEnglish() != null ? media.getTitleEnglish() : media.getTitleRomaji();

        if (chatClient != null) {
            try {
                String prompt = buildPrompt(media, season, episode, targetType, spoilerLevel, mediaTitle);
                return chatClient.prompt()
                        .system("Você é um especialista e roteirista do RecapMe. Gere resumos narrativos envolventes em Markdown, sem spoilers além do limite informado.")
                        .user(prompt)
                        .call()
                        .content();
            } catch (Exception e) {
                log.warn("Spring AI call failed, falling back to structured template: {}", e.getMessage());
            }
        }

        return generateFallbackRecap(media, season, episode, targetType, spoilerLevel, mediaTitle);
    }

    private String buildPrompt(Media media, Season season, Episode episode, String targetType, String spoilerLevel, String mediaTitle) {
        StringBuilder sb = new StringBuilder();
        sb.append("Gere um resumo detalhado em português com formatação Markdown para a obra: ").append(mediaTitle).append("\n");
        sb.append("Sinopse geral: ").append(media.getSynopsis() != null ? media.getSynopsis() : "N/A").append("\n");

        if (episode != null) {
            sb.append("Escopo: Episódio ").append(episode.getEpisodeNumber()).append(" (").append(episode.getTitle()).append(")\n");
            if (season != null) {
                sb.append("Temporada: ").append(season.getSeasonNumber()).append(" (").append(season.getTitle()).append(")\n");
            }
        } else if (season != null) {
            sb.append("Escopo: Temporada ").append(season.getSeasonNumber()).append(" (").append(season.getTitle()).append(")\n");
        } else {
            sb.append("Escopo: Obra Completa\n");
        }

        sb.append("Limite estrito de spoiler: ").append(spoilerLevel).append("\n");
        sb.append("Inclua visão geral dos acontecimentos, pontos-chave e o impacto narrativo.");
        return sb.toString();
    }

    private String generateFallbackRecap(Media media, Season season, Episode episode, String targetType, String spoilerLevel, String mediaTitle) {
        if ("EPISODE".equalsIgnoreCase(targetType) && episode != null) {
            String seasonPrefix = season != null ? "Temporada " + season.getSeasonNumber() + ", " : "";
            return String.format("""
                ### Resumo do Episódio %d: %s (%s)

                No episódio %d de **%s** (%s), a trama se aprofunda nos acontecimentos recentes:

                - **Abertura e Contexto:** O episódio estabelece os novos desafios enfrentados pelos personagens centrais.
                - **Conflito Principal:** Revelações e momentos de tensão que definem os rumos imediatos da narrativa.
                - **Desfecho:** Um desfecho que prepara o terreno para os próximos eventos sem ultrapassar a trava de spoilers (%s).
                """,
                    episode.getEpisodeNumber(),
                    episode.getTitle(),
                    seasonPrefix + mediaTitle,
                    episode.getEpisodeNumber(),
                    mediaTitle,
                    episode.getTitle(),
                    spoilerLevel
            );
        } else if ("SEASON".equalsIgnoreCase(targetType) && season != null) {
            return String.format("""
                ### Resumo da Temporada %d: %s

                A %dª temporada de **%s** desenvolve o arco central com foco nas transformações dos protagonistas e nos grandes confrontos:

                - **Arco Narrativo:** Estabelecimento dos objetivos da temporada e introdução de figuras decisivas.
                - **Pontos de Virada:** Grandes reviravoltas que alteram a dinâmica de forças do universo da obra.
                - **Conclusão:** O fechamento do arco sazonal estabelecendo as bases para a continuação.
                """,
                    season.getSeasonNumber(),
                    season.getTitle(),
                    season.getSeasonNumber(),
                    mediaTitle
            );
        } else {
            return String.format("""
                ### Resumo Geral: %s

                **%s** é uma obra marcada por sua narrativa envolvente e personagens memoráveis.

                **Sinopse:**
                %s

                **Pontos Essenciais:**
                - Premissa sólida e construção de mundo rica.
                - Desenvolvimento progressivo de tensões e reviravoltas marcantes.
                """,
                    mediaTitle,
                    mediaTitle,
                    media.getSynopsis() != null ? media.getSynopsis() : "Sem sinopse disponível."
            );
        }
    }
}
