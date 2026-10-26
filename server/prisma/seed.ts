import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

if (process.env.NODE_ENV === "production") {
  console.error("❌ Refusing to run seed in production (NODE_ENV=production)")
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to run seed in production (NODE_ENV=production)")
    process.exit(1)
  }

  const email = "admin@supportai.demo"
  const password = "Password123!"
  const passwordHash = await bcrypt.hash(password, 12)

  console.log("Seeding database...")

  // Upsert demo admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo Admin",
      passwordHash,
    },
    create: {
      email,
      name: "Demo Admin",
      passwordHash,
    },
  })

  // Find or create demo workspace
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  })

  let workspace
  if (member) {
    workspace = member.workspace
    if (member.role !== "admin") {
      await prisma.workspaceMember.update({
        where: { id: member.id },
        data: { role: "admin" },
      })
    }
  } else {
    workspace = await prisma.workspace.create({
      data: {
        name: "Acme Support Workspace",
        members: {
          create: {
            userId: user.id,
            role: "admin",
          },
        },
      },
    })
  }

  console.log("✅ Seed completed successfully!")
  console.log(`👤 Demo Admin User: ${user.email} (Password: ${password})`)
  console.log(`🏢 Workspace: ${workspace.name} (ID: ${workspace.id})`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
