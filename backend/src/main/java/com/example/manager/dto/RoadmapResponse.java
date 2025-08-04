package com.example.manager.dto;

import java.util.List;

public class RoadmapResponse {
    private String roadmap;
    private List<String> steps;
    private String estimatedDuration;

    // Constructors
    public RoadmapResponse() {}

    public RoadmapResponse(String roadmap, List<String> steps, String estimatedDuration) {
        this.roadmap = roadmap;
        this.steps = steps;
        this.estimatedDuration = estimatedDuration;
    }

    // Getters and Setters
    public String getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(String roadmap) {
        this.roadmap = roadmap;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }
}