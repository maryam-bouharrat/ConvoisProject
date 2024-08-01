import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ENV from '../config';
import otpGenerator from 'otp-generator';

interface DecodedToken {
  userId: number;
  username: string;
  // autres propriétés si nécessaire
}

// Middleware pour vérifier l'utilisateur
export async function verifyUser(req: Request, res: Response, next: Function) {
    try {
        const { username } = req.method === "GET" ? req.query : req.body;

        const user = await getRepository(User).findOne({ where: { username } });
        if (!user) return res.status(404).send({ error: "Utilisateur non trouvé!" });
        next();
    } catch (error) {
        return res.status(500).send({ error: "Erreur d'authentification" });
    }
}

// POST: http://localhost:8080/api/register
export async function register(req: Request, res: Response) {
    try {
        const { username, password, email, firstName, lastName, mobile, address, profile } = req.body;

        const userRepository = getRepository(User);

        const existUsername = await userRepository.findOne({ where: { username } });
        const existEmail = await userRepository.findOne({ where: { email } });
        
        if (existUsername) return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
        if (existEmail) return res.status(400).json({ error: "Email déjà utilisé" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userRepository.create({
            username,
            password: hashedPassword,
            profile: profile || '',
            email,
            firstName,
            lastName,
            mobile,
            address
        });

        await userRepository.save(newUser);

        res.status(201).send({ msg: "Utilisateur enregistré avec succès", user: newUser });
    } catch (error: unknown) {
        res.status(500).send({ error: (error as Error).message || "Une erreur est survenue lors de l'enregistrement" });
    }
}

// POST: http://localhost:8080/api/login
export async function login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { username } });
        if (!user) return res.status(404).send({ error: "Nom d'utilisateur non trouvé" });

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.status(400).send({ error: "Mot de passe incorrect" });

        const token = jwt.sign({ userId: user.id, username: user.username }, ENV.JWT_SECRET, { expiresIn: "24h" });

        return res.status(200).send({ msg: "Connexion réussie!", username: user.username, token });
    } catch (error: unknown) {
        res.status(500).send({ error: (error as Error).message || "Une erreur est survenue lors de la connexion" });
    }
}

// GET: http://localhost:8080/api/user/:username
export async function getUser(req: Request, res: Response) {
    const { username } = req.params;

    try {
        const userRepository = getRepository(User);
        if (!username) return res.status(400).send({ error: "Nom d'utilisateur invalide" });

        const user = await userRepository.findOne({ where: { username } });
        if (!user) return res.status(404).send({ error: "Utilisateur non trouvé" });

        const { password, ...rest } = user;
        return res.status(200).send(rest);
    } catch (error: unknown) {
        return res.status(500).send({ error: (error as Error).message || "Impossible de récupérer les données de l'utilisateur" });
    }
}

// PUT: http://localhost:8080/api/updateuser
export async function updateUser(req: Request, res: Response) {
    try {
        const { userId } = req.user as { userId: number };

        if (userId) {
            const userRepository = getRepository(User);
            await userRepository.update(userId, req.body);
            return res.status(200).send({ msg: "Informations mises à jour avec succès" });
        } else {
            return res.status(401).send({ error: "Utilisateur non trouvé!" });
        }
    } catch (error: unknown) {
        return res.status(500).send({ error: (error as Error).message });
    }
}

// POST: http://localhost:8080/api/generateOTP
export async function generateOTP(req: Request, res: Response) {
    req.app.locals.OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP });
}

// GET: http://localhost:8080/api/verifyOTP
export async function verifyOTP(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).send({ error: "Code invalide" });
    }

    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).send({ msg: 'Vérification réussie!' });
    }
    return res.status(400).send({ error: "OTP invalide" });
}

// GET: http://localhost:8080/api/createResetSession
export async function createResetSession(req: Request, res: Response) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag: req.app.locals.resetSession });
    }
    return res.status(440).send({ error: "Session expirée!" });
}

// PUT: http://localhost:8080/api/resetPassword
export async function resetPassword(req: Request, res: Response) {
    try {
        if (!req.app.locals.resetSession) {
            return res.status(440).send({ error: "Session expirée!" });
        }

        const { username, password } = req.body;

        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { username } });
        if (!user) return res.status(404).send({ error: "Nom d'utilisateur non trouvé" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await userRepository.update(user.id, { password: hashedPassword });

        req.app.locals.resetSession = false;
        return res.status(200).send({ msg: "Mot de passe mis à jour avec succès!" });
    } catch (error: unknown) {
        return res.status(500).send({ error: (error as Error).message });
    }
}
