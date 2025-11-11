import prisma from '../../lib/prismaClient';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as emailService from '../../lib/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'destockify-secret-key123';
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;
const TOKEN_EXPIRY_TIME_1HOUR = 60 * 60 * 1000;

function generateAuthToken(customerId: number, email: string): string {
  return jwt.sign(
    { 
      customerId, 
      email,
      type: 'auth' 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function signUp(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const { firstName, lastName, email, password } = payload;

  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    throw new Error('Email already registered');
  }

  const passwordHash = await argon2.hash(password);
  const verificationToken = generateToken();
  const verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME);

  const customer = await prisma.customer.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    },
  });

  try {
    await emailService.sendVerificationEmail(email, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined,
  };
}

export async function login(payload: { email: string; password: string }) {
  const { email, password } = payload;

  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await argon2.verify(customer.passwordHash, password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (!customer.isVerified){
    throw new Error("Email is not verified.")
  }

  const authToken = generateAuthToken(customer.id, customer.email);

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    isVerified: customer.isVerified,
    authToken,
  };
}

export async function verifyEmail(payload: { token: string }) {
  const { token } = payload;

  const customer = await prisma.customer.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!customer) {
    throw new Error('Invalid or expired verification token');
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return {
    message: 'Email verified successfully',
    email: customer.email,
  };
}

export async function forgotPassword(payload: { email: string }) {
  const { email } = payload;

  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) {
    return {
      message: 'If that email exists, a password reset link has been sent',
    };
  }

  const resetToken = generateToken();
  const resetTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME_1HOUR);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      verificationToken: resetToken,
      verificationTokenExpiry: resetTokenExpiry,
    },
  });

  try {
    await emailService.sendPasswordResetEmail(email, resetToken);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email. Please try again.');
  }

  return {
    message: 'If that email exists, a password reset link has been sent',
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
  };
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  const { token, newPassword } = payload;

  const customer = await prisma.customer.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!customer) {
    throw new Error('Invalid or expired reset token');
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return {
    message: 'Password reset successfully',
    email: customer.email,
  };
}
