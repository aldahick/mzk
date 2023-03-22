import { httpUtil } from "../http";
import { TranscriptionService } from "../service/transcription-service";
import { RequestHandler } from "../types/http";
import { Transcription } from "../types/transcription";

export interface StartTranscriptionRequest {
  label: string;
  url: string;
}
export type StartTranscriptionResponse = Omit<Transcription, 'audioUrl'>;

export const startTranscription: RequestHandler = async (req, res) => {
  const transcriptionService = TranscriptionService.make();

  const { label, url: audioUrl } = await httpUtil.getJsonBody<StartTranscriptionRequest>(req);
  let transcription = await transcriptionService.create(label, audioUrl);
  await transcriptionService.start(transcription);
  await httpUtil.writeRes(res, transcription);
};
