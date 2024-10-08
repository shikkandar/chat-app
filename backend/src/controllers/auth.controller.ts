import { Request, Response } from 'express';
import prisma from '../Db/prisma.js';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullname, username, password, confirmPassword, gender } = req.body;

    // Ensure all fields are filled
    if (!fullname || !username || !password || !confirmPassword || !gender) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma?.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate profile pic based on gender
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    const profilePic = gender === 'male' ? boyProfilePic : girlProfilePic;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        fullname,
        username,
        password: hashedPassword,
        gender,
        profilePic
      }
    });

    if (newUser) {
      // Generate JWT token and set it as a cookie
      generateToken(newUser.id, res);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          fullname: newUser.fullname,
          username: newUser.username,
          profilePic: newUser.profilePic
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (error: any) {
    console.error('Error in signup', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login=async (req: Request, res: Response):Promise<void> => {
  try {
    const {username ,password}=req.body;
    const user = await prisma?.user.findUnique({ where: { username } });
    const isPasswordCorrect = user && (await bcryptjs.compare(password, user.password));

    if (!user ||!isPasswordCorrect) {
      res.status(401).json({ error: 'Invalid credentials' });
      return 
    }
    
    generateToken(user.id, res);

    

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        profilePic: user.profilePic
      }
    });
  } catch (error:any) {
    console.error('Error in signup', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}
export const logout=async (req: Request, res: Response) => {
  try {
    res.cookie('jwt',"",{maxAge:0})
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error:any) {
    console.log("Error in logout", error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export const getMe=async (req: Request, res: Response):Promise<void> => {
try {
  const user =await prisma?.user.findUnique({ where: { id: req.user?.id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    user: {
      id: user?.id,
      fullname: user?.fullname,
      username: user?.username,
      profilePic: user?.profilePic
    }
  });
} catch (error:any) {
  console.log("Error in getMe", error.message);
  res.status(500).json({ error: 'Server error' });
}
}