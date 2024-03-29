import mongoose, { QueryOptions, mongo } from "mongoose";
import cartsModel from "../models/carts.model.js";
import ICartsRepository from "../interfaces/repository.interfaces/carts.repository.interface.js";
export class CartsRepository implements ICartsRepository {
  private model = cartsModel;
  async deleteMany(query: {
    _id?: string | mongoose.Types.ObjectId;
    course?: string | mongoose.Types.ObjectId;
    user?: string | mongoose.Types.ObjectId;
  }) {
    await this.model.deleteMany(query);
  }

  async deleteOne(query: {
    _id?: string | mongoose.Types.ObjectId;
    course?: string | mongoose.Types.ObjectId;
    user?: string | mongoose.Types.ObjectId;
  }) {
    await this.model.deleteOne(query);
  }

  async find(
    filter: { user: string | mongoose.Types.ObjectId },
    options?: QueryOptions
  ) {
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

      return await query.exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(query: {
    course: string | mongoose.Types.ObjectId;
    user: string | mongoose.Types.ObjectId;
  }) {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(data: {
    course: string | mongoose.Types.ObjectId;
    user: string | mongoose.Types.ObjectId;
  }) {
    try {
      const cartExists = await this.model.findOne(data);
      if (cartExists) return;
      await this.model.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async count(filter: object) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new CartsRepository();
