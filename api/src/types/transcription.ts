export interface Transcription {
  id: string;
  status: TranscriptionStatus;
  label: string;
}

export enum TranscriptionStatus {
  Success = 'success',
  Errored = 'errored',
  Running = 'running',
  Queued = 'queued'
}
