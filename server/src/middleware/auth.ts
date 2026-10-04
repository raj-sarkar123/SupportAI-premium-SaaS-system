import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config.js"
import prisma from "../lib/prisma.js"

export interface JwtPayload {
  userId: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        role: string
      }
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.[config.cookie.name]

    if (!token) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      res.status(401).json({ message: "User not found" })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" })
      return
    }

    next()
  }
}
