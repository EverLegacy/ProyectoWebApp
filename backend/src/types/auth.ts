export interface AuthUser {
  id: number;
  email: string;
  role?: string;
}

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}
