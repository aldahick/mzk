import { JobsClient } from '@google-cloud/run';
import { config } from '../config';

export class GoogleCloudRunService {
  readonly jobs = new JobsClient({
    projectId: config.google.projectId,
    keyFilename: config.google.credentialsPath
  });

  /**
   * Jobs are paramless on execution, but for simplicity's sake (avoiding major state management),
   *   we create jobs with params, immediately execute them, and thnen delete the job.
   */
  async createAndRun(params: CreateJobParams): Promise<void> {
    const { name } = params;
    await this.createJob(params);
    await this.runJob(name);
    await this.deleteJob(name);
  }

  async createJob({ name, image, args, env = [] }: CreateJobParams): Promise<void> {
    console.log('creating job', name);
    const [operation] = await this.jobs.createJob({
      job: {
        name,
        template: {
          template: {
            containers: [{
              args,
              image,
              env,
            }]
          }
        }
      }
    });
    await operation.promise();
    console.log('created job', name);
  }

  async runJob(name: string): Promise<void> {
    console.log('running job', name);
    const [operation] = await this.jobs.runJob({ name });
    const [execution] = await operation.promise();
    console.log('ran job', name);
  }

  async deleteJob(name: string): Promise<void> {
    console.log('deleting job', name);
    const [operation] = await this.jobs.deleteJob({ name });
    await operation.promise();
    console.log('deleted job', name);
  }
}

export interface CreateJobParams {
  name: string;
  image: string;
  args: string[];
  env?: { name: string; value: string }[];
}
