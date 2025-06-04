import { dynamoDb, USERS_TABLE } from ".."; // Import dynamoDb and table name

interface UserData {
  userId: string;
  email: string;
  role: "admin" | "member";
  name?: string;
  createdAt?: number;
  lastLogin?: number;
}

const userModel = {
  /**
   * Creates or updates a user in DynamoDB.
   * @param userData - The user data to save.
   */
  async createOrUpdateUser(userData: UserData): Promise<UserData> {
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
        name: userData.name || userData.email, // Default name to email if not provided
        createdAt: userData.createdAt || Date.now(), // Set createdAt if not provided
        lastLogin: Date.now(), // Update last login on create or update
      },
    };
    try {
      await dynamoDb.put(params).promise();
      return params.Item as UserData;
    } catch (error) {
      console.error("Error creating/updating user in DynamoDB:", error);
      throw new Error("Could not create/update user.");
    }
  },

  /**
   * Retrieves a user by their userId.
   * @param userId - The ID of the user to retrieve.
   */
  async getUserById(userId: string): Promise<UserData | null> {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
    };
    try {
      const result = await dynamoDb.get(params).promise();
      return (result.Item as UserData) || null;
    } catch (error) {
      console.error("Error getting user from DynamoDB:", error);
      throw new Error("Could not retrieve user.");
    }
  },

  /**
   * Retrieves all users from DynamoDB.
   * Note: For large tables, consider pagination.
   */
  async getAllUsers(): Promise<UserData[]> {
    const params = {
      TableName: USERS_TABLE,
    };
    try {
      const result = await dynamoDb.scan(params).promise();
      return (result.Items as UserData[]) || [];
    } catch (error) {
      console.error("Error getting all users from DynamoDB:", error);
      throw new Error("Could not retrieve all users.");
    }
  },

  /**
   * Deletes a user by their userId.
   * @param userId - The ID of the user to delete.
   */
  async deleteUser(userId: string): Promise<void> {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
    };
    try {
      await dynamoDb.delete(params).promise();
    } catch (error) {
      console.error("Error deleting user from DynamoDB:", error);
      throw new Error("Could not delete user.");
    }
  },
};

export default userModel;
