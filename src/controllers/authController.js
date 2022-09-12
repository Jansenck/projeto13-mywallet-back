import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";

import db from "../database/db.js";

async function signUp(req, res){
    
    const {name, email, password} = req.body;
    
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
}
async function signIn(req,res){
    
    const {email, password} = req.body;
    
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
}

export { signUp, signIn };