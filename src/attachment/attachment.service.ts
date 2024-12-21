import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as process from 'node:process';
import * as crypto from 'node:crypto';

@Injectable()
export class AttachmentService {
  constructor(private readonly s3: S3Client) {
    this.s3 = new S3Client({
      region: process.env.REGION,
      endpoint: process.env.ENDPOINT,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    try {
      // Generate the key once and reuse it
      const fileKey = `lingoPet-${crypto.randomUUID()}-${file.originalname}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      // Construct the public URL
      return `https://${process.env.BUCKET}.mos.${process.env.REGION}.sufybkt.com/${fileKey}`;
    } catch (error) {
      // Log the actual error for debugging
      console.error('S3 upload error:', error);

      throw new InternalServerErrorException({
        message: 'Error uploading file to S3',
        error: {
          message: error.message,
          code: error.code,
        },
      });
    }
  }
}
