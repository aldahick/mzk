import { randomUUID } from "crypto";
import { httpUtil } from "../http";
import { GoogleStorageService } from "../service/google-storage-service";
import { RequestHandler } from "../types/http";

/** fifteen minutes from now - these are small uploads */
const EXPIRES_IN_MS = 15 * 60 * 1000;
const getExpires = (): Date => new Date(Date.now() + EXPIRES_IN_MS);

export const getUploadUrl: RequestHandler = async (req, res) => {
  const googleStorage = new GoogleStorageService();
  const filename = randomUUID();
  const expires = getExpires();
  const uploadUrl = await googleStorage.getUploadUrl(filename, expires);
  await httpUtil.writeRes(res, { uploadUrl });
};
