// types.d.ts
declare module 'bcryptjs';
declare module 'nodemailer';
declare module 'mailgen';

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        // autres propriétés si nécessaire
      };
    }
  }
}
