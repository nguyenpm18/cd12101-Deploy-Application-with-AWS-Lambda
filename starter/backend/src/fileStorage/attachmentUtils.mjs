import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createLogger } from '../utils/logger.mjs';
import AWSXRay from 'aws-xray-sdk-core';

const logger = createLogger('fileStorage/attachmentUtils.mjs');

// Initialize S3 client with AWS X-Ray for tracing
const s3Client = AWSXRay.captureAWSv3Client(new S3Client());
const bucketName = process.env.ATTACHMENT_BUCKET_NAME;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

// Function to get a pre-signed URL for S3 uploads
export async function getUploadUrl(fileId) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileId
    });

    const uploadFileUrl = await getSignedUrl(s3Client, command, {
        expiresIn: urlExpiration
    });

    logger.info(`Obtained an uploadUrl = ${uploadFileUrl}`, { function: "getUploadUrl()" });
    return uploadFileUrl;
}

// Function to construct the URL for accessing an uploaded file
export function getAttachmentUrl(fileId) {
    return `https://${bucketName}.s3.amazonaws.com/${fileId}`;
}
