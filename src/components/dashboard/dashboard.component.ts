import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { TaskReminderService } from '../../services/task-reminder.service';
import { NotificationComponent } from '../notification/notification.component';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="dashboard-container">
      <app-notification></app-notification>
      
      <nav class="navbar">
        <div class="container">
          <div class="nav-content">
            <div class="nav-brand">TaskManager Pro</div>
            <div class="nav-links">
              <span class="welcome-text">Welcome, {{ currentUser?.username }}!</span>
              <button class="btn-secondary" (click)="logout()">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container">
        <div class="dashboard-header">
          <h1 class="dashboard-title">My Tasks</h1>
          <button class="btn-primary" (click)="navigateToCreateTask()">
            <i class="icon-plus"></i>
            Create New Task
          </button>
        </div>

        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-number">{{ totalTasks }}</div>
            <div class="stats-label">Total Tasks</div>
          </div>
          <div class="stats-card">
            <div class="stats-number pending-color">{{ pendingTasks.length }}</div>
            <div class="stats-label">Pending</div>
          </div>
          <div class="stats-card">
            <div class="stats-number completed-color">{{ completedTasks.length }}</div>
            <div class="stats-label">Completed</div>
          </div>
        </div>

        <div class="tasks-section">
          <div class="tasks-container">
            <div class="tasks-column">
              <div class="column-header">
                <h2 class="column-title">Pending Tasks</h2>
                <span class="task-count">{{ pendingTasks.length }}</span>
              </div>
              
              <div class="tasks-list">
                <div *ngIf="pendingTasks.length === 0" class="empty-state">
                  <p>No pending tasks. Create your first task!</p>
                </div>
                
                <div 
                  *ngFor="let task of pendingTasks" 
                  class="task-card fade-in"
                  [class.priority-high]="task.priority === 'HIGH'"
                  [class.priority-medium]="task.priority === 'MEDIUM'"
                  [class.priority-low]="task.priority === 'LOW'"
                >
                  <div class="task-header">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <span class="priority-badge" [class]="task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta">
                    <span class="task-date" *ngIf="task.dueDate">
                      Due: {{ task.dueDate | date:'short' }}
                    </span>
                    <span class="task-created">
                      Created: {{ task.createdAt | date:'short' }}
                    </span>
                  </div>
                  
                  <div class="task-actions">
                    <button 
                      class="btn-sm btn-success" 
                      (click)="markAsCompleted(task.id!)"
                      [disabled]="isLoading"
                    >
                      Mark Complete
                    </button>
                    <button 
                      class="btn-sm btn-ai" 
                      (click)="viewRoadmap(task)"
                      [disabled]="isLoading"
                      *ngIf="task.aiRoadmap"
                      title="View AI Roadmap"
                    >
                      🤖 Roadmap
                    </button>
                    <button 
                      class="btn-sm btn-info" 
                      (click)="editTask(task.id!)"
                      [disabled]="isLoading"
                    >
                      Edit
                    </button>
                    <button 
                      class="btn-sm btn-danger" 
                      (click)="deleteTask(task.id!)"
                      [disabled]="isLoading"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="tasks-column">
              <div class="column-header">
                <h2 class="column-title">Completed Tasks</h2>
                <span class="task-count">{{ completedTasks.length }}</span>
              </div>
              
              <div class="tasks-list">
                <div *ngIf="completedTasks.length === 0" class="empty-state">
                  <p>No completed tasks yet.</p>
                </div>
                
                <div 
                  *ngFor="let task of completedTasks" 
                  class="task-card completed fade-in"
                  [class.priority-high]="task.priority === 'HIGH'"
                  [class.priority-medium]="task.priority === 'MEDIUM'"
                  [class.priority-low]="task.priority === 'LOW'"
                >
                  <div class="task-header">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <span class="priority-badge" [class]="task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta">
                    <span class="task-date" *ngIf="task.dueDate">
                      Due: {{ task.dueDate | date:'short' }}
                    </span>
                    <span class="task-completed">
                      Completed: {{ task.updatedAt | date:'short' }}
                    </span>
                  </div>
                  
                  <div class="task-actions">
                    <button 
                      class="btn-sm btn-warning" 
                      (click)="markAsPending(task.id!)"
                      [disabled]="isLoading"
                    >
                      Mark Pending
                    </button>
                    <button 
                      class="btn-sm btn-ai" 
                      (click)="viewRoadmap(task)"
                      [disabled]="isLoading"
                      *ngIf="task.aiRoadmap"
                      title="View AI Roadmap"
                    >
                      🤖 Roadmap
                    </button>
                    <button 
                      class="btn-sm btn-danger" 
                      (click)="deleteTask(task.id!)"
                      [disabled]="isLoading"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Roadmap Modal -->
      <div class="roadmap-modal" *ngIf="showRoadmapModal" (click)="closeRoadmapModal()">
        <div class="roadmap-content" (click)="$event.stopPropagation()">
          <div class="roadmap-header">
            <h2>🤖 AI Generated Roadmap</h2>
            <button class="close-btn" (click)="closeRoadmapModal()">×</button>
          </div>
          
          <div class="roadmap-body" *ngIf="selectedTaskRoadmap">
            <div class="task-info">
              <h3>{{ selectedTask?.title }}</h3>
              <p>{{ selectedTask?.description }}</p>
            </div>
            
            <div class="roadmap-text">
              <pre>{{ selectedTaskRoadmap }}</pre>
            </div>
          </div>
          
          <div class="roadmap-actions">
            <button class="btn-secondary" (click)="closeRoadmapModal()">
              Close
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #000000;
      position: relative;
      overflow: hidden;
    }

    .dashboard-container::before {
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

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-text {
      color: #b0b0b0;
      font-weight: 500;
      margin-right: 20px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30px 0;
      padding: 0 20px;
      position: relative;
      z-index: 10;
    }

    .dashboard-title {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      position: relative;
      z-index: 10;
    }

    .pending-color {
      color: #ffd43b !important;
    }

    .completed-color {
      color: #51cf66 !important;
    }

    .tasks-section {
      margin-top: 30px;
      position: relative;
      z-index: 10;
    }

    .tasks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .tasks-column {
      background: rgba(30, 30, 45, 0.95);
      border-radius: 15px;
      padding: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    .column-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .task-count {
      background: rgba(100, 255, 218, 0.2);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid rgba(100, 255, 218, 0.3);
    }

    .tasks-list {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .tasks-list::-webkit-scrollbar {
      width: 6px;
    }

    .tasks-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .tasks-list::-webkit-scrollbar-thumb {
      background: rgba(100, 255, 218, 0.3);
      border-radius: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: white;
      opacity: 0.7;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .task-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      flex: 1;
      margin-right: 10px;
    }

    .task-description {
      color: #b0b0b0;
      margin: 10px 0;
      line-height: 1.5;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 15px 0;
      font-size: 12px;
      color: #999;
    }

    .task-date {
      color: #ffd43b;
      font-weight: 500;
    }

    .task-created, .task-completed {
      color: #888;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .icon-plus::before {
      content: '+';
      font-size: 18px;
      font-weight: bold;
      margin-right: 5px;
    }

    .btn-ai {
      background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
      color: white;
      font-size: 12px;
      padding: 6px 12px;
    }

    .btn-ai:hover {
      background: linear-gradient(135deg, #8e24aa 0%, #5e35b1 100%);
      transform: translateY(-1px);
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

    .task-info {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(100, 255, 218, 0.1);
      border-radius: 8px;
      border-left: 4px solid #64ffda;
    }

    .task-info h3 {
      color: #64ffda;
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .task-info p {
      color: #e0e0e0;
      margin: 0;
      font-size: 14px;
    }

    .roadmap-text {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 20px;
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
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .tasks-container {
        grid-template-columns: 1fr;
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
        padding: 15px 20px;
      }

      .roadmap-actions button {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  pendingTasks: Task[] = [];
  completedTasks: Task[] = [];
  isLoading = false;
  showRoadmapModal = false;
  selectedTask: Task | null = null;
  selectedTaskRoadmap: string | null = null;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private taskReminderService: TaskReminderService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
    this.taskReminderService.startReminderService();
  }

  get totalTasks(): number {
    return this.pendingTasks.length + this.completedTasks.length;
  }

  loadTasks(): void {
    this.isLoading = true;
    
    this.taskService.getPendingTasks().subscribe({
      next: (tasks) => {
        this.pendingTasks = tasks;
        this.loadCompletedTasks();
      },
      error: (error) => {
        console.error('Error loading pending tasks:', error);
        this.isLoading = false;
      }
    });
  }

  loadCompletedTasks(): void {
    this.taskService.getCompletedTasks().subscribe({
      next: (tasks) => {
        this.completedTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading completed tasks:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/edit-task', taskId]);
  }

  markAsCompleted(taskId: number): void {
    this.isLoading = true;
    
    this.taskService.markTaskAsCompleted(taskId).subscribe({
      next: (updatedTask) => {
        this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId);
        this.completedTasks.push(updatedTask);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error marking task as completed:', error);
        this.isLoading = false;
      }
    });
  }

  markAsPending(taskId: number): void {
    this.isLoading = true;
    
    this.taskService.markTaskAsPending(taskId).subscribe({
      next: (updatedTask) => {
        this.completedTasks = this.completedTasks.filter(task => task.id !== taskId);
        this.pendingTasks.push(updatedTask);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error marking task as pending:', error);
        this.isLoading = false;
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId);
          this.completedTasks = this.completedTasks.filter(task => task.id !== taskId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.isLoading = false;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  viewRoadmap(task: Task): void {
    this.selectedTask = task;
    this.selectedTaskRoadmap = task.aiRoadmap || null;
    this.showRoadmapModal = true;
  }

  closeRoadmapModal(): void {
    this.showRoadmapModal = false;
    this.selectedTask = null;
    this.selectedTaskRoadmap = null;
  }
}