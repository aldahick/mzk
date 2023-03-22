export interface Transcription {
  id: string;
  status: TranscriptionStatus;
  label: string;
  /**
   * key of an audio file _in the default Storage bucket_
   */
  audioKey: string;
}

export enum TranscriptionStatus {
  Success = 'success',
  Errored = 'errored',
  Running = 'running',
  Queued = 'queued'
}
