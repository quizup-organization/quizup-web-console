import { describe, expect, it } from "vitest"

import { decodeAccessToken } from "./jwt"

function tokenWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  return `${encode({ alg: "RS256" })}.${encode(payload)}.signature`
}

describe("decodeAccessToken", () => {
  it("extracts and normalizes roles", () => {
    const token = tokenWithPayload({
      sub: "user-1",
      email: "admin@quizup.fr",
      roles: ["ROLE_ADMIN", "USER"],
    })

    const profile = decodeAccessToken(token)

    expect(profile.sub).toBe("user-1")
    expect(profile.email).toBe("admin@quizup.fr")
    expect(profile.roles).toEqual(["ROLE_ADMIN", "ROLE_USER"])
  })

  it("returns no roles for malformed tokens", () => {
    expect(decodeAccessToken("not-a-jwt").roles).toEqual([])
  })
})
