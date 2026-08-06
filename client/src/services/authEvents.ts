/**
 * Central hook for reacting to 401 responses from the API. The AuthContext
 * registers a handler here so any fetch layer can trigger a re-check of auth
 * status (which flips the app back to the login screen) without importing React.
 */

type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (fn: UnauthorizedHandler | null): void => {
  handler = fn;
};

export const notifyUnauthorized = (): void => {
  if (handler) {
    handler();
  }
};
