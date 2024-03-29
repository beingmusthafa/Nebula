import mongoose, { QueryOptions } from "mongoose";
import reviewsModel from "../models/reviews.model.js";
import IReviewsRepository from "../interfaces/repository.interfaces/reviews.repository.interface.js";

export class ReviewsRepository implements IReviewsRepository {
  private model = reviewsModel;

  async create(data: {
    user: string | mongoose.Types.ObjectId;
    course: string | mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
  }) {
    try {
      const review = await this.model.create(data);
      return review;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOne(filter: object, data: { rating?: number; comment?: string }) {
    try {
      const doc = await this.model.updateOne(filter, data);
      return doc.modifiedCount;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async find(filter: object, options?: QueryOptions) {
    try {
      let query = this.model.find(filter);
      if (options?.select) {
        query = query.select(options.select);
      }

      if (options?.sort) {
        query = query.sort(options.sort);
      }

      if (options?.populate) {
        query = query.populate(options.populate as string | string[]);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.skip) {
        query = query.skip(options.skip);
      }

      return query.exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(filter: object, options?: QueryOptions) {
    try {
      let query = this.model.findOne(filter);
      if (options?.select) {
        query = query.select(options.select);
      }

      if (options?.populate) {
        query = query.populate(options.populate as string | string[]);
      }

      return query.exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteOne(filter: object) {
    try {
      const doc = await this.model.deleteOne(filter);
      return doc.deletedCount;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteMany(filter: object) {
    try {
      const doc = await this.model.deleteMany(filter);
      return doc.deletedCount;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async aggregate(pipeline: mongoose.PipelineStage[]) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new ReviewsRepository();
