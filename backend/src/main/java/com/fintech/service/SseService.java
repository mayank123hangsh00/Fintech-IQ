package com.fintech.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private static final Logger log = LoggerFactory.getLogger(SseService.class);
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public SseService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public SseEmitter createEmitter(String userEmail) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userEmail, emitter);

        emitter.onCompletion(() -> emitters.remove(userEmail));
        emitter.onTimeout(() -> emitters.remove(userEmail));
        emitter.onError(e -> emitters.remove(userEmail));

        // Send initial connected event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("message", "Connected to Fintech Intelligence live stream")));
        } catch (IOException e) {
            log.error("Error sending initial SSE: {}", e.getMessage());
        }

        log.info("SSE emitter created for user: {}", userEmail);
        return emitter;
    }

    public void pushNotification(String userEmail, Map<String, Object> eventData) {
        SseEmitter emitter = emitters.get(userEmail);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(objectMapper.writeValueAsString(eventData)));
                log.info("SSE notification sent to user: {}", userEmail);
            } catch (IOException e) {
                log.error("Error sending SSE to {}: {}", userEmail, e.getMessage());
                emitters.remove(userEmail);
            }
        }
    }

    public void pushToAll(Map<String, Object> eventData) {
        emitters.forEach((email, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("broadcast")
                        .data(objectMapper.writeValueAsString(eventData)));
            } catch (IOException e) {
                emitters.remove(email);
            }
        });
    }

    public int getConnectedUsers() {
        return emitters.size();
    }
}
