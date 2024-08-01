"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller = __importStar(require("../controllers/appController"));
const mailer_1 = require("../services/mailer");
const auth_1 = __importStar(require("../middleware/auth"));
const router = (0, express_1.Router)();
/** POST Methods */
router.post('/register', controller.register);
router.post('/registerMail', mailer_1.registerMail);
router.post('/authenticate', controller.verifyUser, (req, res) => res.end());
router.post('/login', controller.verifyUser, controller.login);
/** GET Methods */
router.get('/user/:username', controller.getUser);
router.get('/generateOTP', controller.verifyUser, auth_1.localVariables, controller.generateOTP);
router.get('/verifyOTP', controller.verifyUser, controller.verifyOTP);
router.get('/createResetSession', controller.createResetSession);
/** PUT Methods */
router.put('/updateuser', auth_1.default, controller.updateUser);
router.put('/resetPassword', controller.verifyUser, controller.resetPassword);
exports.default = router;
//# sourceMappingURL=route.js.map