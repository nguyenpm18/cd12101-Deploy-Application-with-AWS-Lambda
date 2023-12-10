import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');

const jwksUrl = 'https://dev-xpzjp37q5vjgpvei.us.auth0.com/.well-known/jwks.json';

const client = jwksClient({
  jwksUri: jwksUrl
});

function getKey(header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        logger.error('Error getting signing key', err);
        reject(err);
      } else {
        resolve(key.publicKey || key.rsaPublicKey);
      }
    });
  });
}

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    return allowPolicy(jwtToken.sub);
  } catch (e) {
    logger.error('User not authorized', { error: e.message });
    return unauthorizedResponse();
  }
}

async function verifyToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');
  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header');
  
  const token = getToken(authHeader);
  const decodedToken = jwt.decode(token, { complete: true });
  const key = await getKey(decodedToken.header);
  return jwt.verify(token, key, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  return authHeader.split(' ')[1];
}

function allowPolicy(principalId) {
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: '*'
      }]
    }
  };
}

function unauthorizedResponse() {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Deny',
        Resource: '*'
      }]
    }
  };
}
