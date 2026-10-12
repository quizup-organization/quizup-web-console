import { lazy } from "react"

export const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
)
export const CallbackPage = lazy(() =>
  import("./pages/CallbackPage").then((module) => ({
    default: module.CallbackPage,
  })),
)
export const SilentCallbackPage = lazy(() =>
  import("./pages/SilentCallbackPage").then((module) => ({
    default: module.SilentCallbackPage,
  })),
)
