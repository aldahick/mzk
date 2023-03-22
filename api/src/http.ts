import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from "http";

export const httpUtil = {
  writeRes: async (res: ServerResponse<IncomingMessage>, data: unknown, headers: OutgoingHttpHeaders = {}, status = 200): Promise<void> => {
    headers["Content-Type"] = "application/json";
    res.writeHead(status, undefined, headers);
    await new Promise<void>((resolve, reject) => res.write(JSON.stringify(data), err => err ? reject(err) : resolve()));
    await new Promise<void>(resolve => res.end(resolve));
  }
};
