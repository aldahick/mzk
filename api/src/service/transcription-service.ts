import { Transcription, TranscriptionStatus } from "../types/transcription";
import { GoogleStorageService } from "./google-storage-service";
import { OmnizartService } from "./omnizart-service";

const ONE_HOUR_MS = 1000 * 60 * 60;

export class TranscriptionService {
  constructor(
    private googleStorage = new GoogleStorageService()
  ) { }

  async create(transcriptionId: string, label: string): Promise<Transcription> {
    const uploadPath = this.makeUploadStoragePath(transcriptionId);
    if (!await this.googleStorage.exists(uploadPath)) {
      throw new Error('Attempted to start missing transcription ID ' + transcriptionId)
    }
    const transcription: Transcription = {
      id: transcriptionId,
      status: TranscriptionStatus.Queued,
      label
    };
    const metadataPath = this.makeMetadataStoragePath(transcriptionId);
    await this.googleStorage.write(metadataPath, JSON.stringify(transcription));
    return transcription;
  }

  async start(transcription: Transcription): Promise<void> {
    console.log('starting', transcription);

    const omnizartService = new OmnizartService();
    const metadataStoragePath = this.makeMetadataStoragePath(transcription.id);
    const uploadStoragePath = this.makeUploadStoragePath(transcription.id);
    const midiStoragePath = this.makeMidiStoragePath(transcription.id);
    try {
      await omnizartService.startTranscription(metadataStoragePath, uploadStoragePath, midiStoragePath);
      await this.updateStatus(transcription.id, TranscriptionStatus.Running);
    } catch (err: unknown) {
      await this.updateStatus(transcription.id, TranscriptionStatus.Errored);
      throw err;
    }
  }

  async get(id: string): Promise<Transcription> {
    const metadataKey = this.makeMetadataStoragePath(id);
    const buffer = await this.googleStorage.getContents(metadataKey);
    const transcription: Transcription = JSON.parse(buffer.toString());
    if (transcription.status === TranscriptionStatus.Success) {
      const midiPath = this.makeMidiStoragePath(transcription.id);
      const midiUrl = await this.googleStorage.getSignedUrl(midiPath, {
        expires: new Date(Date.now() + ONE_HOUR_MS),
        action: 'read'
      });
      (transcription as any).midiUrl = midiUrl;
    }
    return transcription;
  }

  async updateStatus(id: string, newStatus: TranscriptionStatus): Promise<void> {
    const metadataPath = this.makeMetadataStoragePath(id);
    const transcription = await this.get(id);
    transcription.status = newStatus;
    await this.googleStorage.write(metadataPath, JSON.stringify(transcription));
  }

  makeMetadataStoragePath(id: string): string {
    return `metadata/${id}.json`;
  }

  makeMidiStoragePath(id: string): string {
    return `midi/${id}.mid`;
  }

  makeUploadStoragePath(id: string): string {
    return `uploads/${id}.mp3`;
  }
}
