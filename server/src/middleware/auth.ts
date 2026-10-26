import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config.js"
import prisma from "../lib/prisma.js"

export interface JwtPayload {
  userId: string
  workspaceId: string
  role?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        role?: string
      }
      workspaceId?: string
      memberRole?: string
    }
  }
}

export async function requireWorkspace(
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

    let payload: JwtPayload
    try {
      payload = jwt.verify(token, config.jwt.secret) as JwtPayload
    } catch {
      res.status(401).json({ message: "Invalid or expired token" })
      return
    }

    if (!payload.userId || !payload.workspaceId) {
      res.status(401).json({ message: "Invalid token payload" })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      res.status(401).json({ message: "User not found" })
      return
    }

    // Load the user's membership from the database for the workspace in the token
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: payload.workspaceId,
          userId: user.id,
        },
      },
    })

    // Return 403 if the user is not a member
    if (!member) {
      res.status(403).json({ message: "Not a member of this workspace" })
      return
    }

    req.user = {
      ...user,
      role: member.role,
    }
    req.workspaceId = member.workspaceId
    req.memberRole = member.role

    next()
  } catch (error) {
    next(error)
  }
}

// Aliases for backwards compatibility
export const authenticate = requireWorkspace
export const loadWorkspaceMembership = requireWorkspace
export const loadWorkspace = requireWorkspace

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.memberRole) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    // Must use req.memberRole loaded from the database, never the JWT role
    if (!roles.includes(req.memberRole)) {
      res.status(403).json({ message: "Insufficient permissions" })
      return
    }

    next()
  }
}
