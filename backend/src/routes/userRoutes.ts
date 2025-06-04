import { Router } from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Route to create/update a user profile (called after Cognito signup/login)
router.post('/', userController.createOrUpdateUser);

// Route to get a specific user profile (requires authentication)
router.get('/:id', authMiddleware(), userController.getUser);

// Route to get all user profiles (temporarily allowing all authenticated users for development)
router.get('/', authMiddleware(), userController.getAllUsers);

// Route to delete a user profile (requires admin role)
router.delete('/:id', authMiddleware('admin'), userController.deleteUser);

export default router;