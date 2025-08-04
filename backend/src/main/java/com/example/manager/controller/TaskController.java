package com.example.manager.controller;

import com.example.manager.dto.TaskRequest;
import com.example.manager.dto.TaskResponse;
import com.example.manager.service.TaskService;
import com.example.manager.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<TaskResponse> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TaskResponse>> getPendingTasks() {
        List<TaskResponse> tasks = taskService.getPendingTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<TaskResponse>> getCompletedTasks() {
        List<TaskResponse> tasks = taskService.getCompletedTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        try {
            TaskResponse task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse createdTask = taskService.createTask(taskRequest);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        try {
            TaskResponse updatedTask = taskService.updateTask(id, taskRequest);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> markTaskAsCompleted(@PathVariable Long id) {
        try {
            TaskResponse updatedTask = taskService.markTaskAsCompleted(id);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/pending")
    public ResponseEntity<TaskResponse> markTaskAsPending(@PathVariable Long id) {
        try {
            TaskResponse updatedTask = taskService.markTaskAsPending(id);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/send-reminder")
    public ResponseEntity<?> sendTaskReminder(@RequestBody Map<String, Object> reminderData) {
        try {
            Long taskId = Long.valueOf(reminderData.get("taskId").toString());
            String taskTitle = reminderData.get("taskTitle").toString();
            String taskDescription = reminderData.get("taskDescription").toString();
            String dueDate = reminderData.get("dueDate").toString();
            Integer hoursUntilDue = Integer.valueOf(reminderData.get("hoursUntilDue").toString());
            
            // Validate the hours until due to prevent negative or invalid values
            if (hoursUntilDue < 0) {
                hoursUntilDue = 0;
            }
            
            // Mark task as reminder sent
            taskService.markReminderSent(taskId);
            
            emailService.sendTaskReminder(taskTitle, taskDescription, dueDate, hoursUntilDue);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error sending task reminder: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}