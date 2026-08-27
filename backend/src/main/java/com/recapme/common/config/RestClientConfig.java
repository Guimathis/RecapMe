package com.recapme.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${recapme.tmdb.base-url}")
    private String tmdbBaseUrl;

    @Value("${recapme.tmdb.api-key:}")
    private String tmdbApiKey;

    @Value("${recapme.jikan.base-url}")
    private String jikanBaseUrl;

    @Bean
    public RestClient tmdbRestClient() {
        return RestClient.builder()
                .baseUrl(tmdbBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + tmdbApiKey)
                .build();
    }

    @Bean
    public RestClient jikanRestClient() {
        return RestClient.builder()
                .baseUrl(jikanBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
