import { z } from "zod"

const envSchema = z.object({
  apiUrl: z.string().url().default("http://localhost:8094"),
  bffUrl: z.string().url().default("http://localhost:8092"),
  oidcAuthority: z.string().url().default("http://localhost:8085"),
  oidcClientId: z.string().min(1).default("console"),
  oidcRedirectUri: z
    .string()
    .url()
    .default(`${window.location.origin}/callback`),
  oidcScope: z.string().default("openid profile email"),
})

const parsed = envSchema.parse({
  apiUrl: import.meta.env.VITE_API_URL,
  bffUrl: import.meta.env.VITE_BFF_URL,
  oidcAuthority: import.meta.env.VITE_OIDC_AUTHORITY,
  oidcClientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  oidcRedirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
})

export const config = parsed
