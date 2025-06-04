import { Request, Response } from 'express';
import { dynamoDb, USERS_TABLE } from '../index';

// Create or update a user profile
export const createOrUpdateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { userId, email, role, name, lastLogin } = req.body;

    // Validate required fields
    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    // Ensure the authenticated user can only update their own profile
    // unless they are an admin
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Prepare the user item
    const userItem = {
      userId,
      email,
      role: role || 'member', // Default to member if not specified
      name: name || email, // Use email as name if not provided
      lastLogin: lastLogin || Date.now(),
      updatedAt: Date.now(),
    };

    // Save to DynamoDB
    await dynamoDb.put({
      TableName: USERS_TABLE,
      Item: userItem,
    }).promise();

    res.status(200).json(userItem);
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ message: 'Failed to create/update user', error: error.message });
  }
};

// Get a specific user profile
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ensure the authenticated user can only view their own profile
    // unless they are an admin
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own profile' });
    }

    const result = await dynamoDb.get({
      TableName: USERS_TABLE,
      Key: { userId: id },
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.Item);
  } catch (error: any) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

// Get all user profiles (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // This endpoint should already be protected by the authMiddleware with admin role
    const result = await dynamoDb.scan({
      TableName: USERS_TABLE,
    }).promise();

    const users = result.Items || [];
    
    // Log the users being returned for debugging
    console.log(`Returning ${users.length} users`);
    
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

// Delete a user profile (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This endpoint should already be protected by the authMiddleware with admin role
    await dynamoDb.delete({
      TableName: USERS_TABLE,
      Key: { userId: id },
    }).promise();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

export default {
  createOrUpdateUser,
  getUser,
  getAllUsers,
  deleteUser,
};