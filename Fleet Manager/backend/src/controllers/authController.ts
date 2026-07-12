import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-jwt-secret-key-12345';
const JWT_EXPIRES_IN = '24h';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, region } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const newUser = new User({
      name,
      email,
      password,
      region: region || 'All Regions'
    });

    await newUser.save();

    // Create JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, region: newUser.region },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        region: newUser.region,
        avatarUrl: newUser.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, region: user.region },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: (error as Error).message });
  }
};
