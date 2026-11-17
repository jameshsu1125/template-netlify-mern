import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import mongoose from 'mongoose';
import { SETTING } from '../../../setting';
import { UserType } from '../../../src/settings/type';
import { messages } from '../config';
import models from '../models';
import connect from './connect';

/** identity resolved from a verified Auth0 access token */
export type TIdentity = {
  email: string;
  type: UserType;
};

export interface IAuthedRequest extends Request {
  identity?: TIdentity;
}

type TFailure = { res: false; status: number; msg: string };

type TClaimsResult = { res: true; email: string } | TFailure;

const USER_COLLECTION = SETTING.mongodb[0].collection;

/** namespace of the custom claims added by the Auth0 post-login action */
const namespace = () => process.env.AUTH0_CLAIMS_NAMESPACE || 'https://template-netlify-mern/';

const issuer = () => `https://${process.env.AUTH0_DOMAIN}/`;

let remoteJWKSet: ReturnType<typeof createRemoteJWKSet> | undefined;

/** jwks is cached between invocations so warm functions skip the extra request */
const getJWKSet = () => {
  if (!remoteJWKSet) {
    remoteJWKSet = createRemoteJWKSet(new URL(`${issuer()}.well-known/jwks.json`));
  }
  return remoteJWKSet;
};

/** every collection name declared in setting/index.ts */
export const allowedCollections: string[] = SETTING.mongodb.map((item) => item.collection);

export const isAllowedCollection = (collection: unknown): collection is string =>
  typeof collection === 'string' && allowedCollections.includes(collection);

/** the user collection (SETTING.mongodb[0]) is admin only */
export const requiresAdmin = (collection: string) => collection === USER_COLLECTION;

/** resolves the permission type of a verified email, undefined means no access */
const resolveType = async (email: string): Promise<UserType | undefined> => {
  if (process.env.AMIN_EMAIL && email === process.env.AMIN_EMAIL) return UserType.Admin;
  if (!mongoose.connections[0].readyState) return undefined;

  const userModel = models[USER_COLLECTION] as typeof mongoose.Model;
  const matched = (await userModel.findOne({ email }).lean()) as { type?: string } | null;
  const type = matched?.type;

  if (!type || type === UserType.Guest) return undefined;
  return Object.values(UserType).includes(type as UserType) ? (type as UserType) : undefined;
};

const extractToken = (authorization?: string) => {
  if (!authorization) return '';
  const [scheme, value] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer') return '';
  return value?.trim() || '';
};

/** verifies the token signature and claims, needs no database */
export const verifyClaims = async (authorization?: string): Promise<TClaimsResult> => {
  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    return { res: false, status: 500, msg: messages.authNotConfigured };
  }

  const token = extractToken(authorization);
  if (!token) return { res: false, status: 401, msg: messages.authMissing };

  let payload: JWTPayload;
  try {
    const verified = await jwtVerify(token, getJWKSet(), {
      issuer: issuer(),
      audience: process.env.AUTH0_AUDIENCE,
      algorithms: ['RS256'],
    });
    payload = verified.payload;
  } catch {
    return { res: false, status: 401, msg: messages.authInvalid };
  }

  const email = payload[`${namespace()}email`];
  const emailVerified = payload[`${namespace()}email_verified`];

  if (typeof email !== 'string' || !email) {
    return { res: false, status: 401, msg: messages.authNoEmailClaim };
  }
  if (emailVerified !== true) {
    return { res: false, status: 403, msg: messages.authEmailUnverified };
  }

  return { res: true, email };
};

/**
 * rejects any request without a valid access token.
 * the token is verified first so an offline database cannot mask an auth failure,
 * then the connection is opened because the permission lookup needs it.
 */
export const guard = async (req: IAuthedRequest, res: Response, next: NextFunction) => {
  const claims = await verifyClaims(req.headers.authorization);
  if (!claims.res) {
    res.status(claims.status).json({ res: false, msg: claims.msg });
    return;
  }

  const connection = await connect();
  if (!connection.res) {
    res.status(503).json({ res: false, msg: messages.connectError });
    return;
  }

  const type = await resolveType(claims.email);
  if (!type) {
    res.status(403).json({ res: false, msg: messages.authNoPermission });
    return;
  }

  req.identity = { email: claims.email, type };
  next();
};

/** rejects unknown collection names and non admin access to the user collection */
export const guardCollection = (req: IAuthedRequest, res: Response, next: NextFunction) => {
  const collection = req.body?.collection;

  if (!isAllowedCollection(collection)) {
    res.status(400).json({ res: false, msg: messages.collectionNotAllowed });
    return;
  }
  if (requiresAdmin(collection) && req.identity?.type !== UserType.Admin) {
    res.status(403).json({ res: false, msg: messages.authNoPermission });
    return;
  }

  next();
};
