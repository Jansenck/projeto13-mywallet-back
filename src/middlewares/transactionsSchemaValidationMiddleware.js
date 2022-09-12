import joi from "joi";
import dotenv from "dotenv";
import db from "../database/db.js";
dotenv.config();

const transactionSchema = joi.object({
    type: joi.string().empty().valid("entry", "exit").required(),
    value: joi.string().pattern(new RegExp("^[0-9]")).empty().required(),
    description: joi.string().pattern(new RegExp("^[a-zA-Z]")).empty().required() //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

async function transactionsSchemaValidationMiddleware(req, res, next){

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { type, value, description } = req.body;
    
    if(!token) return res.sendStatus(422);

    const isValidNewEntry = transactionSchema.validate({value, type, description}, {abortEarly: false});

    if(isValidNewEntry.error){
        const newEntryError = isValidNewEntry.error.details.map(details => details.message);
        return res.status(422).send(newEntryError);
    }

    try {
        const user = await db.collection("sessions").findOne({token});
        if(!user) return res.sendStatus(401);
        next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

export default transactionsSchemaValidationMiddleware;


