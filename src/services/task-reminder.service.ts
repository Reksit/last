import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { Task } from '../models/task.model';
import { Observable, interval, switchMap, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskReminderService {
  private apiUrl = 'http://localhost:8080/api/tasks';
  private reminderInterval = 60000; // Check every minute
  private sentReminders = new Set<number>(); // Track tasks that already had reminders sent

  constructor(
    private http: HttpClient,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  startReminderService(): void {
    // Only start if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }

    interval(this.reminderInterval)
      .pipe(
        filter(() => this.authService.isAuthenticated()),
        switchMap(() => this.taskService.getPendingTasks())
      )
      .subscribe({
        next: (tasks) => {
          this.checkTasksForReminders(tasks);
        },
        error: (error) => {
          console.error('Error checking task reminders:', error);
        }
      });
  }

  private checkTasksForReminders(tasks: Task[]): void {
    const now = new Date();

    tasks.forEach(task => {
      if (task.dueDate && task.id && !task.reminderSent) {
        // Parse the due date properly, considering it might be a string from API
        const dueDate = new Date(task.dueDate);
        
        // Check if the due date is valid
        if (isNaN(dueDate.getTime())) {
          console.error('Invalid due date for task:', task.title);
          return;
        }
        
        // Calculate time difference in milliseconds
        const timeDifference = dueDate.getTime() - now.getTime();
        
        // Check if task is due within 24 hours and not overdue
        if (timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000) {
          // Calculate hours more accurately
          const hoursUntilDue = Math.max(1, Math.ceil(timeDifference / (1000 * 60 * 60)));
          
          // Show popup notification
          this.notificationService.addNotification({
            title: 'Task Due Soon!',
            message: `"${task.title}" is due in ${hoursUntilDue} hour(s)`,
            type: 'warning',
            taskId: task.id
          });

          // Send email reminder
          this.sendEmailReminder(task, hoursUntilDue);
        }
      }
    });
  }

  private sendEmailReminder(task: Task, hoursUntilDue: number): void {
    // Format the due date properly for display
    const dueDate = new Date(task.dueDate!);
    const formattedDueDate = dueDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const reminderData = {
      taskId: task.id,
      taskTitle: task.title,
      taskDescription: task.description,
      dueDate: formattedDueDate,
      hoursUntilDue: hoursUntilDue
    };

    this.http.post(`${this.apiUrl}/send-reminder`, reminderData, this.getHttpOptions())
      .subscribe({
        next: () => {
          console.log(`Email reminder sent for task: ${task.title}`);
        },
        error: (error) => {
          console.error('Failed to send email reminder:', error);
        }
      });
  }

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  }
}