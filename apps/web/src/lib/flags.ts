/** Hesaplar varsayılan açık; kapatmak için ortamda AUTH_ENABLED=false ver. Dersler girişsiz (misafir) de açılır. */
export const authEnabled = () => process.env.AUTH_ENABLED !== 'false'
