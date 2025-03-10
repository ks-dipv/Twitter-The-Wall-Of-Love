import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private bucketName: string;
  private logoBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: this.configService.get('MINIO_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>(
      'MINIO_PUBLIC_BUCKET_NAME',
    );

    this.logoBucket = 'logo';
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileBuffer = file.buffer;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    return `${this.configService.get('MINIO_ENDPOINT')}/${this.bucketName}/${fileName}`;
  }

  async logo(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${this.logoBucket}-${file.originalname}`;
    const fileBuffer = file.buffer;

    const uploadParams = {
      Bucket: this.logoBucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    return `${this.configService.get('MINIO_ENDPOINT')}/${this.logoBucket}/${fileName}`;
  }

  async deleteImage(fileName: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      }),
    );
  }

  async deleteLogo(fileName: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.logoBucket,
        Key: fileName,
      }),
    );
  }
}
