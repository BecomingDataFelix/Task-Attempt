import { dynamoDb, TASKS_TABLE } from ".."; // Import dynamoDb and table name
import { v4 as uuidv4 } from "uuid"; // For generating unique task IDs (install 'uuid')

// Install uuid: pnpm add uuid && pnpm add -D @types/uuid

interface TaskData {
  taskId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedToName: string; // User display name
  createdBy: string; // Admin User ID
  createdByName: string; // Admin display name
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  deadline: number; // Unix timestamp
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

const taskModel = {
  /**
   * Creates a new task in DynamoDB.
   * @param taskData - The task data to save.
   */
  async createTask(
    taskData: Omit<TaskData, "taskId" | "createdAt" | "updatedAt">
  ): Promise<TaskData> {
    const now = Date.now();
    const newItem: TaskData = {
      taskId: uuidv4(), // Generate a unique ID for the task
      createdAt: now,
      updatedAt: now,
      ...taskData,
      status: taskData.status || "Pending", // Default status
    };
    const params = {
      TableName: TASKS_TABLE,
      Item: newItem,
    };
    try {
      await dynamoDb.put(params).promise();
      return newItem;
    } catch (error) {
      console.error("Error creating task in DynamoDB:", error);
      throw new Error("Could not create task.");
    }
  },

  /**
   * Retrieves a single task by its ID.
   * @param taskId - The ID of the task to retrieve.
   * @param createdAt - The creation timestamp of the task.
   */
  async getTaskById(taskId: string, createdAt?: number): Promise<TaskData | null> {
    // If createdAt is provided, use it for the exact lookup
    if (createdAt) {
      const params = {
        TableName: TASKS_TABLE,
        Key: { taskId, createdAt },
      };
      try {
        const result = await dynamoDb.get(params).promise();
        return (result.Item as TaskData) || null;
      } catch (error) {
        console.error("Error getting task from DynamoDB:", error);
        throw new Error("Could not retrieve task.");
      }
    } else {
      // If createdAt is not provided, query by taskId only
      const params = {
        TableName: TASKS_TABLE,
        KeyConditionExpression: "taskId = :taskId",
        ExpressionAttributeValues: {
          ":taskId": taskId,
        },
        Limit: 1, // Get only the first matching item
      };
      try {
        const result = await dynamoDb.query(params).promise();
        return (result.Items && result.Items.length > 0 ? result.Items[0] as TaskData : null);
      } catch (error) {
        console.error("Error querying task from DynamoDB:", error);
        throw new Error("Could not retrieve task.");
      }
    }
  },

  /**
   * Retrieves all tasks from DynamoDB.
   * @returns A list of all tasks, ordered by createdAt (descending).
   */
  async getAllTasks(): Promise<TaskData[]> {
    const params = {
      TableName: TASKS_TABLE,
    };
    try {
      const result = await dynamoDb.scan(params).promise();
      // Sort in memory as DynamoDB Scan doesn't guarantee order
      return ((result.Items as TaskData[]) || []).sort(
        (a, b) => b.createdAt - a.createdAt
      );
    } catch (error) {
      console.error("Error getting all tasks from DynamoDB:", error);
      throw new Error("Could not retrieve all tasks.");
    }
  },

  /**
   * Retrieves tasks assigned to a specific user using the GSI.
   * @param assignedToUserId - The ID of the user to whom tasks are assigned.
   * @returns A list of tasks assigned to the user, ordered by createdAt (descending).
   */
  async getTasksByAssignedTo(assignedToUserId: string): Promise<TaskData[]> {
    const params = {
      TableName: TASKS_TABLE,
      IndexName: "AssignedToGSI", // Name of the GSI you created
      KeyConditionExpression: "assignedTo = :assignedTo",
      ExpressionAttributeValues: {
        ":assignedTo": assignedToUserId,
      },
      ScanIndexForward: false, // Order by createdAt descending
    };
    try {
      const result = await dynamoDb.query(params).promise();
      return (result.Items as TaskData[]) || [];
    } catch (error) {
      console.error(
        "Error getting tasks by assigned user from DynamoDB:",
        error
      );
      throw new Error("Could not retrieve assigned tasks.");
    }
  },

  /**
   * Updates an existing task in DynamoDB.
   * @param taskId - The ID of the task to update.
   * @param createdAt - The creation timestamp of the task.
   * @param updates - An object containing the attributes to update.
   */
  async updateTask(
    taskId: string,
    createdAt: number,
    updates: Partial<TaskData>
  ): Promise<TaskData> {
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};
    const expressionAttributeNames: { [key: string]: string } = {};
    let i = 0;

    // Create a copy of updates without updatedAt to avoid duplication
    const updatesWithoutUpdatedAt = { ...updates };
    delete updatesWithoutUpdatedAt.updatedAt;

    for (const key in updatesWithoutUpdatedAt) {
      if (
        updatesWithoutUpdatedAt.hasOwnProperty(key) &&
        key !== "taskId" &&
        key !== "createdAt"
      ) {
        const attrName = `#attr${i}`;
        const attrValue = `:val${i}`;
        updateExpressionParts.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = (updatesWithoutUpdatedAt as any)[key];
        i++;
      }
    }

    // Always update updatedAt timestamp
    updateExpressionParts.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = Date.now();

    const params = {
      TableName: TASKS_TABLE,
      Key: { taskId, createdAt },
      UpdateExpression: "SET " + updateExpressionParts.join(", "),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW", // Return the updated item
    };

    try {
      const result = await dynamoDb.update(params).promise();
      return result.Attributes as TaskData;
    } catch (error) {
      console.error("Error updating task in DynamoDB:", error);
      throw new Error("Could not update task.");
    }
  },

  /**
   * Deletes a task by its ID.
   * @param taskId - The ID of the task to delete.
   * @param createdAt - The creation timestamp of the task.
   */
  async deleteTask(taskId: string, createdAt: number): Promise<void> {
    const params = {
      TableName: TASKS_TABLE,
      Key: { taskId, createdAt },
    };
    try {
      await dynamoDb.delete(params).promise();
    } catch (error) {
      console.error("Error deleting task from DynamoDB:", error);
      throw new Error("Could not delete task.");
    }
  },
};

export default taskModel;