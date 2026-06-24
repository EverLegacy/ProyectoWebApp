export class DuplicateEmailError extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'DuplicateEmailError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class InsufficientPointsError extends Error {
  constructor() {
    super('Insufficient points');
    this.name = 'InsufficientPointsError';
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('Token inválido o expirado');
    this.name = 'InvalidTokenError';
  }
}
