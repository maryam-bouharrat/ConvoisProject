"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.createResetSession = exports.verifyOTP = exports.generateOTP = exports.updateUser = exports.getUser = exports.login = exports.register = exports.verifyUser = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../entities/User.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const otp_generator_1 = __importDefault(require("otp-generator"));
// Middleware pour vérifier l'utilisateur
function verifyUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username } = req.method === "GET" ? req.query : req.body;
            const user = yield (0, typeorm_1.getRepository)(User_entity_1.User).findOne({ where: { username } });
            if (!user)
                return res.status(404).send({ error: "Utilisateur non trouvé!" });
            next();
        }
        catch (error) {
            return res.status(500).send({ error: "Erreur d'authentification" });
        }
    });
}
exports.verifyUser = verifyUser;
// POST: http://localhost:8080/api/register
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password, email, firstName, lastName, mobile, address, profile } = req.body;
            const userRepository = (0, typeorm_1.getRepository)(User_entity_1.User);
            const existUsername = yield userRepository.findOne({ where: { username } });
            const existEmail = yield userRepository.findOne({ where: { email } });
            if (existUsername)
                return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
            if (existEmail)
                return res.status(400).json({ error: "Email déjà utilisé" });
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
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
            yield userRepository.save(newUser);
            res.status(201).send({ msg: "Utilisateur enregistré avec succès", user: newUser });
        }
        catch (error) {
            res.status(500).send({ error: error.message || "Une erreur est survenue lors de l'enregistrement" });
        }
    });
}
exports.register = register;
// POST: http://localhost:8080/api/login
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        try {
            const userRepository = (0, typeorm_1.getRepository)(User_entity_1.User);
            const user = yield userRepository.findOne({ where: { username } });
            if (!user)
                return res.status(404).send({ error: "Nom d'utilisateur non trouvé" });
            const passwordCheck = yield bcryptjs_1.default.compare(password, user.password);
            if (!passwordCheck)
                return res.status(400).send({ error: "Mot de passe incorrect" });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, config_1.default.JWT_SECRET, { expiresIn: "24h" });
            return res.status(200).send({ msg: "Connexion réussie!", username: user.username, token });
        }
        catch (error) {
            res.status(500).send({ error: error.message || "Une erreur est survenue lors de la connexion" });
        }
    });
}
exports.login = login;
// GET: http://localhost:8080/api/user/:username
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.params;
        try {
            const userRepository = (0, typeorm_1.getRepository)(User_entity_1.User);
            if (!username)
                return res.status(400).send({ error: "Nom d'utilisateur invalide" });
            const user = yield userRepository.findOne({ where: { username } });
            if (!user)
                return res.status(404).send({ error: "Utilisateur non trouvé" });
            const { password } = user, rest = __rest(user, ["password"]);
            return res.status(200).send(rest);
        }
        catch (error) {
            return res.status(500).send({ error: error.message || "Impossible de récupérer les données de l'utilisateur" });
        }
    });
}
exports.getUser = getUser;
// PUT: http://localhost:8080/api/updateuser
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.user;
            if (userId) {
                const userRepository = (0, typeorm_1.getRepository)(User_entity_1.User);
                yield userRepository.update(userId, req.body);
                return res.status(200).send({ msg: "Informations mises à jour avec succès" });
            }
            else {
                return res.status(401).send({ error: "Utilisateur non trouvé!" });
            }
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
}
exports.updateUser = updateUser;
// POST: http://localhost:8080/api/generateOTP
function generateOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        req.app.locals.OTP = otp_generator_1.default.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        res.status(201).send({ code: req.app.locals.OTP });
    });
}
exports.generateOTP = generateOTP;
// GET: http://localhost:8080/api/verifyOTP
function verifyOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query.code;
        if (!code) {
            return res.status(400).send({ error: "Code invalide" });
        }
        if (parseInt(req.app.locals.OTP) === parseInt(code)) {
            req.app.locals.OTP = null;
            req.app.locals.resetSession = true;
            return res.status(201).send({ msg: 'Vérification réussie!' });
        }
        return res.status(400).send({ error: "OTP invalide" });
    });
}
exports.verifyOTP = verifyOTP;
// GET: http://localhost:8080/api/createResetSession
function createResetSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.app.locals.resetSession) {
            return res.status(201).send({ flag: req.app.locals.resetSession });
        }
        return res.status(440).send({ error: "Session expirée!" });
    });
}
exports.createResetSession = createResetSession;
// PUT: http://localhost:8080/api/resetPassword
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.app.locals.resetSession) {
                return res.status(440).send({ error: "Session expirée!" });
            }
            const { username, password } = req.body;
            const userRepository = (0, typeorm_1.getRepository)(User_entity_1.User);
            const user = yield userRepository.findOne({ where: { username } });
            if (!user)
                return res.status(404).send({ error: "Nom d'utilisateur non trouvé" });
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            yield userRepository.update(user.id, { password: hashedPassword });
            req.app.locals.resetSession = false;
            return res.status(200).send({ msg: "Mot de passe mis à jour avec succès!" });
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
}
exports.resetPassword = resetPassword;
//# sourceMappingURL=appController.js.map