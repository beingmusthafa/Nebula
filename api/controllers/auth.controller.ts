import { Request, Response, NextFunction } from "express";
import authServiceInstance from "../services/auth.service.js";
import customError from "../utils/error.js";
import IAuthService from "../interfaces/service.interfaces/auth.service.interface.js";

class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async startSignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.startSignUp(req.body);
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async finishSignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { userDetails, code } = req.body;
      const response = await this.authService.finishSignUp(
        userDetails,
        Number(code)
      );
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.json({ success: true, user: response.doc, token: response.token });
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.signIn(req.body);
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.json({ success: true, user: response.doc, token: response.token });
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.googleAuth(req.body);
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.json({ success: true, user: response.doc, token: response.token });
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async sendRecoveryCode(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.sendRecoveryCode(req.body.email);
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async resendCode(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.authService.resendCode(req.body.email, true);
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async verifyCodeAndChangePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, code, password } = req.body;
      const response = await this.authService.verifyCodeAndChangePassword(
        email,
        Number(code),
        password
      );
      if (!response.success) {
        return next(customError(response.statusCode, response.message));
      }
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction) {
    try {
      req.session.destroy();
      res.status(200).json({
        success: true,
        message: "user successfully logged out",
        statusCode: 200,
      });
    } catch (error) {
      next(customError(500, error.message));
    }
  }
}

export default new AuthController(authServiceInstance);
