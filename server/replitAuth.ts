import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { TokenSet}} from "openid-client";
import {  from "openid-client";
import { Issuer } from "openid-client";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Response } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export interface ReplitAuthOptions {
  app: Express;
  sessionSecret: string;
  failureRedirect: string;
  successRedirect: string;
  getUser: (
    id: string,
    domain: string,
  ) => Promise<
    | {
        id: string;
      }
    | undefined
  >;
  createUser: (
    claims: any,
    domain: string,
  ) => Promise<{ id: string }>;
  storageKey?: (req: Express.Request) => string;
  sessionStore?: session.Store;
  storeOptions?: connectPg.PGStoreOptions;
  cookie?: session.CookieOptions;
  getUserByApiKey?: (apiKey: string) => Promise<{ id: string } | undefined>;
  apiKeyAuthRoute?: string;
}

export const replitAuth = async (options: ReplitAuthOptions) => {
  const { app, sessionSecret } = options;

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store:
        options.sessionStore ??
        new (connectPg(session))({
          conString: process.env.DATABASE_URL,
          tableName: "sessions",
          ...options.storeOptions,
        }),
      cookie: {
        secure: app.get("env") === "production",
        ...options.cookie,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done: any) => {
    // TODO: remove this any
    for (const domain of ["replit.com", "replit.dev"]) {
      const user = await options.getUser(id, domain);
      if (user) {
        return done(null, user);
      }
    }
    done(null, false);
  });

  const domains = ["replit.com", "replit.dev"];

  const oidcClient = memoize(
    async (domain: string) => {
      const issuer = await Issuer.discover(
        `https://auth.${domain}`,
      );
      const clientInstance = new issuer.Client({
        client_id: process.env.REPLIT_CLIENT_ID!,,
        redirect_uris: [
          `${process.env.REPLIT_OAUTH_CALLBACK}/${domain}`,
          `${process.env.REPLIT_OAUTH_CALLBACK}/api-key/${domain}`,
        ],
        response_types: ["code"]
        client_secret: process.env.REPLIT_CLIENT_SECRET!,
        redirect_uris: [
          `${process.env.REPLIT_OAUTH_CALLBACK}/${domain}`,
          `${process.env.REPLIT_OAUTH_CALLBACK}/api-key/${domain}`,
        ],
        response_types: ["code"],
      });
      return clientInstance;
    },
    { promise: true },
  );

  for (const domain of domains) {
    passport.use(
      `replitauth:${domain}`,
      new Strategy(
        {
          client: await oidcClient(domain),
          name: `replitauth:${domain}`,
          scope: "openid email profile offline_access",
        },
        async (accessToken: string, refreshToken: string, tokenset: TokenSet, done: VerifyFunction) => {
          const claims = tokenset.claims();
          if (!claims.sub) {
            console.error("no sub");
            return done(null, false);
          }
          try {
            let user = await options.getUser(claims.sub, domain);
            if (!user) {
              user = await options.createUser(claims, domain);
            }
            return done(null, user);
          } catch (e) {
            console.error(e);
            return done(e, undefined);
          }
        },
      ),
    );

    app.get(
      `/auth/replit/${domain}`,
      passport.authenticate(`replitauth:${domain}`, {
        failureRedirect: options.failureRedirect,
        successRedirect: options.successRedirect,
      }),
    );

    app.get(
      `/auth/replit/api-key/${domain}`,
      passport.authenticate(`replitauth:${domain}`, { session: false }),
      async (req: Express.Request, res: Response) => {
        const user = req.user as { id: string };
        if (!user) {
          return res.redirect(options.failureRedirect);
        }
        if (!options.getUserByApiKey) {
          console.warn("getUserByApiKey not set");
          return res.redirect(options.failureRedirect);
        }
        const apiKey = "test";
        // const apiKey = await storage.createApiKey(
        //   options.storageKey?.(req) ?? req.session.id,
        //   user.id,
        // );
        res.redirect(`${options.successRedirect}?apiKey=${apiKey}`);
      },
    );
  }

  if (options.apiKeyAuthRoute) {
    app.use(async (req, res, next) => {
      if (req.path !== options.apiKeyAuthRoute) {
        return next();
      }
      if (!options.getUserByApiKey) {
        return res.status(401).send("Unauthorized");
      }
      const apiKey = req.headers["x-api-key"] as string;
      if (!apiKey) {
        return res.status(401).send("Unauthorized");
      }
      const user = await options.getUserByApiKey(apiKey);
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      req.user = user;
      next();
    });
  }
};

const config = {
  sessionKey: "test",
};
