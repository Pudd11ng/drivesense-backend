import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const authService = {
  register: async (userData) => {
    const { email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    return await newUser.save();
  },

  login: async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
  },

  validateToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

export default authService;