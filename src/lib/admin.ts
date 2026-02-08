export function isAdminUser(userId: string | null | undefined) {
  const adminId = process.env.ADMIN_CLERK_USER_ID;
  if (!adminId || !userId) return false;
  return userId === adminId;
}
