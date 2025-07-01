import * as bcrypt from "bcrypt";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3).optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupLocalAuth(app: Express) {
  if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1);
  }
  
  app.use(getSession());

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash!);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Store user in session
      (req.session as any).userId = user.id;
      
      // Return user data (without password hash)
      const { passwordHash, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, username } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      // Check if username is taken
      if (username) {
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          return res.status(409).json({ message: "This username is already taken" });
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Generate unique ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create user
      const user = await storage.createUser({
        id: userId,
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        profileImageUrl: null,
      });

      // Store user in session
      (req.session as any).userId = user.id;
      
      // Return user data (without password hash)
      const { passwordHash: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Please check your input: " + error.errors.map(e => e.message).join(", ")
        });
      }
      res.status(400).json({ message: "Failed to create account. Please try again." });
    }
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with this email exists, you will receive a password reset link." });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substr(2) + Date.now().toString(36);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      const success = await storage.setPasswordResetToken(email, resetToken, resetExpires);
      if (!success) {
        return res.status(500).json({ message: "Failed to generate reset token. Please try again." });
      }

      // In a real app, you would send an email here
      // For demo purposes, we'll return the token (remove this in production!)
      res.json({ 
        message: "If an account with this email exists, you will receive a password reset link.",
        resetToken: resetToken // REMOVE THIS IN PRODUCTION
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Update password and clear reset token
      await storage.updatePassword(user.id, passwordHash);
      await storage.clearResetToken(user.id);

      res.json({ message: "Password has been reset successfully. You can now sign in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters long"
        });
      }
      res.status(400).json({ message: "Failed to reset password. Please try again." });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully", redirect: "/" });
    });
  });

  // GET logout route for direct navigation
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substr(2, 32);
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await storage.setPasswordResetToken(email, resetToken, expires);

      // In production, send email here. For demo, return the token
      res.json({ 
        message: "Password reset instructions sent to your email.",
        resetToken: resetToken // For demo purposes only
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Update password and clear reset token
      await storage.updatePassword(user.id, passwordHash);
      await storage.clearResetToken(user.id);

      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user route
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data (without password hash)
      const { passwordHash, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  // Attach user to request
  (req as any).user = user;
  next();
};