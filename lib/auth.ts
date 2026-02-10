import { betterAuth } from "better-auth";
import { genericOAuth, keycloak } from "better-auth/plugins"


export const auth = betterAuth({
    plugins: [
        genericOAuth({
            config: [
                keycloak({
                    clientId: process.env.KEYCLOAK_CLIENT_ID ?? (() => { throw new Error("KEYCLOAK_CLIENT_ID is not set"); })(),
                    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? (() => { throw new Error("KEYCLOAK_CLIENT_SECRET is not set"); })(),
                    issuer: process.env.KEYCLOAK_ISSUER ?? (() => { throw new Error("KEYCLOAK_ISSUER is not set"); })(),
                }),
            ]
        })
    ]
});