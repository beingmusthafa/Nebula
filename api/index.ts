import express, { Request, Response, NextFunction } from "express";
import connectDb from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import authRouter from "./routes/auth.router.js";
import adminRouter from "./routes/admin.router.js";
import userRouter from "./routes/user.router.js";
import tutorRouter from "./routes/tutor.router.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import userPurchaseController from "./controllers/user/user.purchase.controller.js";
import scheduleReportGeneration from "./utils/reportGenerator.js";
import { Server } from "socket.io";
import messagesRepository from "./repositories/messages.repository.js";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
connectDb();
scheduleReportGeneration();

if (process.env.NODE_ENV !== "production") {
  console.log("running in dev env");
  app.use(
    cors({
      origin: [process.env.CLIENT_BASE_URL, "https://dashboard.stripe.com/"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
}

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongoUrl: process.env.MONGO_URL }),
  })
);

app.options("*", (req: Request, res: Response, next: NextFunction) => {
  res.end();
});

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  (req: Request, res: Response, next: NextFunction) =>
    userPurchaseController.confirmPurchase(req, res, next)
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api", userRouter);

app.use(errorHandler);
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Page not found" });
});
const server = app.listen(3000, () => {
  console.log("Server started");
});

const io =
  process.env.NODE_ENV === "production"
    ? new Server(server)
    : new Server(server, {
        cors: {
          origin: process.env.CLIENT_BASE_URL,
        },
      });

io.on("connection", (socket) => {
  console.log("new socket connection : ", socket.id);

  socket.on(
    "send-message",
    async (data: {
      message: string;
      user: {
        _id: string;
        name: string;
        image: string;
      };
      course: string;
      createdAt: Date;
    }) => {
      io.to(data.course).emit("receive-message", data);
      await messagesRepository.create({
        user: data.user._id,
        message: data.message,
        course: data.course,
      });
    }
  );

  socket.on("join-course-room", (room) => {
    socket.join(room);
  });
});

export default server;
//test commit#13
