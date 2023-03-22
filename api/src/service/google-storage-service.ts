import { Bucket, Storage } from '@google-cloud/storage'
import { config } from '../config';

const defaultBucket = config.google.bucketName;

/**
 * Wrapper for Google Cloud Storage
 */
export class GoogleStorageService {
  readonly client = new Storage({
    projectId: config.google.projectId,
    keyFilename: config.google.keyFilename
  });

  async write(path: string, body: string | Buffer): Promise<void> {
    const bucket = await this.getDefaultBucket();
    await bucket.file(path).save(body);
  }

  async getContents(path: string): Promise<Buffer> {
    const bucket = await this.getDefaultBucket();
    const [contents] = await bucket.file(path).download();
    return contents;
  }

  async getUploadUrl(path: string, expires: Date): Promise<string> {
    const bucket = await this.getDefaultBucket();
    const res = await bucket.file(path).getSignedUrl({
      action: 'write',
      expires,
      contentType: 'audio/mpeg'
    });
    const [uploadUrl] = res;
    return uploadUrl;
  }
  
  /**
   * Returns the single bucket used for user audio uploads
   * Creates the bucket if it doesn't exist
  */
 async getDefaultBucket(): Promise<Bucket> {
   const bucket = this.client.bucket(defaultBucket);
   await bucket.setCorsConfiguration([{
     origin: [config.webUrl],
     responseHeader: ["Content-Type", "Access-Control-Allow-Origin", "X-Goog-Resumable"],
     method: ["GET", "HEAD", "DELETE", "POST", "PUT", "OPTIONS"],
     maxAgeSeconds: 3600
    }]);
    return bucket;
  }

  /**
   * Strips everything but the object path from a Storage URL
   */
  makeKey(url: string): string {
    const { pathname } = new URL(url);
    const [bucket, ...keyParts] = pathname.replace(/^\//, '').split('/');
    console.log({ pathname, bucket, keyParts})
    if (bucket !== defaultBucket) {
      throw new Error('Invalid URL provided, wrong bucket: ' + bucket);
    }
    // remove URL search params
    return keyParts.join('/').replace(/\?.+$/, '');
  }
}
