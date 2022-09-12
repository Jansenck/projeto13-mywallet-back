import db from "../database/db.js";

async function newEntry(req,res){
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { type, value, description } = req.body;
    
    /* const isValidNewEntry = transactionSchema.validate({value, type, description}, {abortEarly: false});

    if(isValidNewEntry.error){
        const newEntryError = isValidNewEntry.error.details.map(details => details.message);
        return res.status(422).send(newEntryError);
    } */
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
}
async function newExit(req, res){
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { type, value, description } = req.body;

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

}
async function userTransactions(req, res){
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
}

export { newEntry, newExit, userTransactions };