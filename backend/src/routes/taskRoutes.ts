import { Router } from 'express';
import { createTask, getTasks, updateTask } from '../controllers/taskController';
import { verifyUser } from '../middlewares/auth';

const router = Router();

router.post('/', verifyUser, createTask);
router.get('/', verifyUser, getTasks);
router.put('/:id', verifyUser, updateTask);

export default router;