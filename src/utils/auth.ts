export async function isAuthenticated(
  password: string,
  site_id: string = 'default',
) {
  const password_required =
    site_id === 'preview' || process.env.PASSWORD_PROTECTED === 'true'
  const is_authenticated =
    !password_required || password === process.env.PASSWORD

  return is_authenticated
}
