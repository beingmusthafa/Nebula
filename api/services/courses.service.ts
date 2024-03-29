import DatabaseId from "../types/databaseId.type.js";

import coursesRepositoryInstance from "../repositories/courses.repository.js";
import progressRepositoryInstance from "../repositories/progress.repository.js";
import ICourses from "../interfaces/courses.interface.js";
import ServiceResponse from "../types/serviceresponse.type.js";
import PaginationResult from "../types/PaginationResult.js";
import { resizeImage } from "../utils/cropper.js";
import { uploadtoCloudinary } from "../utils/parser.js";
import categoriesRepositoryInstance from "../repositories/categories.repository.js";
import chaptersRepositoryInstance from "../repositories/chapters.repository.js";
import videosRepositoryInstance from "../repositories/videos.repository.js";
import exercisesRepositoryInstance from "../repositories/exercises.repository.js";
import enrollmentsRepositoryInstance from "../repositories/enrollments.repository.js";
import { v2 as cloudinary } from "cloudinary";
import ICurrentUser from "../interfaces/currentUser.interface.js";
import ICoursesService from "../interfaces/service.interfaces/courses.service.interface.js";
import ICoursesRepository from "../interfaces/repository.interfaces/courses.repository.interface.js";
import ICategoriesRepository from "../interfaces/repository.interfaces/categories.repository.interface.js";
import IChaptersRepository from "../interfaces/repository.interfaces/chapters.repository.interface.js";
import IVideosRepository from "../interfaces/repository.interfaces/videos.repository.interface.js";
import IExercisesRepository from "../interfaces/repository.interfaces/exercises.repository.interface.js";
import IEnrollmentsRepository from "../interfaces/repository.interfaces/enrollments.repository.interface.js";
import IProgressRepository from "../interfaces/repository.interfaces/progress.repository.interface.js";

export class CoursesService implements ICoursesService {
  private coursesRepository: ICoursesRepository;
  private categoriesRepository: ICategoriesRepository;
  private chaptersRepository: IChaptersRepository;
  private videosRepository: IVideosRepository;
  private exercisesRepository: IExercisesRepository;
  private enrollmentsRepository: IEnrollmentsRepository;
  private progressRepository: IProgressRepository;
  constructor(
    coursesRepository: ICoursesRepository,
    categoriesRepository: ICategoriesRepository,
    chaptersRepository: IChaptersRepository,
    videosRepository: IVideosRepository,
    exercisesRepository: IExercisesRepository,
    enrollmentsRepository: IEnrollmentsRepository,
    progressRepository: IProgressRepository
  ) {
    this.coursesRepository = coursesRepository;
    this.categoriesRepository = categoriesRepository;
    this.chaptersRepository = chaptersRepository;
    this.videosRepository = videosRepository;
    this.exercisesRepository = exercisesRepository;
    this.enrollmentsRepository = enrollmentsRepository;
    this.progressRepository = progressRepository;
  }

  async findByMultipleCategories(
    userData?: ICurrentUser
  ): ServiceResponse<{ results: object[] }> {
    try {
      let categoryFilter: { _id?: object } = {};
      let coursesFilter: { _id?: object; status?: "published" } = {};
      if (userData) {
        categoryFilter = {
          _id: { $in: userData.interests },
        };
        const purchasedCourses = await this.enrollmentsRepository.find(
          { user: userData._id },
          { projection: "course" }
        );
        const createdCourses = await this.coursesRepository.find(
          { tutor: userData._id },
          { projection: "_id" }
        );
        const createdCoursesIds = createdCourses.map((course) => course._id);
        const purchasedCoursesIds = purchasedCourses.map(
          (purchase) => purchase.course
        );
        coursesFilter = {
          _id: {
            $nin: [...purchasedCoursesIds, ...createdCoursesIds],
          },
        };
      }
      coursesFilter = { ...coursesFilter, status: "published" };
      const categories = await this.categoriesRepository.find(categoryFilter, {
        projection: "_id name",
        limit: 5,
      });

      let queries = categories.map(async (category) => {
        const courses = await this.coursesRepository.find(
          {
            ...coursesFilter,
            category: category._id,
          },
          { populate: { path: "tutor", select: "name image" } }
        );
        return {
          category: category.name,
          courses,
        };
      });
      const results = await Promise.all(queries);
      return {
        success: true,
        message: "fetched docs successfully",
        statusCode: 200,
        results,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async find(query: object): ServiceResponse<{ docs?: object[] }> {
    try {
      const filter = { ...query, status: "published" };
      const docs = await this.coursesRepository.find(filter);
      return {
        success: true,
        message: "fetched docs successfully",
        statusCode: 200,
        docs,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findPaginate(
    page: number,
    userId: string | DatabaseId,
    filter?: {
      search?: string;
      minPrice: number;
      maxPrice: number;
      category?: string;
      language?: string;
      sort?: string;
    },
    limit: number = 8
  ): ServiceResponse<PaginationResult> {
    try {
      let options = {};
      let query = {};
      if (userId) {
        const purchasedCourses = await this.enrollmentsRepository.find(
          { user: userId },
          { projection: "course" }
        );
        const createdCourses = await this.coursesRepository.find(
          { tutor: userId },
          { projection: "_id" }
        );
        const createdCoursesIds = createdCourses.map((course) => course._id);
        const purchasedCoursesIds = purchasedCourses.map(
          (purchase) => purchase.course
        );
        query = {
          _id: {
            $nin: [...purchasedCoursesIds, ...createdCoursesIds],
          },
        };
      }
      if (filter?.search) {
        query = {
          ...query,
          title: { $regex: new RegExp(filter?.search), $options: "i" },
        };
      }
      query = {
        ...query,
        price: {
          $gte: filter?.minPrice >= 0 ? filter?.minPrice : 0,
          $lte: filter?.maxPrice <= 99999 ? filter?.maxPrice : 99999,
        },
      };
      if (filter?.category) {
        const doc = await this.categoriesRepository.findOne({
          name: filter?.category,
        });
        query = { ...query, category: doc._id };
      }
      if (filter?.language) {
        query = { ...query, language: filter?.language };
      }
      if (filter?.sort) {
        const sort =
          filter?.sort === "newest"
            ? { createdAt: -1 }
            : filter?.sort === "rating"
            ? { rating: -1 }
            : filter?.sort === "price_low"
            ? { price: 1 }
            : { price: -1 };
        options = { sort };
      }
      query = {
        ...query,
        status: "published",
      };
      const docs = await this.coursesRepository.find(query, {
        ...options,
        populate: { path: "tutor", select: "name image" },
        limit: limit,
        skip: (page - 1) * limit,
      });
      const totalCount = await this.coursesRepository.count(query);
      return {
        success: true,
        message: "fetched docs successfully",
        statusCode: 200,
        result: {
          docs,
          total: totalCount,
          limit: limit,
          page,
          pages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findById(id: string | DatabaseId): ServiceResponse<{ doc?: object }> {
    try {
      const doc = await this.coursesRepository.findById(id, {
        populate: { path: "tutor", select: "name image bio" },
      });
      if (!doc) {
        return {
          success: false,
          message: "course not found",
          statusCode: 404,
        };
      }
      return {
        success: true,
        message: "fetched doc successfully",
        statusCode: 200,
        doc,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(
    data: {
      title: string;
      description: string;
      price: number;
      discount: number;
      category: DatabaseId | string;
      tutor: DatabaseId | string;
      requirements: string[];
      benefits: string[];
      language: string;
      thumbnail?: string;
      imagePublicId?: string;
    },
    image: Buffer
  ): ServiceResponse {
    try {
      if (data.title.length < 3)
        return {
          success: false,
          message: "Title must be at least 3 characters",
          statusCode: 400,
        };
      if (data.title.length > 50)
        return {
          success: false,
          message: "Title must be at most 50 characters",
          statusCode: 400,
        };
      if (data.description.length < 20)
        return {
          success: false,
          message: "Description must be at least 20 characters",
          statusCode: 400,
        };
      if (data.description.length > 1000)
        return {
          success: false,
          message: "Description must be at most 1000 characters",
          statusCode: 400,
        };
      if (data.price < 0 && data.discount < 0) {
        return {
          success: false,
          message: "Invalid discount and price",
          statusCode: 400,
        };
      }
      if (data.price - data.discount < 399) {
        return {
          success: false,
          message: "Price including discount must be at least 399",
          statusCode: 400,
        };
      }
      if (data.price > 99999) {
        return {
          success: false,
          message: "Price must be at most 99999",
          statusCode: 400,
        };
      }
      const croppedBuffer = await resizeImage(image, 800, 450);
      const result = (await uploadtoCloudinary(croppedBuffer)) as {
        url: string;
        public_id: string;
      };
      data.thumbnail = result.url;
      data.imagePublicId = result.public_id;
      if (!data.requirements) data.requirements = [];
      if (!data.benefits) data.benefits = [];
      await this.coursesRepository.create(data as ICourses);
      return {
        success: true,
        message: "created doc successfully",
        statusCode: 201,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async edit(
    id: string,
    data: {
      title: string;
      description: string;
      price: number;
      discount: number;
      thumbnail: string;
      category: DatabaseId | string;
      tutor: DatabaseId | string;
      requirements: string[];
      benefits: string[];
      language: string;
    },
    image: Buffer | undefined,
    userId: string | DatabaseId
  ): ServiceResponse {
    try {
      const existingDoc = await this.coursesRepository.findById(id);
      if (existingDoc.tutor.toString() !== userId.toString()) {
        return {
          success: false,
          message: "You are not authorized to edit this course",
          statusCode: 401,
        };
      }
      if (existingDoc.status !== "creating") {
        return {
          success: false,
          message: "You can only edit a course that is being created",
          statusCode: 400,
        };
      }
      if (data.title.length < 3)
        return {
          success: false,
          message: "Title must be at least 3 characters",
          statusCode: 400,
        };
      if (data.title.length > 50)
        return {
          success: false,
          message: "Title must be at most 50 characters",
          statusCode: 400,
        };
      if (data.description.length < 20)
        return {
          success: false,
          message: "Description must be at least 20 characters",
          statusCode: 400,
        };
      if (data.description.length > 1000)
        return {
          success: false,
          message: "Description must be at most 1000 characters",
          statusCode: 400,
        };
      if (data.price < 0 && data.discount < 0) {
        return {
          success: false,
          message: "Invalid discount and price",
          statusCode: 400,
        };
      }
      if (data.price - data.discount < 399) {
        return {
          success: false,
          message: "Price including discount must be at least 399",
          statusCode: 400,
        };
      }
      if (data.price > 99999) {
        return {
          success: false,
          message: "Price must be at most 99999",
          statusCode: 400,
        };
      }
      let imageData: { thumbnail?: string; imagePublicId?: string } = {};
      if (image) {
        const croppedBuffer = await resizeImage(image, 800, 450);
        const { url, public_id } = (await uploadtoCloudinary(
          croppedBuffer
        )) as {
          url: string;
          public_id: string;
        };
        imageData.thumbnail = url;
        imageData.imagePublicId = public_id;
      } else {
        delete data.thumbnail;
      }
      if (!data.requirements) data.requirements = [];
      if (!data.benefits) data.benefits = [];
      await this.coursesRepository.findOneAndUpdate(
        { _id: id },
        { ...data, ...imageData }
      );
      return {
        success: true,
        message: "Edited doc successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async editPriceDiscount(
    userId: string | DatabaseId,
    courseId: string,
    data: { price: number; discount: number }
  ): ServiceResponse {
    try {
      const existingDoc = await this.coursesRepository.findById(courseId);
      if (existingDoc.tutor.toString() !== userId.toString()) {
        return {
          success: false,
          message: "You are not authorized to delete this course",
          statusCode: 401,
        };
      }
      if (data.price < 0 && data.discount < 0) {
        return {
          success: false,
          message: "Invalid discount and price",
          statusCode: 400,
        };
      }
      if (data.price - data.discount < 399) {
        return {
          success: false,
          message: "Price including discount must be at least 399",
          statusCode: 400,
        };
      }
      if (data.price > 99999) {
        return {
          success: false,
          message: "Price must be at most 99999",
          statusCode: 400,
        };
      }
      await this.coursesRepository.findOneAndUpdate(
        { _id: courseId },
        { price: data.price, discount: data.discount }
      );
      return {
        success: true,
        message: "Edited price and discount successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteCourse(id: string, userId: string): ServiceResponse {
    try {
      const existingDoc = await this.coursesRepository.findById(id);
      if (existingDoc.tutor.toString() !== userId.toString())
        return {
          success: false,
          message: "You are not authorized to delete this course",
          statusCode: 401,
        };
      if (existingDoc.status !== "creating") {
        return {
          success: false,
          message: "You can only delete a course that is being created",
          statusCode: 400,
        };
      }
      await this.coursesRepository.deleteOne({ _id: id });
      await cloudinary.uploader.destroy(existingDoc.imagePublicId);
      const videos = await this.videosRepository.find({ course: id });
      videos.forEach(async (video) => {
        await cloudinary.uploader.destroy(video.videoPublicId, {
          resource_type: "video",
        });
      });
      await this.videosRepository.delete({ course: id });
      await this.exercisesRepository.delete({ course: id });
      return {
        success: true,
        message: "Deleted course and contents successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPurchasedCourses(
    userId: string | DatabaseId
  ): ServiceResponse<{ courses: object[] }> {
    try {
      const purchasedCourses = await this.enrollmentsRepository.find(
        { user: userId },
        { projection: "course" }
      );
      const courses = await this.coursesRepository.find(
        {
          _id: { $in: purchasedCourses.map((course) => course.course) },
        },
        { populate: { path: "tutor", select: "name image" } }
      );
      return {
        success: true,
        message: "Fetched purchased courses successfully",
        statusCode: 200,
        courses,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getChapterRedirectInfo(
    userId: string | DatabaseId,
    courseId: string | DatabaseId,
    chapterId: string | DatabaseId
  ): ServiceResponse<{ nextResource?: string }> {
    try {
      const enrolled = await this.enrollmentsRepository.findOne({
        user: userId,
        course: courseId,
      });
      if (!enrolled) {
        return {
          success: false,
          message: "You are not enrolled in this course",
          statusCode: 401,
        };
      }
      let resourceType = "";
      let resourceId = "";
      const videoExists = await this.videosRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: 1,
      });
      if (videoExists) {
        resourceType = "video";
        resourceId = videoExists._id.toString();
        return {
          success: true,
          message: "Fetched initial redirect info successfully",
          statusCode: 200,
          nextResource: resourceType,
        };
      }
      const exerciseExists = await this.exercisesRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: 1,
      });
      if (exerciseExists) {
        resourceType = "exercise";
        resourceId = exerciseExists._id.toString();
        return {
          success: true,
          message: "Fetched initial redirect info successfully",
          statusCode: 200,
          nextResource: resourceType,
        };
      }
      return {
        success: true,
        message: "No more resources",
        statusCode: 404,
        nextResource: null,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getVideoDetails(
    userId: string | DatabaseId,
    courseId: string | DatabaseId,
    chapterId: string | DatabaseId,
    videoOrder: number
  ): ServiceResponse<{
    video?: object;
    nextData?: {
      nextVideo?: boolean;
      nextExercise?: Boolean;
      nextChapter?: boolean | string | DatabaseId;
    };
  }> {
    try {
      let nextData: {
        nextVideo?: boolean;
        nextExercise?: Boolean;
        nextChapter?: boolean | string | DatabaseId;
      } = {
        nextVideo: false,
        nextExercise: false,
        nextChapter: false,
      };
      const video = await this.videosRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: videoOrder,
      });
      if (!video) {
        return {
          success: false,
          message: "No video found",
          statusCode: 404,
        };
      }
      await this.progressRepository.pushToField(
        { user: userId, course: courseId },
        "videos",
        video._id
      );
      const nextVideo = await this.videosRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: videoOrder + 1,
      });
      if (nextVideo) {
        nextData.nextVideo = true;
        return {
          success: true,
          message: "Fetched video details successfully",
          statusCode: 200,
          video,
          nextData,
        };
      }
      const nextExercise = await this.exercisesRepository.findOne({
        course: courseId,
        chapter: chapterId,
      });
      if (nextExercise) {
        nextData.nextExercise = true;
        return {
          success: true,
          message: "Fetched video details successfully",
          statusCode: 200,
          video,
          nextData,
        };
      }
      const currentChapter = await this.chaptersRepository.findOne({
        _id: chapterId,
      });
      const nextChapter = await this.chaptersRepository.findOne({
        course: courseId,
        order: currentChapter.order + 1,
      });
      if (nextChapter) {
        nextData.nextChapter = nextChapter._id;
        return {
          success: true,
          message: "Fetched video details successfully",
          statusCode: 200,
          video,
          nextData,
        };
      }
      return {
        success: true,
        message: "No further resource found",
        statusCode: 200,
        video,
        nextData,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getExerciseDetails(
    userId: string | DatabaseId,
    courseId: string | DatabaseId,
    chapterId: string | DatabaseId,
    exerciseOrder: number
  ): ServiceResponse<{
    exercise?: object;
    nextData?: {
      nextExercise?: boolean;
      nextChapter?: boolean | string | DatabaseId;
    };
  }> {
    try {
      let nextData: {
        nextExercise: boolean;
        nextChapter: false | DatabaseId;
      } = {
        nextExercise: false,
        nextChapter: false,
      };
      const exercise = await this.exercisesRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: exerciseOrder,
      });
      if (!exercise) {
        return {
          success: false,
          message: "No exercise found",
          statusCode: 404,
        };
      }
      await this.progressRepository.pushToField(
        { user: userId, course: courseId },
        "exercises",
        exercise._id
      );
      const nextExercise = await this.exercisesRepository.findOne({
        course: courseId,
        chapter: chapterId,
        order: exerciseOrder + 1,
      });
      if (nextExercise) {
        nextData.nextExercise = true;
        return {
          success: true,
          message: "Fetched video details successfully",
          statusCode: 200,
          exercise,
          nextData,
        };
      }
      const currentChapter = await this.chaptersRepository.findOne({
        _id: chapterId,
      });
      const nextChapter = await this.chaptersRepository.findOne({
        course: courseId,
        order: currentChapter.order + 1,
      });
      if (nextChapter) {
        nextData.nextChapter = nextChapter._id;
        return {
          success: true,
          message: "Fetched video details successfully",
          statusCode: 200,
          exercise,
          nextData,
        };
      }
      return {
        success: false,
        message: "No further resource found",
        statusCode: 200,
        exercise,
        nextData,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCreating(
    userId?: string | DatabaseId
  ): ServiceResponse<{ courses: object[] }> {
    try {
      let filter: {
        tutor?: string;
        status: "creating";
      } = {
        status: "creating",
      };
      if (userId) filter = { ...filter, tutor: userId.toString() };
      const courses = await this.coursesRepository.find(filter);
      return {
        success: true,
        message: "Fetched creating courses successfully",
        statusCode: 200,
        courses,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPending(
    userId?: string | DatabaseId
  ): ServiceResponse<{ courses: object[] }> {
    try {
      let filter: {
        tutor?: string;
        status: "pending";
      } = {
        status: "pending",
      };
      if (userId) filter = { ...filter, tutor: userId.toString() };
      const courses = await this.coursesRepository.find(filter);
      return {
        success: true,
        message: "Fetched pending courses successfully",
        statusCode: 200,
        courses,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPublished(
    userId?: string | DatabaseId
  ): ServiceResponse<{ courses: object[] }> {
    try {
      let filter: {
        tutor?: string;
        status: "published";
      } = {
        status: "published",
      };
      if (userId) filter = { ...filter, tutor: userId.toString() };
      const courses = await this.coursesRepository.find(filter);
      return {
        success: true,
        message: "Fetched pending courses successfully",
        statusCode: 200,
        courses,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async makePublishRequest(
    courseId: string | DatabaseId,
    userId: string | DatabaseId
  ): ServiceResponse {
    try {
      const course = await this.coursesRepository.findById(courseId);
      if (course.tutor.toString() !== userId.toString()) {
        return {
          success: false,
          message: "You are not authorized to push this course for approval",
          statusCode: 401,
        };
      }
      if (course.status !== "creating") {
        return {
          success: false,
          message: "Invalid action",
          statusCode: 400,
        };
      }
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { status: "pending" }
      );
      return {
        success: true,
        message: "Course pushed for approval successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async cancelPublishRequest(
    courseId: string | DatabaseId,
    userId: string | DatabaseId
  ): ServiceResponse {
    try {
      const course = await this.coursesRepository.findById(courseId);
      if (course.tutor.toString() !== userId.toString()) {
        return {
          success: false,
          message: "You are not authorized to cancel approval request",
          statusCode: 401,
        };
      }
      if (course.status !== "pending") {
        return {
          success: false,
          message: "Invalid action",
          statusCode: 400,
        };
      }
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { status: "creating" }
      );
      return {
        success: true,
        message: "Course approval request cancelled",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async approveCourse(courseId: string | DatabaseId): ServiceResponse {
    try {
      const course = await this.coursesRepository.findById(courseId);
      if (course.status !== "pending") {
        return {
          success: false,
          message: "Invalid action",
          statusCode: 400,
        };
      }
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { status: "published" }
      );
      return {
        success: true,
        message: "Course approved successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async rejectCourse(courseId: string | DatabaseId): ServiceResponse {
    try {
      const course = await this.coursesRepository.findById(courseId);
      if (course.status !== "pending") {
        return {
          success: false,
          message: "Invalid action",
          statusCode: 400,
        };
      }
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { status: "creating" }
      );
      return {
        success: true,
        message: "Course rejected successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async blockCourse(courseId: string | DatabaseId): ServiceResponse {
    try {
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { isBlocked: true }
      );
      return {
        success: true,
        message: "Course blocked successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async unblockCourse(courseId: string | DatabaseId): ServiceResponse {
    try {
      await this.coursesRepository.updateOne(
        { _id: courseId },
        { isBlocked: false }
      );
      return {
        success: true,
        message: "Course blocked successfully",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default new CoursesService(
  coursesRepositoryInstance,
  categoriesRepositoryInstance,
  chaptersRepositoryInstance,
  videosRepositoryInstance,
  exercisesRepositoryInstance,
  enrollmentsRepositoryInstance,
  progressRepositoryInstance
);
