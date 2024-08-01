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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localVariables = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config")); // Assurez-vous que le chemin est correct et que config exporte bien JWT_SECRET
function Auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Accéder à l'en-tête Authorization pour valider la requête
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: "No token provided" });
            }
            const token = authHeader.split(" ")[1];
            // Récupérer les détails de l'utilisateur connecté
            const decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
            req.user = decodedToken; // Attach decoded token to req.user
            next();
        }
        catch (error) {
            res.status(401).json({ error: "Authentication Failed!" });
        }
    });
}
exports.default = Auth;
function localVariables(req, res, next) {
    req.app.locals = {
        OTP: null,
        resetSession: false
    };
    next();
}
exports.localVariables = localVariables;
//# sourceMappingURL=auth.js.map