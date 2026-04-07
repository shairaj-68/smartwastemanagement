import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(userId, role) {
  return jwt.sign({ sub: userId, role }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });
}

export function signRefreshToken(userId, role) {
  return jwt.sign({ sub: userId, role }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
