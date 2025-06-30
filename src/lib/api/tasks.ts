import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types/task';

export const tasksApi = {
  // Get all tasks with optional filtering
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        client:clients(id, name),
        job:jobs(id, title),
        assignee:profiles(id, name, avatar_url)
      `)
      .order('due_date', { ascending: true });
    
    // Apply filters if provided
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }
      
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      
      if (filters.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      
      if (filters.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }
      
      if (filters.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }
      
      if (filters.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
    
    return data || [];
  },
  
  // Get a single task by ID
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        client:clients(id, name),
        job:jobs(id, title),
        assignee:profiles(id, name, avatar_url),
        comments:task_comments(id, text, created_at, user_id, user_name, user_avatar),
        attachments:task_attachments(id, filename, url, content_type, size, uploaded_at)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }
    
    return data;
  },
  
  // Create a new task
  async create(taskData: CreateTaskInput): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Authentication error: User not authenticated');
      throw new Error('User not authenticated. Please log in again.');
    }
    
    try {
      const newTask = {
        id: uuidv4(),
        ...taskData,
        status: taskData.status || 'open',
        priority: taskData.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select(`
          *,
          client:clients(id, name),
          job:jobs(id, title),
          assignee:profiles(id, name, avatar_url)
        `)
        .single();
      
      if (error) {
        console.error('Error creating task:', error);
        if (error.code === '42501') {
          throw new Error('Permission denied: You do not have permission to create tasks');
        }
        throw new Error(`Failed to create task: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Failed to create task: No data returned');
      }
      
      return data;
    } catch (error: any) {
      console.error('Unexpected error creating task:', error);
      throw error;
    }
  },
  
  // Update an existing task
  async update(id: string, taskData: UpdateTaskInput): Promise<Task> {
    const updates = {
      ...taskData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name),
        job:jobs(id, title),
        assignee:profiles(id, name, avatar_url)
      `)
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
    
    return data;
  },
  
  // Delete a task
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  },
  
  // Add a comment to a task
  async addComment(taskId: string, text: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();
    
    const { error } = await supabase
      .from('task_comments')
      .insert([{
        id: uuidv4(),
        task_id: taskId,
        text,
        created_at: new Date().toISOString(),
        user_id: user.id,
        user_name: profile?.name || user.email,
        user_avatar: profile?.avatar_url
      }]);
    
    if (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  },
  
  // Upload an attachment to a task
  async addAttachment(taskId: string, file: File): Promise<void> {
    const filename = `${uuidv4()}-${file.name}`;
    const filePath = `task-attachments/${taskId}/${filename}`;
    
    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload file');
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);
    
    const { error } = await supabase
      .from('task_attachments')
      .insert([{
        id: uuidv4(),
        task_id: taskId,
        filename: file.name,
        url: publicUrl,
        content_type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error saving attachment metadata:', error);
      throw new Error('Failed to save attachment metadata');
    }
  }
}; 