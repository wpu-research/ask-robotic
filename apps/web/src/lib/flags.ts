/** Giriş/kayıt şimdilik kapalı. Açmak için ortamda AUTH_ENABLED=true ver (kod ve API yerinde duruyor). */
export const authEnabled = () => process.env.AUTH_ENABLED === 'true'
