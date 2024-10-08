import express, { Router } from 'express';
import { login, logout, signup ,getMe } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';


const router =Router();

router.get('/me',protectRoute, getMe);
router.post('/login', login);
router.post('/logout', logout);
router.post('/register',signup);

export default router;