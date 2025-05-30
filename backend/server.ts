import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// Configure AWS DynamoDB
AWS.config.update({ region: 'us-east-1' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
  createdBy: string;
}

// Middleware to verify Cognito user and role
const authenticate = async (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const user = await cognito.getUser({ AccessToken: token }).promise();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create task (Admin only)
app.post('/tasks', authenticate, async (req: Request, res: Response) => {
  const { title, description, assignedTo, deadline } = req.body;
  const user = req.user;

  if (!user.UserAttributes.find((attr: any) => attr.Name === 'custom:role')?.Value === 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const task: Task = {
    id: uuidv4(),
    title,
    description,
    assignedTo,
    status: 'pending',
    deadline,
    createdBy: user.Username,
  };

  await dynamoDB.put({
    TableName: 'Tasks',
    Item: task,
  }).promise();

  // Trigger Lambda for notification
  const lambda = new AWS.Lambda();
  await lambda.invoke({
    FunctionName: 'TaskNotification',
    Payload: JSON.stringify({ taskId: task.id, assignedTo }),
  }).promise();

  res.status(201).json(task);
});

// Get all tasks (Admin) or assigned tasks (Team member)
app.get('/tasks', authenticate, async (req: Request, res: Response) => {
  const user = req.user;
  const isAdmin = user.UserAttributes.find((attr: any) => attr.Name === 'custom:role')?.Value === 'admin';

  const params = isAdmin
    ? { TableName: 'Tasks' }
    : { TableName: 'Tasks', FilterExpression: 'assignedTo = :user', ExpressionAttributeValues: { ':user': user.Username } };

  const result = await dynamoDB.scan(params).promise();
  res.json(result.Items);
});

// Update task status (Team member)
app.put('/tasks/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  const task = await dynamoDB.get({ TableName: 'Tasks', Key: { id } }).promise();
  if (!task.Item || task.Item.assignedTo !== user.Username) {
    return res.status(403).json({ error: 'Not authorized to update this task' });
  }

  await dynamoDB.update({
    TableName: 'Tasks',
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': status },
  }).promise();

  res.json({ message: 'Task updated' });
});

app.listen(3001, () => console.log('Server running on port 3001'));