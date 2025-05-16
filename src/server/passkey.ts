import { server } from "@passwordless-id/webauthn";

export function generateNewChallenge() {
  return server.randomChallenge();
}
