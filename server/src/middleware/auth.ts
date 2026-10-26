import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config.js"
import prisma from "../lib/prisma.js"

export interface JwtPayload {
  userId: string
  workspaceId?: string
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
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      res.status(401).json({ message: "User not found" })
      return
    }

    req.user = {
      ...user,
      role: payload.role,
    }
    req.workspaceId = payload.workspaceId
    req.memberRole = payload.role
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

export async function loadWorkspaceMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    const headerWorkspaceId = Array.isArray(req.headers["x-workspace-id"])
      ? req.headers["x-workspace-id"][0]
      : req.headers["x-workspace-id"]

    const paramWorkspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId

    const targetWorkspaceId: string | undefined =
      headerWorkspaceId ||
      (typeof req.query.workspaceId === "string" ? req.query.workspaceId : undefined) ||
      paramWorkspaceId ||
      req.workspaceId

    let member = null
    if (targetWorkspaceId) {
      member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: targetWorkspaceId,
            userId: req.user.id,
          },
        },
      })
    }

    if (!member) {
      member = await prisma.workspaceMember.findFirst({
        where: { userId: req.user.id },
        orderBy: { joinedAt: "asc" },
      })
    }

    if (!member) {
      res.status(403).json({ message: "No workspace membership found" })
      return
    }

    req.workspaceId = member.workspaceId
    req.memberRole = member.role
    if (req.user) {
      req.user.role = member.role
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const loadWorkspace = loadWorkspaceMembership

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    let role = req.memberRole
    if (!role) {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: req.user.id,
          ...(req.workspaceId ? { workspaceId: req.workspaceId } : {}),
        },
      })
      if (member) {
        req.workspaceId = member.workspaceId
        req.memberRole = member.role
        role = member.role
      }
    }

    if (!role || !roles.includes(role)) {
      res.status(403).json({ message: "Insufficient permissions" })
      return
    }

    next()
  }
}
