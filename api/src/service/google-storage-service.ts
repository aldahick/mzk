import { Bucket, Storage } from '@google-cloud/storage'
import { config } from '../config';

const defaultBucket = config.google.bucketName;

/**
 * Wrapper for Google Cloud Storage
 */
export class GoogleStorageService {
  readonly client = new Storage({
    projectId: config.google.projectId,
    keyFilename: config.google.credentialsPath
  });

  async exists(path: string): Promise<boolean> {
    const bucket = this.getDefaultBucket();
    const [exists] = await bucket.file(path).exists();
    return exists;
  }

  async write(path: string, body: string | Buffer): Promise<void> {
    const bucket = this.getDefaultBucket();
    await bucket.file(path).save(body);
  }

  async getContents(path: string): Promise<Buffer> {
    const bucket = this.getDefaultBucket();
    const [contents] = await bucket.file(path).download();
    return contents;
  }

  async getContentsJson<T>(path: string): Promise<T> {
    const contents = await this.getContents(path);
    return JSON.parse(contents.toString('utf8'));
  }

  async getSignedUrl(path: string, options: {
    expires: Date;
    action: 'write' | 'read';
    contentType?: string
  }): Promise<string> {
    const bucket = this.getDefaultBucket();
    const res = await bucket.file(path).getSignedUrl(options);
    const [uploadUrl] = res;
    return uploadUrl;
  }

  /**
   * Returns the single bucket used for user audio uploads
   * Creates the bucket if it doesn't exist
  */
  getDefaultBucket(): Bucket {
    return this.client.bucket(defaultBucket);
  }

  /**
   * Strips everything but the object path from a Storage URL
   */
  makeKey(url: string): string {
    console.log('making key', url);
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
