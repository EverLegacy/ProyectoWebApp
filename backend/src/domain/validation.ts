export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}

export function isValidRegistrationInput(name: string, email: string, password: string): boolean {
  return name.trim().length > 0 && isValidEmail(email) && isValidPassword(password);
}
