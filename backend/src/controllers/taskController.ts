import { Request, Response } from 'express';
import taskModel from '../models/taskModel';

const taskController = {
  /**
   * Creates a new task.
   * Requires admin role (authMiddleware('admin')).
   */
  async createTask(req: Request, res: Response): Promise<Response> {
    const { title, description, assignedTo, assignedToName, status, deadline } = req.body;
    const createdBy = req.user?.userId; // From authMiddleware
    const createdByName = req.user?.name || req.user?.email; // From authMiddleware

    if (!title || !description || !assignedTo || !assignedToName || !deadline || !createdBy || !createdByName) {
      return res.status(400).json({ message: 'Missing required task fields.' });
    }

    try {
      const newTask = await taskModel.createTask({
        title,
        description,
        assignedTo,
        assignedToName,
        createdBy,
        createdByName,
        status: status || 'Pending', // Default to Pending if not provided
        deadline,
      });
      return res.status(201).json({ message: 'Task created successfully.', task: newTask });
    } catch (error: any) {
      console.error("Error in createTask controller:", error.message);
      return res.status(500).json({ message: 'Failed to create task.', error: error.message });
    }
  },

  /**
   * Retrieves all tasks (for admin) or tasks assigned to the current user (for members).
   * Requires authentication (authMiddleware).
   */
  async getTasks(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
      let tasks;
      if (req.user.role === 'admin') {
        tasks = await taskModel.getAllTasks();
      } else {
        // For members, only fetch tasks assigned to them
        tasks = await taskModel.getTasksByAssignedTo(req.user.userId);
      }
      
      return res.status(200).json(tasks);
    } catch (error: any) {
      console.error("Error in getTasks controller:", error.message);
      return res.status(500).json({ message: 'Failed to retrieve tasks.', error: error.message });
    }
  },

  /**
   * Updates an existing task.
   * Requires authentication (authMiddleware).
   * Authorization: Admin can update any task. Member can only update their assigned tasks' status.
   */
  async updateTask(req: Request, res: Response): Promise<Response> {
    const { id: taskId } = req.params; // Task ID from URL parameter
    const { createdAt } = req.body; // Get createdAt from request body
    const updates = req.body;
    const currentUser = req.user;

    console.log('Update task request:', { taskId, createdAt, updates, currentUser });

    if (!currentUser) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!taskId || !createdAt) {
      return res.status(400).json({ message: 'Task ID and createdAt are required.' });
    }

    try {
      const existingTask = await taskModel.getTaskById(taskId, createdAt);
      
      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      console.log('Found task:', existingTask);

      // Authorization Logic
      if (currentUser.role === 'member') {
        // Members can only update their own assigned tasks
        if (existingTask.assignedTo !== currentUser.userId) {
          return res.status(403).json({ 
            message: 'Access denied. You can only update your assigned tasks.',
            taskAssignedTo: existingTask.assignedTo,
            currentUserId: currentUser.userId
          });
        }
        
        // Members can only update 'status'
        const allowedMemberUpdates = ['status', 'updatedAt', 'createdAt']; // Include createdAt as allowed
        const receivedKeys = Object.keys(updates);
        if (receivedKeys.some(key => !allowedMemberUpdates.includes(key))) {
          return res.status(403).json({ 
            message: 'Access denied. Members can only update task status.',
            receivedFields: receivedKeys,
            allowedFields: allowedMemberUpdates
          });
        }
      }

      const updatedTask = await taskModel.updateTask(taskId, createdAt, updates);
      return res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
    } catch (error: any) {
      console.error("Error in updateTask controller:", error.message);
      return res.status(500).json({ message: 'Failed to update task.', error: error.message });
    }
  },

  /**
   * Deletes a task.
   * Requires admin role (authMiddleware('admin')).
   */
  async deleteTask(req: Request, res: Response): Promise<Response> {
    const { id: taskId } = req.params; // Task ID from URL parameter
    const { createdAt } = req.query; // Get createdAt from query parameters
    
    if (!taskId || !createdAt) {
      return res.status(400).json({ message: 'Task ID and createdAt are required.' });
    }

    try {
      const existingTask = await taskModel.getTaskById(taskId, Number(createdAt));
      
      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found.' });
      }
      
      await taskModel.deleteTask(taskId, Number(createdAt));
      return res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error: any) {
      console.error("Error in deleteTask controller:", error.message);
      return res.status(500).json({ message: 'Failed to delete task.', error: error.message });
    }
  },
};

export default taskController;