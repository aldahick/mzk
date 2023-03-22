import { IncomingMessage, ServerResponse } from "http";

export type RequestHandler = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>;
