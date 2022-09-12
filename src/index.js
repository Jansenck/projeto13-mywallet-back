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
const singInSchema = joi.object({
    email: joi.string().email().empty().required(),
    password: joi.string().empty().required()
});
const transactionSchema = joi.object({
    type: joi.string().empty().valid("entry", "exit").required(),
    value: joi.string().empty().required(),
    description: joi.string().empty().required()
});

server.post("/sign-up", async (req, res) => {
    
    const {name, email, password} = req.body;
    const isValidSignUp = signUpSchema.validate({name, email, password}, {abortEarly: false});

    if(isValidSignUp.error){
        const signUpError = isValidSignUp.error.details.map((detail) => detail.message);
        return res.status(422).send(signUpError);
    }
    const encryptedPassword = bcrypt.hashSync(password, 10);
    delete req.body.password;
    try {
        const userAlreadyExists = await db.collection("users").findOne({email});
        if(userAlreadyExists){
            return res.status(401).send("Esse email não está disponível!")
        }
        await db.collection("users").insertOne({name, email, password:encryptedPassword});
        return res.sendStatus(201);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
server.post("/sign-in", async (req,res)=>{
    const {email, password} = req.body;
    const isValidSignInSchema = singInSchema.validate({email, password}, {abortEarly: false});

    if(isValidSignInSchema.error){
        const signInError = isValidSignInSchema.error.details.map(detail => detail.message); 
        return res.status(422).send(signInError); 
    }
    
    try {
        const user = await db.collection("users").findOne({email});
        if(!user) return res.status(422).send("E-mail incorreto!");

        const passWordIsValid = bcrypt.compareSync(password, user.password);
        if(!passWordIsValid) return res.status(422).send("Senha incorreta!")

        if(user && passWordIsValid){
            const token = uuid();
            await db.collection("sessions").insertOne({userId: user._id, token});
            return res.send({token, name: user.name});
        }

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

server.post("/new-entry", async (req,res) => {
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

        const session = await db.collection("transactions").findOne({userId: user.userId});
        const updateTransactions = {type: "entry", value: value, description: description};
        {
            session !== null?
            await db.collection("transactions").updateOne({transactions: session.transactions}, {$push: {transactions: updateTransactions}})
            :
            await db.collection("transactions").insertOne({userId: user.userId, transactions: [{type, value, description}]});
        }
        return res.sendStatus(201);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});
server.post("/new-exit", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { type, value, description } = req.body;

    if(!token) return res.sendStatus(422);
    const isValidNewExit = transactionSchema.validate({value, type, description}, {abortEarly: false});

    if(isValidNewExit.error){
        const newExitError = isValidNewExit.error.details.map(details => details.message);
        return res.status(422).send(newExitError);
    };

    try {
        const user = await db.collection("sessions").findOne({token});
        if(!user) return res.sendStatus(401);

        const session = await db.collection("transactions").findOne({userId: user.userId});
        const updateTransactions = {type: "exit", value: value, description: description};
        {
            session !== null?
            await db.collection("transactions").updateOne({transactions: session.transactions}, {$push: {transactions: updateTransactions}})
            :
            await db.collection("transactions").insertOne({token, transactions: [{type, value, description}]});
        }
        
        return res.sendStatus(201);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

});
server.get("/transactions", async (req, res) => {
    const {authorization} = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    
    try {
        const user = await db.collection("sessions").findOne({token});
        if(!user) return res.sendStatus(401);
   
        const session = await db.collection("transactions").findOne({userId: user.userId});
        if(session){
            const { transactions } = session;
            return res.send(transactions);
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

server.listen(5000, () =>{
    console.log("Server is running on port 5000")
});

