import { Router, Request, Response } from "express";
import * as controller from '../controllers/appController';
import { registerMail } from '../services/mailer';
import Auth, { localVariables } from '../middleware/auth';

const router = Router();

/** POST Methods */
router.post('/register', controller.register);
router.post('/registerMail', registerMail);
router.post('/authenticate', controller.verifyUser, (req: Request, res: Response) => res.end());
router.post('/login', controller.verifyUser, controller.login);

/** GET Methods */
router.get('/user/:username', controller.getUser);
router.get('/generateOTP', controller.verifyUser, localVariables, controller.generateOTP);
router.get('/verifyOTP', controller.verifyUser, controller.verifyOTP);
router.get('/createResetSession', controller.createResetSession);

/** PUT Methods */
router.put('/updateuser', Auth, controller.updateUser);
router.put('/resetPassword', controller.verifyUser, controller.resetPassword);

export default router;
