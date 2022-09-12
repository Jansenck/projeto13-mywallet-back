import express, {json} from "express";
import cors from "cors";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

const server = express();
server.use(cors());
server.use(json());

server.use(authRouter);
server.use(userRouter);

server.listen(5000, () =>{
    console.log("Server is running on port 5000")
});

