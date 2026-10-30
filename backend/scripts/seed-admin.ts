import { hash, compare } from 'bcrypt'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase, closeDatabase } from '../src/db'
import { users } from '../src/db/schema'
import { credentialsSchema } from '../src/schema/auth.schema'
async function main() {
  let source = ''
  for await (const chunk of process.stdin) source += chunk
  const input = credentialsSchema.parse(JSON.parse(source)),
    db = getDatabase()
  const [existing] = await db.select().from(users).where(eq(users.email, input.email))
  if (existing) {
    if (
      existing.role !== 'ADMIN' ||
      !existing.password ||
      !(await compare(input.password, existing.password))
    )
      throw new Error('Existing account differs; refusing to overwrite it')
    console.log('Requested admin already exists.')
    return
  }
  await db
    .insert(users)
    .values({
      email: input.email,
      name: 'Administrator',
      role: 'ADMIN',
      password: await hash(input.password, 12),
    })
  console.log('Admin created. No business records inserted.')
}
main()
  .catch((error) => {
    console.error(
      error instanceof z.ZodError
        ? 'Invalid administrator credentials.'
        : 'Admin setup failed; existing accounts were preserved.',
    )
    process.exitCode = 1
  })
  .finally(closeDatabase)
