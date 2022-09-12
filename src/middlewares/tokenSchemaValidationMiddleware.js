import dotenv from "dotenv";
import db from "../database/db.js";
dotenv.config();

async function tokenSchemaValidationMiddleware(req, res, next){

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    
    if(!token) return res.sendStatus(422);

    try {
        const user = await db.collection("sessions").findOne({token});
        if(!user) return res.sendStatus(401);
        next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

export default tokenSchemaValidationMiddleware;