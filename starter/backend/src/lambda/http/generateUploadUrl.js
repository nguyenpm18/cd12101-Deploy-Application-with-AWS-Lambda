import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getTodoFileUploadUrl } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/generateUploadUrl');

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async event => {
    try {
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event);

      logger.info(`Generating upload URL for TODO item with todoId: ${todoId}`, { userId });

      const uploadUrl = await getTodoFileUploadUrl(todoId, userId);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          uploadUrl: uploadUrl
        })
      };
    } catch (error) {
      logger.error('Error generating upload URL', { error: error.message, todoId });
      throw new Error('Error generating upload URL');
    }
  });

export default handler;
