import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './Resolvers/UserResolver';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import {createAccessToken, createRefreshToken} from "./Auth";
import {User} from "./entity/User";
import {sendRefreshToken} from "./helpers/sendRefreshToken";

(async () => {
    const app = express();
    app.use(cookieParser());
    const port = process.env.PORT;
    app.get('/', (_req, res) => res.send('hello'));

    app.post('/refresh-token', async (req, res) => {
        const token = req.cookies.jid;
        if (!token) {
            return res.json({ ok: false, accessToken: 'There was no token in the cookie' });
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (e) {
            console.log(e);
            return res.json({ ok: false, accessToken: 'An error occurred' });
        }

        // token is valid and we can send back an access token

        const user = await User.findOne({id: payload.userId});

        if(!user){
            return res.json({ ok: false, accessToken: 'Invalid user' });
        }

        if(user.tokenVersion !== payload.tokenVersion){
            return res.json({ok: false, accessToken: 'Invalid token version'})
        }

        //This lets the user stay logged in for more than 7 days if they continuously use the website
        sendRefreshToken(res, createRefreshToken(user));
        return res.json({ ok: true, accessToken: createAccessToken(user) });
    });

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
        }),
        // creating refresh token
        context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app });
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
})();
// createConnection().then(async connection => {
//
//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);
//
//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);
//
//     console.log("Here you can setup and run express/koa/any other framework.");
//
// }).catch(error => console.log(error));
