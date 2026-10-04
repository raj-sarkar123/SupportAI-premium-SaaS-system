import type { Request, Response, NextFunction } from "express"
import { ZodError, type ZodSchema } from "zod"

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(", ")
        res.status(400).json({ message })
        return
      }
      next(error)
    }
  }
}
