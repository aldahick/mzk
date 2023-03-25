import { randomUUID } from "crypto";
import { httpUtil } from "../http";
import { GoogleStorageService } from "../service/google-storage-service";
import { TranscriptionService } from "../service/transcription-service";
import { RequestHandler } from "../types/http";

/** fifteen minutes from now - these are small uploads */
const EXPIRES_IN_MS = 15 * 60 * 1000;
const getExpires = (): Date => new Date(Date.now() + EXPIRES_IN_MS);

export const getUploadUrl: RequestHandler = async (req, res) => {
  const googleStorage = new GoogleStorageService();
  const transcriptionService = new TranscriptionService();
  const transcriptionId = randomUUID();
  const filename = transcriptionService.makeUploadStoragePath(transcriptionId);
  const expires = getExpires();
  const uploadUrl = await googleStorage.getSignedUrl(filename, { expires, action: 'write', contentType: 'audio/mpeg' });
  await httpUtil.writeRes(res, { transcriptionId, uploadUrl });
};
