const bcrypt = require('bcryptjs');

// Hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH) || 8;
  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calculate password strength score (0-100)
const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length bonus
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;

  // Character variety bonus
  if (/(?=.*[a-z])/.test(password)) score += 10;
  if (/(?=.*[A-Z])/.test(password)) score += 10;
  if (/(?=.*\d)/.test(password)) score += 10;
  if (/(?=.*[@$!%*?&])/.test(password)) score += 10;

  // Additional complexity bonus
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) score += 10;

  return Math.min(100, score);
};

// Generate secure random password
const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  calculatePasswordStrength,
  generateSecurePassword,
}; 