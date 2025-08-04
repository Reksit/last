import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CreateTaskRequest, RoadmapRequest, RoadmapResponse } from '../../models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="create-task-container">
  <nav class="navbar">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">TaskManager Pro</div>
        <div class="nav-links">
          <button class="btn btn-outline-primary back-btn" (click)="goBack()">
            <span class="icon">←</span> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </nav>


      <div class="container">
        <div class="create-task-wrapper">
          <div class="create-task-card card">
            <div class="card-header">
              <h1 class="card-title">Create New Task</h1>
              <p class="card-subtitle">Fill in the details to create a new task</p>
            </div>

            <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="task-form">
              <div class="form-group">
                <label for="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  class="form-control"
                  [(ngModel)]="taskData.title"
                  name="title"
                  required
                  maxlength="100"
                  placeholder="Enter task title"
                />
                <div class="field-hint">
                  {{ taskData.title.length }}/100 characters
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description *</label>
                <textarea
                  id="description"
                  class="form-control"
                  [(ngModel)]="taskData.description"
                  name="description"
                  required
                  rows="4"
                  maxlength="500"
                  placeholder="Describe your task in detail"
                ></textarea>
                <div class="field-hint">
                  {{ taskData.description.length }}/500 characters
                </div>
              </div>

              <div class="form-group">
                <label for="priority">Priority *</label>
                <select
                  id="priority"
                  class="form-control"
                  [(ngModel)]="taskData.priority"
                  name="priority"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>

              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  class="form-control"
                  [(ngModel)]="dueDateString"
                  name="dueDate"
                  [min]="minDate"
                />
               
              </div>

              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <div *ngIf="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <div class="ai-section" *ngIf="!isLoading">
                <button
                  type="button"
                  class="btn-ai"
                  (click)="generateRoadmap()"
                  [disabled]="!taskData.title || !taskData.description || isGeneratingRoadmap"
                >
                  <span *ngIf="isGeneratingRoadmap" class="spinner"></span>
                  <span class="ai-icon" *ngIf="!isGeneratingRoadmap">🤖</span>
                  {{ isGeneratingRoadmap ? 'Generating AI Roadmap...' : 'Generate AI Roadmap' }}
                </button>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="goBack()"
                  [disabled]="isLoading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  [disabled]="!taskForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creating...' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- AI Roadmap Modal -->
        <div class="roadmap-modal" *ngIf="showRoadmapModal" (click)="closeRoadmapModal()">
          <div class="roadmap-content" (click)="$event.stopPropagation()">
            <div class="roadmap-header">
              <h2>🤖 AI Generated Roadmap</h2>
              <button class="close-btn" (click)="closeRoadmapModal()">×</button>
            </div>
            
            <div class="roadmap-body" *ngIf="generatedRoadmap">
              <div class="roadmap-text">
                <pre>{{ generatedRoadmap.roadmap }}</pre>
              </div>
              
              <div class="roadmap-duration" *ngIf="generatedRoadmap.estimatedDuration">
                <strong>Estimated Duration:</strong> {{ generatedRoadmap.estimatedDuration }}
              </div>
            </div>
            
            <div class="roadmap-actions">
              <button class="btn-secondary" (click)="closeRoadmapModal()">
                Ignore
              </button>
              <button class="btn-primary" (click)="acceptRoadmapAndCreateTask()">
                Accept & Create Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-task-container {
      min-height: 100vh;
      background: black;
      position: relative;
      overflow: hidden;
    }

    .create-task-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="0.5" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite"/></circle><circle cx="40" cy="60" r="0.8" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="70" cy="80" r="0.6" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite"/></circle><circle cx="10" cy="70" r="0.4" fill="white" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/></circle><circle cx="90" cy="10" r="0.7" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.8s" repeatCount="indefinite"/></circle><circle cx="30" cy="90" r="0.5" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.1;0.7" dur="3.2s" repeatCount="indefinite"/></circle><circle cx="60" cy="40" r="0.6" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.3;0.5" dur="2.7s" repeatCount="indefinite"/></circle></svg>') repeat;
      pointer-events: none;
      z-index: 1;
      animation: twinkle 10s linear infinite;
    }

    @keyframes twinkle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .navbar {
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #64ffda;
  border: 1px solid #64ffda;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #64ffda;
  color: #1a1a2e;
}

.back-btn .icon {
  margin-right: 6px;
  font-weight: bold;
}


    .create-task-wrapper {
      padding: 30px 0;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 10;
    }

    .create-task-card {
      width: 100%;
      max-width: 600px;
      padding: 40px;
      background: rgba(30, 30, 45, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: #b0b0b0;
      font-size: 16px;
      margin: 0;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      padding: 12px 15px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 16px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transition: all 0.3s ease;
      resize: vertical;
    }

    .form-control::placeholder {
      color: #888;
    }

    .form-control:focus {
      outline: none;
      border-color: #64ffda;
      box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
    }

    .form-control select {
      cursor: pointer;
    }

    .field-hint {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions button {
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .form-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #64ffda 0%, #00bcd4 100%);
      color: #1a1a2e;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(100, 255, 218, 0.4);
    }

    .btn-secondary {
      background: #ff6b6b;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #ff5252;
      transform: translateY(-2px);
    }

    .ai-section {
      margin: 20px 0;
      text-align: center;
    }

    .btn-ai {
      background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
      border: none;
      border-radius: 25px;
      padding: 12px 25px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 auto;
      min-width: 200px;
    }

    .btn-ai:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
    }

    .btn-ai:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .ai-icon {
      font-size: 18px;
    }

    .roadmap-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }

    .roadmap-content {
      background: rgba(30, 30, 45, 0.98);
      border-radius: 15px;
      max-width: 800px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .roadmap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .roadmap-header h2 {
      color: #fff;
      margin: 0;
      font-size: 24px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .roadmap-body {
      padding: 30px;
    }

    .roadmap-text {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #9c27b0;
    }

    .roadmap-text pre {
      color: #e0e0e0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }

    .roadmap-duration {
      background: rgba(156, 39, 176, 0.1);
      border: 1px solid rgba(156, 39, 176, 0.3);
      border-radius: 8px;
      padding: 15px;
      color: #e0e0e0;
      font-size: 14px;
    }

    .roadmap-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding: 20px 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .roadmap-actions button {
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      min-width: 120px;
    }

    .error-message {
      color: #ff6b6b;
      font-size: 14px;
      padding: 10px 15px;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 6px;
    }

    .success-message {
      color: #51cf66;
      font-size: 14px;
      padding: 10px 15px;
      background: rgba(81, 207, 102, 0.1);
      border: 1px solid rgba(81, 207, 102, 0.3);
      border-radius: 6px;
    }

    textarea.form-control {
      min-height: 100px;
    }

    @media (max-width: 768px) {
      .create-task-card {
        padding: 20px;
        margin: 0 15px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }

      .roadmap-modal {
        padding: 10px;
      }

      .roadmap-content {
        max-height: 90vh;
      }

      .roadmap-header {
        padding: 15px 20px;
      }

      .roadmap-body {
        padding: 20px;
      }

      .roadmap-actions {
        flex-direction: column;
        padding: 15px 20px;
      }

      .roadmap-actions button {
        width: 100%;
      }
    }
  `]
})
export class CreateTaskComponent {
  taskData: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'MEDIUM'
  };

  dueDateString = '';
  minDate = '';
  isLoading = false;
  isGeneratingRoadmap = false;
  showRoadmapModal = false;
  generatedRoadmap: RoadmapResponse | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {
    this.setMinDate();
  }

  private setMinDate(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minDate = now.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert date string to Date object if provided
    if (this.dueDateString) {
      // Create date object and ensure it's in the correct timezone
      const localDate = new Date(this.dueDateString);
      // Adjust for timezone offset to ensure the date is stored correctly
      this.taskData.dueDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    } else {
      this.taskData.dueDate = undefined;
    }

    this.taskService.createTask(this.taskData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
        
        // Navigate back to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create task. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  generateRoadmap(): void {
    if (!this.taskData.title || !this.taskData.description) {
      this.errorMessage = 'Please fill in task title and description first.';
      return;
    }

    this.isGeneratingRoadmap = true;
    this.errorMessage = '';

    const roadmapRequest: RoadmapRequest = {
      title: this.taskData.title,
      description: this.taskData.description,
      timePeriod: this.dueDateString ? `Due: ${new Date(this.dueDateString).toLocaleDateString()}` : undefined
    };

    this.taskService.generateRoadmap(roadmapRequest).subscribe({
      next: (response) => {
        this.isGeneratingRoadmap = false;
        this.generatedRoadmap = response;
        this.showRoadmapModal = true;
      },
      error: (error) => {
        this.isGeneratingRoadmap = false;
        this.errorMessage = 'Failed to generate roadmap. Please try again.';
        console.error('Roadmap generation error:', error);
      }
    });
  }

  closeRoadmapModal(): void {
    this.showRoadmapModal = false;
    this.generatedRoadmap = null;
  }

  acceptRoadmapAndCreateTask(): void {
    // Close the modal first
    this.closeRoadmapModal();
    
    // Create the task
    this.onSubmit();
  }
}