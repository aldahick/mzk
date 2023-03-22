import * as http from "http";
import { config } from "./config";
import { httpUtil } from "./http";
import { getTranscription } from "./routes/get-transcription";
import { startTranscription } from "./routes/start-transcription";
import { getUploadUrl } from "./routes/upload-url";
import { RequestHandler } from "./types";

const main = () => {
  const httpServer = http.createServer((req, res) => {
    let handler: RequestHandler;
    if (req.url === "/upload-url" && req.method === "GET") {
      handler = getUploadUrl;
    } else if (req.url === "/transcription" && req.method === "POST") {
      handler = startTranscription;
    } else if (req.url?.startsWith("/transcription/") && req.method === "GET") {
      handler = getTranscription;
    } else {
      handler = (req, res) => httpUtil.writeRes(res, { error: 'Not found' }, undefined, 404);
    }
    handler(req, res).catch(err => {
      console.error('uncaught error', req.url, err);
      return httpUtil.writeRes(res, { error: (err as Error).message }, undefined, 500);
    });
  });
  process.on('exit', () => {
    httpServer.close();
  });
  httpServer.listen(config.port);
  console.log('listening on port', config.port);
};

main();
