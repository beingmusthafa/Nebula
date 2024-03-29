import { Request, Response, NextFunction } from "express";
import bannerServiceInstance from "../../services/banners.service.js";
import customError from "../../utils/error.js";
import IBannersService from "../../interfaces/service.interfaces/banners.service.interface.js";

class AdminBannersController {
  private bannersService: IBannersService;
  constructor(bannersService: IBannersService) {
    this.bannersService = bannersService;
  }

  async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.bannersService.getBanners(true);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async addBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { link } = req.body;
      const response = await this.bannersService.addBanner(
        req.file?.buffer,
        link
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async editBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const { link } = req.body;
      const response = await this.bannersService.editBanner(bannerId, {
        image: req.file?.buffer,
        link,
      });
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const response = await this.bannersService.deleteBanner(bannerId);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async enableBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const response = await this.bannersService.toggleBanner(
        bannerId,
        "enable"
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }
  async disableBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const { bannerId } = req.params;
      const response = await this.bannersService.toggleBanner(
        bannerId,
        "disable"
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }
}

export default new AdminBannersController(bannerServiceInstance);
