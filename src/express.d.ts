import { Request as ExpressRequest } from 'express';
declare module 'express' {
  interface Request extends ExpressRequest {
    /** authorized client by auth.guard.ts */
    client: {
      /** client cid */
      cid: string;
      /** client access_id */
      access_id: string;
    };
  }
}
