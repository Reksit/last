package com.example.manager.service;

import com.example.manager.dto.RoadmapRequest;
import com.example.manager.dto.RoadmapResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiAIService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public RoadmapResponse generateRoadmap(RoadmapRequest request) {
        try {
            String prompt = buildPrompt(request);
            String response = callGeminiAPI(prompt);
            return parseResponse(response);
        } catch (Exception e) {
            System.err.println("Error generating roadmap: " + e.getMessage());
            return createFallbackRoadmap(request);
        }
    }

    private String buildPrompt(RoadmapRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a detailed roadmap for the following task:\n\n");
        prompt.append("Task Title: ").append(request.getTitle()).append("\n");
        prompt.append("Description: ").append(request.getDescription()).append("\n");
        
        if (request.getTimePeriod() != null && !request.getTimePeriod().isEmpty()) {
            prompt.append("Time Period: ").append(request.getTimePeriod()).append("\n");
        }
        
        prompt.append("\nPlease provide:\n");
        prompt.append("1. A comprehensive roadmap with clear steps\n");
        prompt.append("2. Break down the task into manageable subtasks\n");
        prompt.append("3. Provide realistic time estimates for each step\n");
        prompt.append("4. Include any prerequisites or dependencies\n");
        prompt.append("5. Suggest best practices and tips\n\n");
        prompt.append("Format the response as a structured roadmap with numbered steps.");
        
        return prompt.toString();
    }

    private String callGeminiAPI(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "topK", 40,
                    "topP", 0.95,
                    "maxOutputTokens", 2048
                )
            );

            String response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTextFromResponse(response);
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            throw new RuntimeException("Failed to generate roadmap", e);
        }
    }

    private String extractTextFromResponse(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode candidates = jsonNode.get("candidates");
            
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode text = parts.get(0).get("text");
                        if (text != null) {
                            return text.asText();
                        }
                    }
                }
            }
            
            throw new RuntimeException("Invalid response format from Gemini API");
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private RoadmapResponse parseResponse(String aiResponse) {
        List<String> steps = new ArrayList<>();
        String[] lines = aiResponse.split("\n");
        
        StringBuilder roadmapBuilder = new StringBuilder();
        String estimatedDuration = "Not specified";
        
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty()) {
                roadmapBuilder.append(line).append("\n");
                
                // Extract numbered steps
                if (line.matches("^\\d+\\..*")) {
                    steps.add(line);
                }
                
                // Try to extract duration estimates
                if (line.toLowerCase().contains("duration") || 
                    line.toLowerCase().contains("time") ||
                    line.toLowerCase().contains("estimate")) {
                    estimatedDuration = line;
                }
            }
        }
        
        return new RoadmapResponse(
            roadmapBuilder.toString().trim(),
            steps,
            estimatedDuration
        );
    }

    private RoadmapResponse createFallbackRoadmap(RoadmapRequest request) {
        String fallbackRoadmap = String.format(
            "Roadmap for: %s\n\n" +
            "1. Planning Phase\n" +
            "   - Define clear objectives and requirements\n" +
            "   - Research best practices and approaches\n" +
            "   - Create a detailed timeline\n\n" +
            "2. Preparation Phase\n" +
            "   - Gather necessary resources and tools\n" +
            "   - Set up the working environment\n" +
            "   - Identify potential challenges\n\n" +
            "3. Implementation Phase\n" +
            "   - Break down the task into smaller components\n" +
            "   - Execute each component systematically\n" +
            "   - Monitor progress regularly\n\n" +
            "4. Review and Optimization\n" +
            "   - Test and validate the results\n" +
            "   - Make necessary adjustments\n" +
            "   - Document lessons learned\n\n" +
            "5. Completion and Follow-up\n" +
            "   - Finalize all deliverables\n" +
            "   - Conduct final review\n" +
            "   - Plan for maintenance or next steps",
            request.getTitle()
        );

        List<String> steps = Arrays.asList(
            "1. Planning Phase",
            "2. Preparation Phase", 
            "3. Implementation Phase",
            "4. Review and Optimization",
            "5. Completion and Follow-up"
        );

        return new RoadmapResponse(fallbackRoadmap, steps, "Varies based on task complexity");
    }
}