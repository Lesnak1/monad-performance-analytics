import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { DatabaseService } from '../services/DatabaseService'
import logger from '../utils/logger'
import { authRateLimiter } from '../middleware/rateLimiter'

const router = Router()

// JWT Secret
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h'

// Interface for user data
interface UserData {
  email: string
  password: string
  name?: string
}

interface LoginData {
  email: string
  password: string
}

// Register endpoint
router.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: UserData = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
      return
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user in database (mock implementation for now)
    const dbService = DatabaseService.getInstance()
    
    // Check if user already exists
    const existingUser = await dbService.getUserByEmail(email)
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User already exists with this email'
      })
      return
    }

    // Create new user
    const newUser = await dbService.createUser({
      email,
      passwordHash: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      lastLogin: null
    })

    // Generate JWT with type casting to avoid TypeScript issues
    const payload = { 
      userId: newUser.id, 
      email: newUser.email,
      name: newUser.name
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' } as any)

    logger.info(`New user registered: ${email}`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt
        },
        token
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'Internal server error'
    })
  }
})

// Login endpoint
router.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginData = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
      return
    }

    const dbService = DatabaseService.getInstance()
    
    // Get user from database
    const user = await dbService.getUserByEmail(email)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      logger.warn(`Failed login attempt for: ${email}`, { ip: req.ip })
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Update last login
    await dbService.updateUserLastLogin(user.id)

    // Generate JWT with type casting to avoid TypeScript issues
    const payload = { 
      userId: user.id, 
      email: user.email,
      name: user.name
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' } as any)

    logger.info(`User logged in: ${email}`)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin
        },
        token
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'Internal server error'
    })
  }
})

// Verify token endpoint
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      })
      return
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    const dbService = DatabaseService.getInstance()
    const user = await dbService.getUserById(decoded.userId)
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
      return
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
      return
    }

    logger.error('Token verification error:', error)
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    })
  }
})

// Logout endpoint (client-side token removal)
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove token from client.',
    timestamp: new Date().toISOString()
  })
})

export default router 