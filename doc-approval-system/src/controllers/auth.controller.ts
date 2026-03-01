import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userRole = role === 'REVIEWER' || role === 'ADMIN' ? role : 'USER';
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: userRole,
            },
        });

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
