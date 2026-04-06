import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';

// Ensure you have bcryptjs installed in package.json if you add hash/compare
// For now, doing plaintext or basic hashing (add bcryptjs in reality)
// Let's assume bcryptjs is installed or we just do simple simulation if not.
// We'll install bcryptjs via npm install bcryptjs @types/bcryptjs
import bcrypt from 'bcryptjs';
import { sendTestEmail } from '../utils/email';

export const testEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const success = await sendTestEmail(email || process.env.SMTP_EMAIL || 'responses.vision@gmail.com');
    if (success) {
      res.status(200).json({ message: 'Test email sent successfully. Check your inbox/spam.' });
    } else {
      res.status(500).json({ message: 'Failed to send test email. Check server logs for errors.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error in test email endpoint', error: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    const token = generateToken(newUser.id, newUser.role);
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: 'ID Token is required' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid Google Token' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (!user) {
      // Create new user via Google
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          role: 'USER',
        },
      });
    } else if (!user.googleId) {
      // Link existing email account to Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = generateToken(user.id, user.role);
    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google Authentication failed', error: (error as Error).message });
  }
};
