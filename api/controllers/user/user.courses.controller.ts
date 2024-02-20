import { Request, Response, NextFunction } from "express";
import customError from "../../utils/error.js";
import coursesServiceInstance, {
  CoursesService,
} from "../../services/courses.service.js";
import categoriesServiceInstance, {
  CategoriesService,
} from "../../services/categories.service.js";
import chaptersServiceInstance, {
  ChaptersService,
} from "../../services/chapters.service.js";
import bannersServiceInstance, {
  BannersService,
} from "../../services/banners.service.js";

class UserCoursesController {
  private coursesService: CoursesService;
  private categoriesService: CategoriesService;
  private chaptersService: ChaptersService;
  private bannersService: BannersService;
  constructor(
    coursesService: CoursesService,
    categoriesService: CategoriesService,
    chaptersService: ChaptersService,
    bannersService: BannersService
  ) {
    this.coursesService = coursesService;
    this.categoriesService = categoriesService;
    this.chaptersService = chaptersService;
    this.bannersService = bannersService;
  }

  async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { results } = await this.coursesService.findByMultipleCategories(
        req.user?.interests
      );
      const response = await this.bannersService.getBanners();
      res
        .status(response.statusCode)
        .json({ ...response, categories: results });
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async searchCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, search, minPrice, maxPrice, category, language, sort } =
        req.query;
      console.log({
        search,
        page,
        minPrice,
        maxPrice,
        category,
        language,
        sort,
      });
      const response = await this.coursesService.findPaginate(
        Number(page) || 1,
        req.user?._id,
        {
          search: search as string,
          minPrice: Number(minPrice) || 0,
          maxPrice: Number(maxPrice) || Infinity,
          category: category as string,
          language: language as string,
          sort: sort as string,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await this.coursesService.findById(id);
      const { chapters } = await this.chaptersService.getByCourse(id);
      console.log({ chapters });
      res.status(response.statusCode).json({ ...response, chapters });
    } catch (error) {
      next(customError(500, error.message));
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.categoriesService.getAll();
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(customError(500, error.message));
    }
  }
}

export default new UserCoursesController(
  coursesServiceInstance,
  categoriesServiceInstance,
  chaptersServiceInstance,
  bannersServiceInstance
);
