import express from "express";
import { 
    userTransactions, 
    newEntry, 
    newExit 
} from "../controllers/userController.js"; 
import tokenSchemaValidationMiddleware from "../middlewares/tokenSchemaValidationMiddleware.js";
import transactionsSchemaValidationMiddleware from "../middlewares/transactionsSchemaValidationMiddleware.js";

const userRouter = express.Router();
userRouter.get("/transactions", tokenSchemaValidationMiddleware, userTransactions);
userRouter.post("/new-entry", transactionsSchemaValidationMiddleware, newEntry);
userRouter.post("/new-exit", transactionsSchemaValidationMiddleware, newExit);

export default userRouter;