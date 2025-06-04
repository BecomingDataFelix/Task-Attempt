import { Router } from 'express';
import taskController from '../controllers/taskController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Route to create a new task (requires admin role)
router.post('/', authMiddleware('admin'), taskController.createTask);

// Route to get all tasks (for admin) or assigned tasks (for members)
router.get('/', authMiddleware(), taskController.getTasks);

// Route to update a task (requires authentication, with role-based authorization in controller)
router.put('/:id', authMiddleware(), taskController.updateTask);

// Route to delete a task (requires admin role)
router.delete('/:id', authMiddleware('admin'), taskController.deleteTask);

export default router;
