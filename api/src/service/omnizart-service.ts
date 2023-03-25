import { spawn } from "child_process";
import { createHash } from "crypto";
import * as path from 'path';
import { config } from "../config";
import { GoogleCloudRunService } from "./google-cloud-run-service";

export class OmnizartService {
  constructor(
    private readonly googleCloudRun = new GoogleCloudRunService()
  ) { }

  async startTranscription(metadataPath: string, audioStoragePath: string, midiStoragePath: string): Promise<void> {
    const args = [metadataPath, audioStoragePath, midiStoragePath];
    if (config.omnizart.runnerPath) {
      await this.transcribeLocal(args);
    } else {
      await this.transcribeCloud(args);
    }
  }

  private async transcribeLocal(args: string[]): Promise<void> {
    const scriptPath = path.resolve(process.cwd(), config.omnizart.runnerPath ?? '../omnizart-runner', 'main.py')
    const credentialsPath = path.resolve(process.cwd(), config.google.credentialsPath);
    console.log(scriptPath, args);
    const proc = spawn('python', [scriptPath, ...args], {
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: credentialsPath,
        GOOGLE_STORAGE_BUCKET_NAME: config.google.bucketName
      }
    });
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  }

  private async transcribeCloud(args: string[]): Promise<void> {
    const jobSuffix = createHash('md5').update(JSON.stringify(args)).digest('hex');
    await this.googleCloudRun.createAndRun({
      name: 'mzk-transcribe-' + jobSuffix,
      image: 'aldahick/omnizart-runner',
      args,
      env: [{
        name: 'GOOGLE_STORAGE_BUCKET_NAME',
        value: config.google.bucketName
      }]
    })
  }
}
