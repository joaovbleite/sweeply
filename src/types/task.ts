export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
  };
  job_id?: string;
  job?: {
    id: string;
    title: string;
  };
  assignee_id?: string;
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  tags?: string[];
  attachments?: {
    id: string;
    filename: string;
    url: string;
    content_type: string;
    size: number;
    uploaded_at: string;
  }[];
  comments?: {
    id: string;
    text: string;
    created_at: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
  }[];
  dependencies?: string[]; // IDs of tasks that this task depends on
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  client_id?: string;
  job_id?: string;
  assignee_id?: string;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  client_id?: string;
  job_id?: string;
  assignee_id?: string;
  tags?: string[];
  dependencies?: string[];
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  client_id?: string;
  job_id?: string;
  assignee_id?: string;
  tags?: string[];
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
} 