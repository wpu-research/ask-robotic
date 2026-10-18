// Flask web kontrol paneli benzetimi: Pi'de çalışan küçük bir HTTP sunucusunun yönlendirme mantığı (Flask'taki
// @app.route ile aynı sözleşme), girdi doğrulama ve güvenlik bekçisi (watchdog): komut kesilirse robot durur.

export type Cmd = 'forward' | 'back' | 'left' | 'right' | 'stop'
export interface Req { method: 'GET' | 'POST'; path: string; body?: Record<string, unknown>; token?: string }
export interface Res { status: number; body: Record<string, unknown> | string }
export interface RobotState { cmd: Cmd; speed: number; lastCmdAt: number; stoppedByWatchdog: boolean }
export const CMDS: Cmd[] = ['forward', 'back', 'left', 'right', 'stop']
export const WATCHDOG_S = 1
export const newRobot = (): RobotState => ({ cmd: 'stop', speed: 0, lastCmdAt: 0, stoppedByWatchdog: false })

/** İstek işle: GET / panel, GET /api/status, POST /api/drive {cmd, speed}. Yetki: başlıkta belirteç (isteğe bağlı). */
export function handle(st: RobotState, req: Req, now: number, requireToken?: string): Res {
  if (req.path === '/' && req.method === 'GET') return { status: 200, body: '<html>… panel …</html>' }
  if (req.path === '/api/status') {
    if (req.method !== 'GET') return { status: 405, body: { error: 'method not allowed' } }
    return { status: 200, body: { cmd: st.cmd, speed: st.speed, watchdog: st.stoppedByWatchdog } }
  }
  if (req.path === '/api/drive') {
    if (req.method !== 'POST') return { status: 405, body: { error: 'method not allowed' } }
    if (requireToken && req.token !== requireToken) return { status: 401, body: { error: 'unauthorized' } }
    const cmd = req.body?.cmd, speed = req.body?.speed ?? 0.5
    if (typeof cmd !== 'string' || !CMDS.includes(cmd as Cmd)) return { status: 400, body: { error: 'cmd must be one of ' + CMDS.join('|') } }
    if (typeof speed !== 'number' || !(speed >= 0 && speed <= 1)) return { status: 400, body: { error: 'speed must be 0..1' } }
    st.cmd = cmd as Cmd; st.speed = cmd === 'stop' ? 0 : speed; st.lastCmdAt = now; st.stoppedByWatchdog = false
    return { status: 200, body: { ok: true, cmd: st.cmd, speed: st.speed } }
  }
  return { status: 404, body: { error: 'not found' } }
}

/** Bekçi: son komuttan WATCHDOG_S saniye geçtiyse dur. Tarayıcı basılı tutulan düğme için komutu tekrar yollar. */
export function watchdog(st: RobotState, now: number, enabled: boolean): boolean {
  if (enabled && st.cmd !== 'stop' && now - st.lastCmdAt > WATCHDOG_S) { st.cmd = 'stop'; st.speed = 0; st.stoppedByWatchdog = true; return true }
  return false
}
/** Komut → tekerlek görev oranları (sol, sağ). */
export function cmdToWheels(cmd: Cmd, speed: number): [number, number] {
  switch (cmd) {
    case 'forward': return [speed, speed]
    case 'back': return [-speed, -speed]
    case 'left': return [-speed * 0.6, speed * 0.6]
    case 'right': return [speed * 0.6, -speed * 0.6]
    case 'stop': return [0, 0]
  }
}
