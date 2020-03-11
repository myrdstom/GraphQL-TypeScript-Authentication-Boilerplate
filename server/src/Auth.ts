import { User } from './entity/User';
import { sign } from 'jsonwebtoken';

const secretKey = process.env.ACCESS_TOKEN_SECRET;
const cookieSecret = process.env.REFRESH_TOKEN_SECRET;

export const createAccessToken = (user: User) => {
    return sign({ userID: user.id, email: user.email }, `${secretKey}`, {
        expiresIn: '60m',
    });
};

export const createRefreshToken = (user: User) => {
    return sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        `${cookieSecret}`,
        { expiresIn: '7d' }
    );
};
