package com.fintech.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${groq.api.base-url}")
    private String groqBaseUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Bean(name = "groqRestClient")
    public RestClient groqRestClient() {
        return RestClient.builder()
                .baseUrl(groqBaseUrl)
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
