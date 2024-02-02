import express, { Request, Response, NextFunction } from "express";
import authController from "../controllers/auth.controller.js";

const router = express();

router.post(
  "/start-sign-up",
  (req: Request, res: Response, next: NextFunction) =>
    authController.startSignUp(req, res, next)
);

router.post(
  "/finish-sign-up",
  (req: Request, res: Response, next: NextFunction) =>
    authController.finishSignUp(req, res, next)
);

router.post("/sign-in", (req: Request, res: Response, next: NextFunction) =>
  authController.signIn(req, res, next)
);

router.post("/google-auth", (req: Request, res: Response, next: NextFunction) =>
  authController.googleAuth(req, res, next)
);

router.post(
  "/send-recovery-code",
  (req: Request, res: Response, next: NextFunction) =>
    authController.sendRecoveryCode(req, res, next)
);

router.post(
  "/verify-and-change-password",
  (req: Request, res: Response, next: NextFunction) =>
    authController.verifyCodeAndChangePassword(req, res, next)
);

export default router;
