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
exports.registerMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailgen_1 = __importDefault(require("mailgen"));
const config_1 = __importDefault(require("../config")); // Assurez-vous que le chemin est correct et que config exporte les variables correctement
const nodeConfig = {
    service: 'gmail',
    auth: {
        user: config_1.default.GMAIL_USER,
        pass: config_1.default.GMAIL_PASS, // votre mot de passe Gmail ou mot de passe d'application
    }
};
const transporter = nodemailer_1.default.createTransport(nodeConfig);
const MailGenerator = new mailgen_1.default({
    theme: "default",
    product: {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
});
/** POST: http://localhost:8080/api/registerMail
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
const registerMail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userEmail, text, subject } = req.body;
    // corps de l'email
    const email = {
        body: {
            name: username,
            intro: text || 'Welcome to our service! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    const emailBody = MailGenerator.generate(email);
    const message = {
        from: config_1.default.GMAIL_USER,
        to: userEmail,
        subject: subject || "Signup Successful",
        html: emailBody
    };
    // envoyer le mail
    transporter.sendMail(message)
        .then(() => {
        return res.status(200).send({ msg: "You should receive an email from us." });
    })
        .catch(error => res.status(500).send({ error: error.message }));
});
exports.registerMail = registerMail;
//# sourceMappingURL=mailer.js.map