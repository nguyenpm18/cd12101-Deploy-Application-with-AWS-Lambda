import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { createTodo } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/createTodos.js');

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1},
        dueDate: { type: 'string', format: 'date-time' }
      },
      required: ['name', 'dueDate'],
      additionalProperties: false
    }
  }
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .use(validator({ inputSchema }))
  .handler(async (event) => {
    try {
      const newTodo = JSON.parse(event.body);
      logger.info(`Processing newTodo: ${JSON.stringify(newTodo)}`, { function: 'handler()' });

      const userId = getUserId(event);
      const newItem = await createTodo(newTodo, userId);
      logger.info(`Created newItem: ${JSON.stringify(newItem)}`, { function: 'handler()' });

      return {
        statusCode: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ item: newItem })
      };
    } catch (error) {
      logger.error('Error in creating new TODO item', { error: error.message });
      throw new Error('Error creating new TODO item');
    }
  });

export default handler;
