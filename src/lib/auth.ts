import bcrypt from 'bcryptjs'

/**
 * Verify admin password against the stored hash
 * @param password - Plain text password to verify
 * @returns Promise<boolean> - True if password is correct
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
  
  if (!adminPasswordHash) {
    console.error('ADMIN_PASSWORD_HASH environment variable is not set')
    return false
  }
  
  try {
    return await bcrypt.compare(password, adminPasswordHash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Verify admin authentication from request headers
 * @param request - NextRequest object
 * @returns Promise<boolean> - True if authenticated
 */
export async function verifyAdminAuth(request: Request): Promise<boolean> {
  const adminPassword = request.headers.get('x-admin-password')
  
  if (!adminPassword) {
    return false
  }
  
  return await verifyAdminPassword(adminPassword)
}

/**
 * Generate password hash (for setup/migration purposes)
 * @param password - Plain text password
 * @returns Promise<string> - Bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify user password against stored hash
 * @param password - Plain text password to verify
 * @param hash - Stored bcrypt hash
 * @returns Promise<boolean> - True if password is correct
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
} 