import { randomUUID } from "crypto";
import { Transcription, TranscriptionStatus } from "../types/transcription";
import { GoogleStorageService } from "./google-storage-service";

export class TranscriptionService {
  constructor(
    private googleStorageService: GoogleStorageService
  ) { }

  async create(label: string, audioUrl: string): Promise<Transcription> {
    const audioKey = this.googleStorageService.makeKey(audioUrl);
    const transcription: Transcription = {
      id: randomUUID(),
      status: TranscriptionStatus.Queued,
      label,
      audioKey
    };
    const metadataJson = JSON.stringify(transcription, undefined, 2);
    const metadataKey = this.makeMetadataKey(transcription.id);
    await this.googleStorageService.write(metadataKey, metadataJson);
    return transcription;
  }

  async start(transcription: Transcription): Promise<void> {
    console.log('starting', transcription);
    // TODO cloud run stuff, i guess?
  }

  async get(id: string): Promise<Transcription> {
    const metadataKey = this.makeMetadataKey(id);
    const buffer = await this.googleStorageService.getContents(metadataKey);
    const metadata: Transcription = JSON.parse(buffer.toString());
    return metadata;
  }

  makeMetadataKey(id: string): string {
    return `transcriptions/${id}.json`;
  }

  static make(): TranscriptionService {
    return new TranscriptionService(new GoogleStorageService());
  }
}
