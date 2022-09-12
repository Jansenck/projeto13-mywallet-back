import joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const signUpSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    password: joi.string().empty().required()
});

async function signUpSchemaValidationMiddleware(req, res, next){

    const { name, email, password } = req.body;
    
    try {

        const isValidSignUp = signUpSchema.validate({name, email, password}, {abortEarly: false});
        if(isValidSignUp.error){
            const signUpError = isValidSignUp.error.details.map((detail) => detail.message);
            return res.status(422).send(signUpError);
        }
        next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

export default signUpSchemaValidationMiddleware;

