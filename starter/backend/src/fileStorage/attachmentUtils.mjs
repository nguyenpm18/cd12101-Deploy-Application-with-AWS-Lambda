import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('fileStorage/attachmentUtils.mjs');

// Initialize the S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

export async function getUploadUrl(fileId) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileId
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: urlExpiration
    });

    logger.info(`Generated upload URL: ${uploadUrl}`, { function: "getUploadUrl()" });
    return uploadUrl;
}

export function getAttachmentUrl(fileId) {
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileId}`;
}
