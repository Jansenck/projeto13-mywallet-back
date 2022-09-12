import express from "express";
import { signUp, signIn } from "../controllers/authController.js";
import signUpSchemaValidationMiddleware from "../middlewares/signUpSchemaValidationMiddleware.js";
import signInSchemaValidationMiddleware from "../middlewares/signInSchemaValidationMiddleware.js";

const authRouter = express.Router();
authRouter.post("/sign-up", signUpSchemaValidationMiddleware, signUp);
authRouter.post("/sign-in", signInSchemaValidationMiddleware, signIn);

export default authRouter;