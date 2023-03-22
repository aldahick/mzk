import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from "http";

export const httpUtil = {
  getJsonBody: <T>(req: IncomingMessage): Promise<T> => {
    if (req.method !== 'POST') {
      throw new Error('This endpoint requires POST');
    }
    return new Promise<T>((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('error', reject);
      req.on('end', () => resolve(JSON.parse(body)));
    })
  },
  writeRes: async (res: ServerResponse<IncomingMessage>, data: unknown, headers: OutgoingHttpHeaders = {}, status = 200): Promise<void> => {
    headers["Content-Type"] = "application/json";
    res.writeHead(status, undefined, headers);
    await new Promise<void>((resolve, reject) => res.write(JSON.stringify(data), err => err ? reject(err) : resolve()));
    await new Promise<void>(resolve => res.writableEnded ? undefined : res.end(resolve));
  }
};
