import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import AWSXRay from 'aws-xray-sdk-core';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('dataLayer/todosAccess.mjs');

export class TodosAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.ITEM_TABLE
    ) {
        this.documentClient = documentClient;
        this.todosTable = todosTable;
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient);
    }

    async getAllTodos(userId) {
        try {
            const result = await this.dynamoDbClient.query({
                TableName: this.todosTable,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                ScanIndexForward: false
            });
            return result.Items;
        } catch (error) {
            logger.error(`Error fetching todos for user ${userId}: ${error.message}`);
            throw new Error('Error fetching todos');
        }
    }

    async createTodo(todo) {
        try {
            await this.dynamoDbClient.put({
                TableName: this.todosTable,
                Item: todo
            });
            return todo;
        } catch (error) {
            logger.error(`Error creating todo: ${error.message}`);
            throw new Error('Error creating todo');
        }
    }

    async updateTodo(updatedTodoItem) {
        try {
            await this.dynamoDbClient.update({
                TableName: this.todosTable,
                Key: {
                    'userId': updatedTodoItem.userId,
                    'todoId': updatedTodoItem.todoId
                },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':name': updatedTodoItem.name,
                    ':dueDate': updatedTodoItem.dueDate,
                    ':done': updatedTodoItem.done
                },
                ExpressionAttributeNames: {
                    '#name': 'name'
                }
            });
            return updatedTodoItem;
        } catch (error) {
            logger.error(`Error updating todo: ${error.message}`);
            throw new Error('Error updating todo');
        }
    }

    async deleteTodo(deletedTodo) {
        try {
            await this.dynamoDbClient.delete({
                TableName: this.todosTable,
                Key: {
                    'userId': deletedTodo.userId,
                    'todoId': deletedTodo.todoId
                }
            });
        } catch (error) {
            logger.error(`Error deleting todo: ${error.message}`);
            throw new Error('Error deleting todo');
        }
    }

    async updateTodoAttachmentUrl(updatedTodoAttachment) {
        try {
            await this.dynamoDbClient.update({
                TableName: this.todosTable,
                Key: {
                    'userId': updatedTodoAttachment.userId,
                    'todoId': updatedTodoAttachment.todoId
                },
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': updatedTodoAttachment.attachmentUrl
                }
            });
        } catch (error) {
            logger.error(`Error updating todo attachment URL: ${error.message}`);
            throw new Error('Error updating attachment URL');
        }
    }
}
