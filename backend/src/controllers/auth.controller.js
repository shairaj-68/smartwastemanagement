import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/token.service.js';

export async function registerUser(req, res) {
  const { name, email, password, role = 'citizen', phone = '', address = '' } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ status: 'error', message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    address,
  });

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await user.save();

  return res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function refreshSession(req, res) {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ status: 'error', message: 'Session not found' });
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const newRefreshToken = signRefreshToken(user._id.toString(), user.role);
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'Session refreshed',
    data: { accessToken, refreshToken: newRefreshToken },
  });
}

export async function logoutUser(req, res) {
  const user = await User.findById(req.user._id).select('+refreshTokenHash');
  if (user) {
    user.refreshTokenHash = '';
    await user.save();
  }

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
}

export async function getCurrentUser(req, res) {
  return res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
}
