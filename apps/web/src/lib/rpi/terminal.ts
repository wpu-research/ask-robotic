// Tarayıcıda Raspberry Pi OS terminali (benzetim): küçük sanal dosya sistemi + derste öğretilen komutlar.
// Komut çıktıları gerçek Linux'taki gibi İngilizce; yardım ve ipuçları iki dilde. Saf mantık: exec(state, satır) çıktı
// satırlarını döndürür ve durumu yerinde günceller (bileşen durumu ref'te tutar). Ağ, apt ve ssh yalnız benzetimdir.
import type { Lang } from '@/lib/gomulu/types'

export interface FileNode { type: 'file'; content: string; mode: number; owner: 'pi' | 'root' }
export interface DirNode { type: 'dir'; children: Record<string, Node>; mode: number; owner: 'pi' | 'root' }
export type Node = FileNode | DirNode
export interface Service { enabled: boolean; active: boolean; failed?: boolean }
export interface TermState {
  cwd: string
  root: DirNode
  installed: Set<string>
  aptUpdated: boolean
  services: Record<string, Service>
  /** systemd birim dosyaları değişti ama daemon-reload yapılmadı. */
  needsReload: boolean
  history: string[]
}
export interface ExecResult { out: string[]; clear?: boolean; edit?: string }

export const HOME = '/home/pi'
const f = (content: string, mode = 0o644, owner: 'pi' | 'root' = 'pi'): FileNode => ({ type: 'file', content, mode, owner })
const d = (children: Record<string, Node>, owner: 'pi' | 'root' = 'pi', mode = 0o755): DirNode => ({ type: 'dir', children, mode, owner })

export const BLINK_PY = `from gpiozero import LED
from time import sleep

led = LED(17)
print("LED GPIO17 blinking")
while True:
    led.toggle()
    sleep(0.5)
`
export const ROBOT_PY = `from gpiozero import Robot
print("robot ready")
robot = Robot(left=(5, 6), right=(13, 19))
`
export const SERVICE_UNIT = `[Unit]
Description=Exploration robot
After=network-online.target

[Service]
User=pi
WorkingDirectory=/home/pi/robot
ExecStart=/usr/bin/python3 /home/pi/robot/main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
`
/** Gerçek DS18B20 çıktısı biçiminde (CRC'li); 1-Wire ünitesinde açıklanır. */
const W1_SLAVE = `4b 01 4b 46 7f ff 05 10 e1 : crc=e1 YES
4b 01 4b 46 7f ff 05 10 e1 t=20687
`

export function initialState(opts: { withService?: boolean } = {}): TermState {
  const systemd: Record<string, Node> = {}
  if (opts.withService) systemd['robot.service'] = f(SERVICE_UNIT, 0o644, 'root')
  return {
    cwd: HOME,
    root: d({
      home: d({
        pi: d({
          'blink.py': f(BLINK_PY),
          'notes.txt': f('Pi 5: 4 cores, 64-bit Raspberry Pi OS\nGPIO is 3.3 V only!\n'),
          'start.sh': f('#!/bin/bash\necho "starting robot"\npython3 robot/main.py\n'),
          '.bashrc': f('export PATH=$HOME/.local/bin:$PATH\n'),
          robot: d({ 'main.py': f(ROBOT_PY) }),
        }),
      }, 'root'),
      etc: d({ hostname: f('raspberrypi\n', 0o644, 'root'), systemd: d({ system: d(systemd, 'root') }, 'root') }, 'root'),
      boot: d({ firmware: d({ 'config.txt': f('dtparam=i2c_arm=on\ndtparam=spi=on\ndtoverlay=w1-gpio\n', 0o755, 'root') }, 'root') }, 'root'),
      sys: d({ bus: d({ w1: d({ devices: d({ '28-0316a2794c5f': d({ w1_slave: f(W1_SLAVE, 0o444, 'root') }, 'root') }, 'root') }, 'root') }, 'root') }, 'root'),
      tmp: d({}, 'root', 0o777),
      usr: d({ bin: d({ python3: f('', 0o755, 'root'), nano: f('', 0o755, 'root') }, 'root') }, 'root'),
    }, 'root'),
    installed: new Set(['python3', 'python3-gpiozero', 'nano']),
    aptUpdated: false,
    services: { ssh: { enabled: true, active: true } },
    needsReload: false,
    history: [],
  }
}

/** Mutlak yol: ~, ., .. çözülür. */
export function resolvePath(cwd: string, p: string): string {
  if (!p || p === '~') return HOME
  let base = p.startsWith('/') ? '' : cwd
  if (p.startsWith('~/')) { base = HOME; p = p.slice(2) }
  const parts = `${base}/${p}`.split('/').filter(Boolean)
  const out: string[] = []
  for (const s of parts) { if (s === '.') continue; if (s === '..') out.pop(); else out.push(s) }
  return `/${out.join('/')}`
}
export function getNode(st: TermState, path: string): Node | undefined {
  let n: Node = st.root
  for (const s of path.split('/').filter(Boolean)) { if (n.type !== 'dir') return undefined; n = n.children[s]; if (!n) return undefined }
  return n
}
const parentOf = (path: string) => { const i = path.lastIndexOf('/'); return [path.slice(0, i) || '/', path.slice(i + 1)] as const }
export const prettyCwd = (cwd: string) => (cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd)
export const prompt = (st: TermState) => `pi@raspberrypi:${prettyCwd(st.cwd)} $`

/** rwxr-xr-x biçimi. */
export function modeString(n: Node): string {
  const bits = 'rwxrwxrwx'
  let s = n.type === 'dir' ? 'd' : '-'
  for (let i = 8; i >= 0; i--) s += n.mode & (1 << i) ? bits[8 - i] : '-'
  return s
}
const canWrite = (n: Node, sudo: boolean) => sudo || (n.owner === 'pi' ? (n.mode & 0o200) !== 0 : (n.mode & 0o002) !== 0)

/** chmod argümanı: sekizli (755) ya da sembolik (+x, u+x, a-w, go-rwx). */
export function applyChmod(mode: number, spec: string): number | null {
  if (/^[0-7]{3}$/.test(spec)) return parseInt(spec, 8)
  const m = spec.match(/^([ugoa]*)([+-=])([rwx]+)$/)
  if (!m) return null
  const who = m[1] || 'a'
  let mask = 0
  for (const p of m[3]) {
    const b = p === 'r' ? 4 : p === 'w' ? 2 : 1
    if (who.includes('u') || who.includes('a')) mask |= b << 6
    if (who.includes('g') || who.includes('a')) mask |= b << 3
    if (who.includes('o') || who.includes('a')) mask |= b
  }
  if (m[2] === '+') return mode | mask
  if (m[2] === '-') return mode & ~mask
  return mask
}

/** apt'de bilinen paketler (benzetim). */
export const APT_PACKAGES: Record<string, string> = {
  'python3-opencv': 'OpenCV for Python 3',
  'python3-picamera2': 'Python library for the libcamera stack',
  'python3-flask': 'micro web framework',
  'python3-gpiozero': 'simple interface to GPIO devices',
  'i2c-tools': 'i2cdetect, i2cget, i2cset',
  'python3-smbus2': 'pure Python SMBus (I2C)',
  'python3-serial': 'pyserial',
  git: 'fast, scalable, distributed revision control system',
  htop: 'interactive processes viewer',
  nano: 'small, friendly text editor',
}

const HELP: Record<Lang, string[]> = {
  tr: [
    'Bu terminal bir benzetimdir. Komutlar:',
    '  pwd, ls [-l] [-a], cd, cat, echo "metin" > dosya, mkdir, touch, rm, cp, mv',
    '  nano <dosya>   (basit düzenleyici), chmod +x | 755 <dosya>, ./betik.sh',
    '  python3 <dosya.py>, sudo <komut>, apt update, apt install <paket>',
    '  systemctl status|start|stop|enable|disable|restart <servis>, systemctl daemon-reload',
    '  journalctl -u <servis>, i2cdetect -y 1, vcgencmd measure_temp, hostname -I, ssh pi@<ip>',
    '  whoami, uname -a, history, clear',
  ],
  en: [
    'This terminal is a simulation. Commands:',
    '  pwd, ls [-l] [-a], cd, cat, echo "text" > file, mkdir, touch, rm, cp, mv',
    '  nano <file>   (simple editor), chmod +x | 755 <file>, ./script.sh',
    '  python3 <file.py>, sudo <command>, apt update, apt install <package>',
    '  systemctl status|start|stop|enable|disable|restart <service>, systemctl daemon-reload',
    '  journalctl -u <service>, i2cdetect -y 1, vcgencmd measure_temp, hostname -I, ssh pi@<ip>',
    '  whoami, uname -a, history, clear',
  ],
}

/** Kabuk benzeri bölme: tırnaklar korunur. */
export function tokenize(line: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

/** print("...") satırlarından benzetim çıktısı; sonsuz döngülerde ilk birkaç tur gösterilir. */
export function simulatePython(src: string): string[] {
  const out: string[] = []
  const imports = [...src.matchAll(/^\s*(?:from|import)\s+([\w.]+)/gm)].map((m) => m[1])
  for (const mod of imports) if (!['gpiozero', 'time', 'math', 'random', 'os', 'sys', 'json', 'signal', 'flask', 'cv2', 'picamera2', 'smbus2', 'serial', 'datetime'].includes(mod.split('.')[0])) {
    return [`Traceback (most recent call last):`, `ModuleNotFoundError: No module named '${mod}'`]
  }
  for (const m of src.matchAll(/print\((?:f?["'])(.*?)["']\)/g)) out.push(m[1])
  if (/while True:/.test(src)) out.push('^C', 'KeyboardInterrupt')
  return out
}

function writeFile(st: TermState, path: string, content: string, sudo: boolean, append = false): string | null {
  const [dir, name] = parentOf(path)
  const parent = getNode(st, dir)
  if (!parent || parent.type !== 'dir') return `No such file or directory`
  const cur = parent.children[name]
  if (cur?.type === 'dir') return 'Is a directory'
  if (cur ? !canWrite(cur, sudo) : !canWrite(parent, sudo)) return 'Permission denied'
  if (cur) cur.content = append ? cur.content + content : content
  else parent.children[name] = f(content, 0o644, sudo ? 'root' : 'pi')
  if (dir === '/etc/systemd/system') st.needsReload = true
  return null
}
export const saveFile = (st: TermState, path: string, content: string, sudo = false) => writeFile(st, path, content, sudo)

const serviceUnit = (st: TermState, name: string) => getNode(st, `/etc/systemd/system/${name.endsWith('.service') ? name : `${name}.service`}`)
const svcName = (s: string) => s.replace(/\.service$/, '')

function systemctl(st: TermState, args: string[], sudo: boolean, lang: Lang): string[] {
  const [verb, unit] = args
  if (verb === 'daemon-reload') { if (!sudo) return ['Failed to reload daemon: Access denied']; st.needsReload = false; return [] }
  if (!verb) return ['systemctl: missing verb']
  if (!unit) return [`Too few arguments.`]
  const name = svcName(unit)
  const known = st.services[name] ?? (serviceUnit(st, name) ? (st.services[name] = { enabled: false, active: false }) : undefined)
  if (!known) return [`Unit ${name}.service could not be found.`]
  if (verb === 'status') {
    const s = known
    const state = s.failed ? 'failed (Result: exit-code)' : s.active ? 'active (running)' : 'inactive (dead)'
    return [
      `${s.active ? '●' : '○'} ${name}.service`,
      `     Loaded: loaded (/etc/systemd/system/${name}.service; ${s.enabled ? 'enabled' : 'disabled'}; preset: enabled)`,
      `     Active: ${state}`,
      ...(s.active && name === 'robot' ? ['   Main PID: 812 (python3)', `Oct 18 10:00:01 raspberrypi python3[812]: robot ready`] : []),
      ...(st.needsReload ? [lang === 'en' ? 'Warning: the unit file changed on disk. Run \'systemctl daemon-reload\'.' : 'Uyarı: birim dosyası değişti. \'sudo systemctl daemon-reload\' çalıştır.'] : []),
    ]
  }
  if (!sudo) return [`Failed to ${verb} ${name}.service: Interactive authentication required.`, lang === 'en' ? '(hint: use sudo)' : '(ipucu: sudo kullan)']
  if (st.needsReload && name !== 'ssh') return [lang === 'en' ? 'Warning: unit file changed on disk, run daemon-reload first.' : 'Uyarı: birim dosyası değişti, önce daemon-reload çalıştır.']
  switch (verb) {
    case 'start': case 'restart': {
      const unitNode = serviceUnit(st, name)
      const ok = name === 'ssh' || (unitNode?.type === 'file' && /ExecStart=\S+/.test(unitNode.content) && !!getNode(st, unitNode.content.match(/ExecStart=\S+\s+(\S+)/)?.[1] ?? '/x'))
      known.active = ok; known.failed = !ok
      return ok ? [] : [`Job for ${name}.service failed because the control process exited with error code.`, `See "systemctl status ${name}.service" and "journalctl -u ${name}" for details.`]
    }
    case 'stop': known.active = false; known.failed = false; return []
    case 'enable': known.enabled = true; return [`Created symlink /etc/systemd/system/multi-user.target.wants/${name}.service → /etc/systemd/system/${name}.service.`]
    case 'disable': known.enabled = false; return [`Removed "/etc/systemd/system/multi-user.target.wants/${name}.service".`]
    default: return [`Unknown command verb ${verb}.`]
  }
}

/** Bir komut satırını çalıştırır. */
export function exec(st: TermState, raw: string, lang: Lang = 'tr'): ExecResult {
  const line = raw.trim()
  if (!line) return { out: [] }
  st.history.push(line)
  // Yönlendirme: echo "x" > dosya, >> ekler
  const redir = line.match(/^(.*?)\s*(>>?)\s*(\S+)$/)
  let tokens = tokenize(redir ? redir[1] : line)
  let sudo = false
  if (tokens[0] === 'sudo') { sudo = true; tokens = tokens.slice(1); if (!tokens.length) return { out: ['usage: sudo <command>'] } }
  const [cmd, ...args] = tokens
  const out: string[] = []
  const p = (a?: string) => resolvePath(st.cwd, a ?? '.')
  const emit = (text: string[]): ExecResult => {
    if (!redir) return { out: text }
    const err = writeFile(st, p(redir[3]), text.join('\n') + '\n', sudo, redir[2] === '>>')
    return { out: err ? [`bash: ${redir[3]}: ${err}`] : [] }
  }
  switch (cmd) {
    case 'help': return { out: HELP[lang] }
    case 'clear': return { out: [], clear: true }
    case 'pwd': return emit([st.cwd])
    case 'whoami': return emit([sudo ? 'root' : 'pi'])
    case 'hostname': return emit([args[0] === '-I' ? '192.168.1.42 fd00::a1b2' : 'raspberrypi'])
    case 'uname': return emit([args[0] === '-a' ? 'Linux raspberrypi 6.6.51+rpt-rpi-2712 #1 SMP PREEMPT Debian aarch64 GNU/Linux' : 'Linux'])
    case 'vcgencmd': return emit([args[0] === 'measure_temp' ? "temp=48.3'C" : 'usage: vcgencmd measure_temp'])
    case 'history': return emit(st.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`))
    case 'echo': return emit([args.join(' ')])
    case 'ls': {
      const long = args.some((a) => a.startsWith('-') && a.includes('l')), all = args.some((a) => a.startsWith('-') && a.includes('a'))
      const target = args.find((a) => !a.startsWith('-'))
      const n = getNode(st, p(target))
      if (!n) return { out: [`ls: cannot access '${target}': No such file or directory`] }
      const entries: Array<[string, Node]> = n.type === 'dir' ? Object.entries(n.children).filter(([k]) => all || !k.startsWith('.')).sort(([a], [b]) => a.localeCompare(b)) : [[target!, n]]
      if (!long) return emit([entries.map(([k, v]) => (v.type === 'dir' ? `${k}/` : v.mode & 0o100 ? `${k}*` : k)).join('  ')].filter(Boolean))
      return emit(entries.map(([k, v]) => `${modeString(v)} 1 ${v.owner.padEnd(4)} ${v.owner.padEnd(4)} ${String(v.type === 'file' ? v.content.length : 4096).padStart(5)} Oct 18 10:00 ${k}`))
    }
    case 'cd': {
      const target = p(args[0] ?? '~')
      const n = getNode(st, target)
      if (!n) return { out: [`bash: cd: ${args[0]}: No such file or directory`] }
      if (n.type !== 'dir') return { out: [`bash: cd: ${args[0]}: Not a directory`] }
      st.cwd = target
      return { out: [] }
    }
    case 'cat': {
      if (!args.length) return { out: ['cat: missing operand'] }
      for (const a of args) {
        const n = getNode(st, p(a))
        if (!n) out.push(`cat: ${a}: No such file or directory`)
        else if (n.type === 'dir') out.push(`cat: ${a}: Is a directory`)
        else out.push(...n.content.replace(/\n$/, '').split('\n'))
      }
      return emit(out)
    }
    case 'mkdir': case 'touch': {
      if (!args.length) return { out: [`${cmd}: missing operand`] }
      for (const a of args.filter((x) => !x.startsWith('-'))) {
        const path = p(a), [dir, name] = parentOf(path), parent = getNode(st, dir)
        if (!parent || parent.type !== 'dir') { out.push(`${cmd}: cannot create '${a}': No such file or directory`); continue }
        if (parent.children[name]) { if (cmd === 'mkdir') out.push(`mkdir: cannot create directory '${a}': File exists`); continue }
        if (!canWrite(parent, sudo)) { out.push(`${cmd}: cannot create '${a}': Permission denied`); continue }
        parent.children[name] = cmd === 'mkdir' ? d({}, sudo ? 'root' : 'pi') : f('', 0o644, sudo ? 'root' : 'pi')
        if (dir === '/etc/systemd/system') st.needsReload = true
      }
      return { out }
    }
    case 'rm': {
      const rec = args.some((a) => /^-\w*r/.test(a))
      for (const a of args.filter((x) => !x.startsWith('-'))) {
        const path = p(a), [dir, name] = parentOf(path), parent = getNode(st, dir) as DirNode | undefined, n = getNode(st, path)
        if (!n || !parent) { out.push(`rm: cannot remove '${a}': No such file or directory`); continue }
        if (n.type === 'dir' && !rec) { out.push(`rm: cannot remove '${a}': Is a directory`); continue }
        if (!canWrite(parent, sudo)) { out.push(`rm: cannot remove '${a}': Permission denied`); continue }
        delete parent.children[name]
      }
      return { out }
    }
    case 'cp': case 'mv': {
      const [a, b] = args
      const src = a ? getNode(st, p(a)) : undefined
      if (!a || !b) return { out: [`${cmd}: missing file operand`] }
      if (!src || src.type !== 'file') return { out: [`${cmd}: cannot stat '${a}': No such file or directory`] }
      let dst = p(b)
      const dn = getNode(st, dst)
      if (dn?.type === 'dir') dst = `${dst}/${parentOf(p(a))[1]}`
      const err = writeFile(st, dst, src.content, sudo)
      if (err) return { out: [`${cmd}: cannot create regular file '${b}': ${err}`] }
      if (cmd === 'mv') { const [dir, name] = parentOf(p(a)); delete (getNode(st, dir) as DirNode).children[name] }
      return { out: [] }
    }
    case 'chmod': {
      const [spec, target] = args
      if (!spec || !target) return { out: ['chmod: missing operand'] }
      const n = getNode(st, p(target))
      if (!n) return { out: [`chmod: cannot access '${target}': No such file or directory`] }
      if (n.owner === 'root' && !sudo) return { out: [`chmod: changing permissions of '${target}': Operation not permitted`] }
      const m = applyChmod(n.mode, spec)
      if (m === null) return { out: [`chmod: invalid mode: '${spec}'`] }
      n.mode = m
      return { out: [] }
    }
    case 'nano': {
      if (!args[0]) return { out: ['nano: missing file'] }
      const path = p(args[0]), n = getNode(st, path)
      if (n?.type === 'dir') return { out: [`nano: ${args[0]} is a directory`] }
      const [dir] = parentOf(path), parent = getNode(st, dir)
      if (!parent || parent.type !== 'dir') return { out: [`nano: ${dir}: No such file or directory`] }
      if ((n && !canWrite(n, sudo)) || (!n && !canWrite(parent, sudo))) return { out: [lang === 'en' ? `[ ${args[0]} is read-only: open with sudo nano to save ]` : `[ ${args[0]} salt okunur: kaydetmek için sudo nano ile aç ]`], edit: `ro:${path}` }
      return { out: [], edit: `${sudo ? 'sudo:' : ''}${path}` }
    }
    case 'python3': case 'python': {
      if (!args[0]) return { out: ['Python 3.11.2 (main) [GCC 12.2.0] on linux', lang === 'en' ? '(interactive mode is not simulated; run a file: python3 blink.py)' : '(etkileşimli kip benzetilmiyor; bir dosya çalıştır: python3 blink.py)'] }
      if (args[0] === '--version' || args[0] === '-V') return emit(['Python 3.11.2'])
      const n = getNode(st, p(args[0]))
      if (!n || n.type !== 'file') return { out: [`python3: can't open file '${p(args[0])}': [Errno 2] No such file or directory`] }
      return emit(simulatePython(n.content))
    }
    case 'apt': case 'apt-get': {
      const [verb, ...pkgs] = args
      if (verb !== 'update' && verb !== 'install' && verb !== 'upgrade' && verb !== 'remove') return { out: ['apt: usage: apt update | apt install <package>'] }
      if (!sudo) return { out: ['E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)', 'E: Unable to acquire the dpkg frontend lock, are you root?'] }
      if (verb === 'update') { st.aptUpdated = true; return { out: ['Hit:1 http://deb.debian.org/debian bookworm InRelease', 'Hit:2 http://archive.raspberrypi.com/debian bookworm InRelease', 'Reading package lists... Done', 'All packages are up to date.'] } }
      if (verb === 'upgrade') return { out: ['Reading package lists... Done', '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.'] }
      for (const pkg of pkgs.filter((x) => !x.startsWith('-'))) {
        if (!APT_PACKAGES[pkg]) { out.push(`E: Unable to locate package ${pkg}`); continue }
        if (verb === 'remove') { st.installed.delete(pkg); out.push(`Removing ${pkg} ...`); continue }
        if (st.installed.has(pkg)) { out.push(`${pkg} is already the newest version.`); continue }
        if (!st.aptUpdated) out.push(lang === 'en' ? 'W: package lists are old; run sudo apt update first (installing anyway in the simulation)' : 'W: paket listesi eski; önce sudo apt update (benzetimde yine de kuruluyor)')
        st.installed.add(pkg)
        out.push(`Setting up ${pkg} (${APT_PACKAGES[pkg]}) ...`)
      }
      return { out }
    }
    case 'systemctl': return { out: systemctl(st, args, sudo, lang) }
    case 'journalctl': {
      const name = svcName(args[args.indexOf('-u') + 1] ?? '')
      const s = st.services[name]
      if (!s) return { out: ['-- No entries --'] }
      return { out: s.failed ? [`Oct 18 10:00:01 raspberrypi systemd[1]: ${name}.service: Main process exited, code=exited, status=2/INVALIDARGUMENT`, `Oct 18 10:00:01 raspberrypi systemd[1]: ${name}.service: Failed with result 'exit-code'.`] : s.active ? [`Oct 18 10:00:01 raspberrypi systemd[1]: Started ${name}.service.`, `Oct 18 10:00:01 raspberrypi python3[812]: robot ready`] : ['-- No entries --'] }
    }
    case 'i2cdetect': {
      if (!st.installed.has('i2c-tools')) return { out: ['bash: i2cdetect: command not found', lang === 'en' ? '(hint: sudo apt install i2c-tools)' : '(ipucu: sudo apt install i2c-tools)'] }
      return emit(i2cdetectLines([0x3c, 0x76]))
    }
    case 'ssh': {
      if (!args[0]) return { out: ['usage: ssh user@host'] }
      return { out: lang === 'en'
        ? [`(simulation) ssh ${args[0]}: an encrypted shell on another machine over port 22.`, 'In real life: ssh pi@raspberrypi.local from your laptop, accept the host key once, then log in with a key (ssh-copy-id) instead of a password.']
        : [`(benzetim) ssh ${args[0]}: başka bir makinede 22 numaralı port üzerinden şifreli kabuk.`, 'Gerçekte: dizüstünden ssh pi@raspberrypi.local, ana bilgisayar anahtarını bir kez onayla, sonra parola yerine anahtarla gir (ssh-copy-id).'] }
    }
    default: {
      if (cmd.startsWith('./') || cmd.startsWith('/')) {
        const n = getNode(st, p(cmd))
        if (!n) return { out: [`bash: ${cmd}: No such file or directory`] }
        if (n.type === 'dir') return { out: [`bash: ${cmd}: Is a directory`] }
        if (!(n.mode & 0o100)) return { out: [`bash: ${cmd}: Permission denied`, lang === 'en' ? '(hint: chmod +x first)' : '(ipucu: önce chmod +x)'] }
        if (n.content.startsWith('#!/usr/bin/env python3') || cmd.endsWith('.py')) return emit(simulatePython(n.content))
        const lines: string[] = []
        for (const l of n.content.split('\n')) {
          const e = l.match(/^\s*echo\s+["']?(.*?)["']?\s*$/)
          if (e) lines.push(e[1])
          const py = l.match(/^\s*python3\s+(\S+)/)
          if (py) { const pn = getNode(st, resolvePath(st.cwd, py[1])); lines.push(...(pn?.type === 'file' ? simulatePython(pn.content) : [`python3: can't open file '${py[1]}'`])) }
        }
        return emit(lines)
      }
      return { out: [`bash: ${cmd}: command not found`] }
    }
  }
}

/** i2cdetect -y 1 çıktısı (gerçek biçimde). */
export function i2cdetectLines(addrs: number[]): string[] {
  const rows = ['     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f']
  for (let r = 0; r < 8; r++) {
    let s = `${(r * 16).toString(16).padStart(2, '0')}:`
    for (let c = 0; c < 16; c++) {
      const a = r * 16 + c
      s += a < 0x03 || a > 0x77 ? '   ' : addrs.includes(a) ? ` ${a.toString(16).padStart(2, '0')}` : ' --'
    }
    rows.push(s.trimEnd())
  }
  return rows
}

/** "Kendin dene" görevleri: durum üzerinde doğrulanır. */
export interface TermTask { id: string; tr: string; en: string; done: (st: TermState) => boolean }
const isExec = (st: TermState, path: string) => { const n = getNode(st, path); return !!n && (n.mode & 0o100) !== 0 }
export const TERM_TASKS: Record<'linux' | 'systemd', TermTask[]> = {
  linux: [
    { id: 'dir', tr: '~/robot/logs klasörünü oluştur (mkdir)', en: 'Create the ~/robot/logs folder (mkdir)', done: (st) => getNode(st, `${HOME}/robot/logs`)?.type === 'dir' },
    { id: 'note', tr: 'echo ile ~/robot/logs/ilk.txt dosyasına bir satır yaz', en: 'Write a line to ~/robot/logs/first.txt with echo', done: (st) => { const n = getNode(st, `${HOME}/robot/logs`); return n?.type === 'dir' && Object.values(n.children).some((c) => c.type === 'file' && c.content.trim().length > 0) } },
    { id: 'chmod', tr: 'start.sh betiğini çalıştırılabilir yap (chmod +x)', en: 'Make start.sh executable (chmod +x)', done: (st) => isExec(st, `${HOME}/start.sh`) },
    { id: 'apt', tr: 'i2c-tools paketini kur (sudo apt install)', en: 'Install the i2c-tools package (sudo apt install)', done: (st) => st.installed.has('i2c-tools') },
    { id: 'cv', tr: 'python3-opencv paketini de kur', en: 'Install python3-opencv as well', done: (st) => st.installed.has('python3-opencv') },
  ],
  systemd: [
    { id: 'unit', tr: '/etc/systemd/system/robot.service birim dosyasını yaz (sudo nano)', en: 'Write the /etc/systemd/system/robot.service unit file (sudo nano)', done: (st) => { const n = getNode(st, '/etc/systemd/system/robot.service'); return n?.type === 'file' && /ExecStart=/.test(n.content) && /WantedBy=/.test(n.content) } },
    { id: 'reload', tr: 'systemd\'ye yeni dosyayı okut (daemon-reload)', en: 'Make systemd read the new file (daemon-reload)', done: (st) => !!getNode(st, '/etc/systemd/system/robot.service') && !st.needsReload },
    { id: 'enable', tr: 'Servisi açılışta başlayacak şekilde etkinleştir', en: 'Enable the service at boot', done: (st) => !!st.services.robot?.enabled },
    { id: 'start', tr: 'Servisi şimdi başlat ve durumunu kontrol et', en: 'Start the service now and check its status', done: (st) => !!st.services.robot?.active },
  ],
}
