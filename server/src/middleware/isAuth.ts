import { Middleware } from 'type-graphql/dist/interfaces/Middleware';
import { MyContext } from '../MyContext';
import { verify } from 'jsonwebtoken';

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];

    if (!authorization) {
        throw new Error('not authenticated');
    }
    try {
        const token = authorization?.split(' ')[1];

        //Exclamation mark confirms that token has a type and typescript should ignore the no type set error.
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);


        //'as any' says payload could be of any type
        context.payload = payload as any;
    } catch (err) {
        console.log(err);
        throw new Error('not authenticated');
    }
    return next();
};
