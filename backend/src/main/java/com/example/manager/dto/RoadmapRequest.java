package com.example.manager.dto;

import jakarta.validation.constraints.NotBlank;

public class RoadmapRequest {
    
    @NotBlank(message = "Task title is required")
    private String title;

    @NotBlank(message = "Task description is required")
    private String description;

    private String timePeriod;

    // Constructors
    public RoadmapRequest() {}

    public RoadmapRequest(String title, String description, String timePeriod) {
        this.title = title;
        this.description = description;
        this.timePeriod = timePeriod;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(String timePeriod) {
        this.timePeriod = timePeriod;
    }
}