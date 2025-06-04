import express from 'express';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import cors from 'cors'; // You'll need to install 'cors'

// Import routes
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- CORS Middleware ---
// Allow requests from your frontend origin
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- AWS DynamoDB Configuration ---
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'TaskManagementUsers';
const TASKS_TABLE = process.env.TASKS_TABLE_NAME || 'TaskManagementTasks';

// --- Basic Route (for testing server health) ---
app.get('/', (req, res) => {
  res.status(200).send('Task Management Backend is running!');
});

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// --- Start the server ---
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`DynamoDB USERS_TABLE: ${USERS_TABLE}`);
  console.log(`DynamoDB TASKS_TABLE: ${TASKS_TABLE}`);
  console.log(`CORS allowed origin: * (all origins allowed for debugging)`);
});

// Export dynamoDb and table names for use in other modules (models/controllers)
export { dynamoDb, USERS_TABLE, TASKS_TABLE };