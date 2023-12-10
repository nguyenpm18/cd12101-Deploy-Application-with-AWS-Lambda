import Axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');

// Replace with your Auth0 domain
const jwksUrl = 'https://dev-xpzjp37q5vjgpvei.us.auth0.com/.well-known/jwks.json';

// Replace the existing certificate with the one provided
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJZlnP7jltwkPbMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi14cHpqcDM3cTV2amdwdmVpLnVzLmF1dGgwLmNvbTAeFw0yMzExMjEw
MTIxMzVaFw0zNzA3MzAwMTIxMzVaMCwxKjAoBgNVBAMTIWRldi14cHpqcDM3cTV2
amdwdmVpLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAL/GZDV593D0/2DTOn6+x3+E9np3YR6i6JV952nrExMDT26n+Q9KWXdW+OGQ
OXN1R8bIbdh3Jjxw1b7f3+2FaiFvKKg4y9/yoIhT8Y1SPS5MWM0M0YPRAZ1Wmmf8
RxkIQ4cVS7MMntuLkADN9UhtydjndhUnhuKD8qXRGMrZVTnbNy4jL8Rz+9zdSXoB
4vfGZahYjPLYjFGvI7aIlATegFaB+DgRIWZRaYEM3QPX6kZx8LEAcMGG2w2S05UO
cnggGRx97deDLiOrFkn9SA4AL+15gQ5vxRHIpEF+M45G03K1TmDRl0zzLBnCQrYi
M1kmTZXZkBe7hTmL1uZ8Q1BGDLsCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQU7OXFBcDeFJpX/GRGn6psUK4D87gwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQC+GZxW9+CbepqX5QCjxenw+YeA7UGnfE364sU84RuR
hPvOsPDZJD3cFpM3WQ8sUvSnMz2BTD8wo/a4cO3W3xS//jM28OD46soyL0J7rfB2
JoTwe75cMQN4V/Xgd3elQXMx6Ajcz+oVaofUAsXy2jq1HqgqbQY7Kq+oXffnI8Cz
aluNzy+RlLKP/UBIVz+VvrIH1WPHEm0nVoLcBXyPhmUW3mlUnkhc1CUb6P54k+Eh
gVWymbpGPlxcBvHhoT9sQEzhfmq8cAPFKHKlwEDaVLzHjOo2sGxjXjwihAyp5FBs
dQKgWbinCjDxgR5399WF9x5C9ObgkEfZ2UDhyZdbSEaA
-----END CERTIFICATE-----`;

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = jsonwebtoken.decode(token, { complete: true });

  jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] });
  return jwt.payload;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
