import { httpUtil } from "../http";
import { RequestHandler } from "../types";

export const getUploadUrl: RequestHandler = async (req, res) => {
  const uploadUrl = 'foo'
  await httpUtil.writeRes(res, { uploadUrl });
};
