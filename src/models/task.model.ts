export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  reminderSent?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: Date;
}

export interface RoadmapRequest {
  title: string;
  description: string;
  timePeriod?: string;
}

export interface RoadmapResponse {
  roadmap: string;
  steps: string[];
  estimatedDuration: string;
}