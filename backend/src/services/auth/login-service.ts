import bcrypt from 'bcrypt'
import { credentialsSchema } from '@/schema/auth.schema'
import { findUser } from '@/repositories/auth.repository'
import { ApiError } from '@/lib/api-error'
import { issueSession } from './issue-session-service'
const dummyHash = bcrypt.hash('constant-time-unmatched-account', 12)
export async function login(input: unknown) {
  const value = credentialsSchema.parse(input),
    user = await findUser(value.email)
  const valid = await bcrypt.compare(value.password, user?.password ?? (await dummyHash))
  if (!user || !user.password || !valid)
    throw new ApiError(401, 'Your email or password is incorrect')
  return issueSession(user)
}
