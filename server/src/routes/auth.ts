import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt, { type SignOptions } from "jsonwebtoken"
import { config } from "../config.js"
import prisma from "../lib/prisma.js"
import { validate } from "../middleware/validate.js"
import { requireWorkspace } from "../middleware/auth.js"
import { signupSchema, loginSchema } from "../validators/auth.js"
import type { JwtPayload } from "../middleware/auth.js"

const router = Router()

function createToken(userId: string, workspaceId: string, role: string): string {
  const payload: JwtPayload = { userId, workspaceId, role }
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  })
}

function setTokenCookie(res: import("express").Response, token: string) {
  res.cookie(config.cookie.name, token, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
    path: "/",
  })
}

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create user, workspace and membership in one prisma.$transaction
    const { user, workspace } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: { id: true, email: true, name: true },
      })

      const newWorkspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          members: {
            create: {
              userId: newUser.id,
              role: "admin",
            },
          },
        },
      })

      return { user: newUser, workspace: newWorkspace }
    })

    const token = createToken(user.id, workspace.id, "admin")
    setTokenCookie(res, token)

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "admin",
        workspaceId: workspace.id,
      },
      workspaceId: workspace.id,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          orderBy: { joinedAt: "asc" },
        },
      },
    })
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    // Return a 403 error if the user has no workspace membership
    const membership = user.workspaces[0]
    if (!membership) {
      res.status(403).json({ message: "User is not a member of any workspace" })
      return
    }

    const workspaceId = membership.workspaceId
    const role = membership.role

    const token = createToken(user.id, workspaceId, role)
    setTokenCookie(res, token)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        workspaceId,
      },
      workspaceId,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie(config.cookie.name, { path: "/" })
  res.json({ message: "Logged out" })
})

// GET /api/auth/me
router.get("/me", requireWorkspace, (req, res) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      name: req.user!.name,
      role: req.memberRole!,
      workspaceId: req.workspaceId!,
    },
    workspaceId: req.workspaceId,
  })
})

export default router
