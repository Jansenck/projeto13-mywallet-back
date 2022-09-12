import joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const singInSchema = joi.object({
    email: joi.string().email().empty().required(),
    password: joi.string().empty().required()
});

async function signInSchemaValidationMiddleware(req, res, next){

    const { name, email, password } = req.body;
    
    try {

        const isValidSignInSchema = singInSchema.validate({email, password}, {abortEarly: false});

        if(isValidSignInSchema.error){
            const signInError = isValidSignInSchema.error.details.map(detail => detail.message); 
            return res.status(422).send(signInError); 
        }
        next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

export default signInSchemaValidationMiddleware;

