import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const createTask = async (req: Request, res: Response) => {
  const { title, description, assignedTo, deadline } = req.body;
  const taskId = uuidv4();

  const command = new PutItemCommand({
    TableName: process.env.TASKS_TABLE,
    Item: {
      id: { S: taskId },
      title: { S: title },
      description: { S: description },
      assignedTo: { S: assignedTo },
      deadline: { S: deadline },
      status: { S: 'pending' },
    },
  });

  await dbClient.send(command);
  res.status(201).json({ message: 'Task created', taskId });
};

export const getTasks = async (_req: Request, res: Response) => {
  const command = new ScanCommand({ TableName: process.env.TASKS_TABLE });
  const result = await dbClient.send(command);
  res.json(result.Items);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const command = new UpdateItemCommand({
    TableName: process.env.TASKS_TABLE,
    Key: { id: { S: id } },
    UpdateExpression: 'SET #s = :status',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':status': { S: status } },
  });

  await dbClient.send(command);
  res.json({ message: 'Task updated' });
};