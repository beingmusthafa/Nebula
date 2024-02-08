import mongoose from "mongoose";

export default interface ICurrentUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image: string;
  role: "user" | "admin" | "moderator";
  education: object[];
  experience: object[];
  isBlocked: boolean;
  appointmentCost: number;
  interests: string[];
  bio?: string;
}
