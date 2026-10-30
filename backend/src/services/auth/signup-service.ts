import { hash } from 'bcrypt'
import { signupSchema } from '@/schema/auth.schema'
import { createUser } from '@/repositories/auth.repository'
import { issueSession } from './issue-session-service'
export async function signup(input: unknown) {
  const value = signupSchema.parse(input)
  return issueSession(await createUser(value.email, value.name, await hash(value.password, 12)))
}
