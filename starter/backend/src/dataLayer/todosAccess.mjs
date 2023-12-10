import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('dataLayer/todosAccess.mjs');

export class TodosAccess {
    constructor(
        documentClient = new DynamoDB(),
        todosTable = process.env.TODOS_TABLE
    ) {
        this.documentClient = documentClient;
        this.todosTable = todosTable;
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient);
    }

    async getAllTodos(userId) {
        logger.info(`Getting all todos for user_id ${userId}`, { function: "getAllTodos()" });

        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        });

        logger.info(`Todos result = ${JSON.stringify(result)}`, { function: "getAllTodos()" });

        return result.Items;
    }

    async createTodo(todo) {
        logger.info(`Storing a new todo: ${JSON.stringify(todo)}`, { function: "createTodo()" });

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: todo
        });

        return todo;
    }

    async updateTodo(updatedTodoItem) {
        logger.info(`Updating todo: ${JSON.stringify(updatedTodoItem)}`, { function: "updateTodo()" });

        const updateResult = await this.dynamoDbClient.update({
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
            },
            ReturnValues: 'UPDATED_NEW'
        });

        return updateResult;
    }

    async deleteTodo(todoId, userId) {
        logger.info(`Deleting todo with todoId ${todoId} and userId ${userId}`, { function: "deleteTodo()" });

        const deleteResult = await this.dynamoDbClient.delete({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'todoId': todoId
            },
            ReturnValues: 'ALL_OLD'
        });

        logger.info(`Deleted item: ${JSON.stringify(deleteResult)}`, { function: "deleteTodo()" });
        return deleteResult;
    }

    async updateTodoAttachmentUrl(todoId, userId, attachmentUrl) {
        logger.info(`Updating attachment URL for todoId ${todoId} and userId ${userId}`, { function: "updateTodoAttachmentUrl()" });

        const updateResult = await this.dynamoDbClient.update({
            TableName: this.todosTable,
            Key: {
                'userId': userId,
                'todoId': todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            ReturnValues: 'UPDATED_NEW'
        });

        return updateResult;
    }
}
