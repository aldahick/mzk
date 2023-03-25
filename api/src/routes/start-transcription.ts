import { httpUtil } from "../http";
import { TranscriptionService } from "../service/transcription-service";
import { RequestHandler } from "../types/http";
import { Transcription } from "../types/transcription";

export interface StartTranscriptionRequest {
  label: string;
  transcriptionId: string;
}
export type StartTranscriptionResponse = Transcription;

export const startTranscription: RequestHandler = async (req, res) => {
  const transcriptionService = new TranscriptionService();

  const { label, transcriptionId } = await httpUtil.getJsonBody<StartTranscriptionRequest>(req);
  const transcription = await transcriptionService.create(transcriptionId, label);
  await transcriptionService.start(transcription);
  await httpUtil.writeRes(res, transcription);
};
