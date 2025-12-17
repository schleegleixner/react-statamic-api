export function isAuthenticated(provided_password, site_id = 'default', is_protected = false) {
    const password_required = site_id === 'preview' ||
        process.env.PASSWORD_PROTECTED === 'true' ||
        is_protected;
    const is_authenticated = !password_required || provided_password === process.env.PASSWORD;
    return is_authenticated;
}
