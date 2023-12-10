import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { updateTodo } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/updateTodos.js');

const inputSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        todoId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' } // Adjust regex based on your todoId format
      },
      required: ['todoId']
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 }, // example constraints
        dueDate: { type: 'string', format: 'date-time' },
        done: { type: 'boolean' }
      },
      required: ['name', 'dueDate', 'done']
    }
  }
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  // .use(validator({ inputSchema }))
  .handler(async event => {
    try {
      const todoId = event.pathParameters.todoId;
      const updatedTodo = JSON.parse(event.body);
      const userId = getUserId(event);

      const updatedItem = await updateTodo(todoId, updatedTodo, userId);
      logger.info(`Todo item updated: ${JSON.stringify(updatedItem)}`, { userId });

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Todo updated successfully', item: updatedItem })
      };
    } catch (error) {
      logger.error(`Error updating todo item: ${error.message}`, { todoId, userId });
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
  });

export default handler;
