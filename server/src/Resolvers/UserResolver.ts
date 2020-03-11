import {
    Resolver,
    Query,
    Mutation,
    Arg,
    ObjectType,
    Field,
    Ctx,
    UseMiddleware,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from '../entity/User';
import { MyContext } from '../helpers/MyContext';
import { createAccessToken, createRefreshToken } from '../Auth';
import {isAuth} from "../middleware/isAuth";
import {sendRefreshToken} from "../helpers/sendRefreshToken";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string;
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi!';
    }

    //We destructured context with is req, res so its req, res, next
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload}: MyContext
    ) {
        return `your user id is: ${payload!.userID}`;
    }

    // Get all users
    @Query(() => [User])
    users() {
        return User.find();
    }

    //  Register user
    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('Password') password: string
    ) {
        const hashedPassword = await hash(password, 12);

        try {
            await User.insert({
                email,
                password: hashedPassword,
            });
        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    // Login User

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('Password') password: string,
        // Line below is context for token refresh. We destructure ctx to get the res
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('could not find user');
        }

        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error('Error: Incorrect password');
        }


        // login successful
        //'jid' is a generic name. can be anything
        sendRefreshToken(res, createRefreshToken(user));
        return {
            accessToken: createAccessToken(user),
        };
    }

}