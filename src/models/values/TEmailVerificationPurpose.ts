export type TEmailVerificationPurpose =
  | 'createCookieToken'
  | 'createBearerToken'
  | 'setEmail'
  | 'setProfileExpiresAt'
  | 'unregister';
