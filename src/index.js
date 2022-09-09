import express, {json} from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import joi from "joi";

import {v4 as uuid} from "uuid";
import db from "./database/db.js";

const server = express();
server.use(cors());
server.use(json());

const signUpSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    password: joi.string().empty().required()
});

server.post("/sign-up", async (req, res) => {
    
    const {name, email, password} = req.body;
    const validationSignUp = signUpSchema.validate({name, email, password}, {abortEarly: false});

    if(validationSignUp.error){
        const err = validationSignUp.error.details.map((detail) => detail.message);
        return res.status(422).send(err);
    }
    const encryptedPassword = bcrypt.hashSync(password, 10);

    try {
        const userAlreadyExists = await db.collection("users").findOne({email});
        if(userAlreadyExists){
            return res.status(401).send("Esse email não está disponível!")
        }
        const user = await db.collection("users").insertOne({name, email, password:encryptedPassword});
        return res.sendStatus(201);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

server.listen(5000, () =>{
    console.log("Server is running on port 5000")
});

