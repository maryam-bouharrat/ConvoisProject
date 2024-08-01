import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import ENV from '../config'; // Assurez-vous que le chemin est correct et que config exporte les variables correctement
import { Request, Response } from 'express';

interface EnvConfig {
  GMAIL_USER: string;
  GMAIL_PASS: string;
}

const nodeConfig = {
  service: 'gmail',
  auth: {
    user: ENV.GMAIL_USER as string, // votre adresse Gmail
    pass: ENV.GMAIL_PASS as string, // votre mot de passe Gmail ou mot de passe d'application
  }
};

const transporter = nodemailer.createTransport(nodeConfig);

const MailGenerator = new Mailgen({
  theme: "default",
  product : {
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
export const registerMail = async (req: Request, res: Response) => {
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
    from: ENV.GMAIL_USER,
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
}
