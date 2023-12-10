import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getAllTodos } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/getTodos.js');

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ origin: '*', credentials: true }))
  .handler(async event => {
    try {
      const userId = getUserId(event);
      logger.info(`Retrieving TODO items for user: ${userId}`, { function: 'handler()' });

      const todos = await getAllTodos(userId);
      logger.info(`Retrieved ${todos.length} TODO items`, { function: 'handler()' });

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ items: todos })
      };
    } catch (error) {
      logger.error(`Error retrieving TODO items: ${error.message}`, { userId });
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
  });

export default handler;
