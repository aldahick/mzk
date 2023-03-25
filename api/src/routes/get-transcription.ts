import { httpUtil } from "../http";
import { TranscriptionService } from "../service/transcription-service";
import { RequestHandler } from "../types/http";

export const getTranscription: RequestHandler = async (req, res) => {
  const id = req.url?.slice('/transcription/'.length);
  if (!id) {
    throw new Error('Missing required path parameter "id"');
  }
  const transcriptionService = new TranscriptionService();
  const transcription = await transcriptionService.get(id);
  await httpUtil.writeRes(res, transcription);
}
