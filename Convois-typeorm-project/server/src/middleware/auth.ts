import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ENV from '../config'; // Assurez-vous que le chemin est correct et que config exporte bien JWT_SECRET

interface DecodedToken {
  userId: number;
  username: string;
  // ajoutez d'autres propriétés si nécessaire
}

export default async function Auth(req: Request, res: Response, next: NextFunction) {
    try {
        // Accéder à l'en-tête Authorization pour valider la requête
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }
        const token = authHeader.split(" ")[1];

        // Récupérer les détails de l'utilisateur connecté
        const decodedToken = jwt.verify(token, ENV.JWT_SECRET) as DecodedToken;

        req.user = decodedToken; // Attach decoded token to req.user
        next();

    } catch (error) {
        res.status(401).json({ error: "Authentication Failed!" });
    }
}

export function localVariables(req: Request, res: Response, next: NextFunction) {
    req.app.locals = {
        OTP: null,
        resetSession: false
    };
    next();
}
