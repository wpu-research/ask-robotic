// Ders kodu blokları (TR/EN, satır sayıları eşit). Python parçaları yalnız standart kütüphaneyle çalışır; yazılırken çalıştırılıp
// değerleri doğrulandı (HOME TCP = (0,675; 0; 0,5697) m, ters kinematik 30° ve 60°). ArmScript blokları samples.ts'ten gelir
// ve testlerde yorumlayıcıdan geçer.
import type { CodeBlock } from '@/lib/robotik/course'
import { sampleSrc, type Lang, type SampleId } from './samples'

const T = (lang: Lang, tr: string, en: string) => (lang === 'en' ? en : tr)

export const armscriptBlock = (id: SampleId, lang: Lang, tr: string, en: string): CodeBlock => ({ title: `ArmScript: ${T(lang, tr, en)}`, src: sampleSrc(id, lang) })

export const fkPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: ileri kinematik (dönüş matrisleri)', 'Python: forward kinematics (rotation matrices)'),
  src: `import math
def rz(a): c, s = math.cos(a), math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]
def ry(a): c, s = math.cos(a), math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]
def mm(A, B): return [[sum(A[i][k] * B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
def mv(A, v): return [sum(A[i][k] * v[k] for k in range(3)) for i in range(3)]
D1, A2, A3, D6, TOOL = 0.4, 0.45, 0.45, 0.1, 0.12   ${T(lang, '# uzuv ölçüleri (m)', '# link lengths (m)')}
def fk(q):                                          ${T(lang, '# q: altı eklem açısı, radyan', '# q: six joint angles, radians')}
    R2 = mm(rz(q[0]), ry(q[1]))                     ${T(lang, '# omuz: taban dönüşü sonra eğilme', '# shoulder: base turn, then tilt')}
    R3 = mm(R2, ry(q[2]))                           ${T(lang, '# dirsek', '# elbow')}
    R6 = mm(mm(mm(R3, rz(q[3])), ry(q[4])), rz(q[5]))   ${T(lang, '# küresel bilek: roll-pitch-roll', '# spherical wrist: roll-pitch-roll')}
    shoulder = [0, 0, D1]
    elbow = [a + b for a, b in zip(shoulder, mv(R2, [0, 0, A2]))]
    wrist = [a + b for a, b in zip(elbow, mv(R3, [0, 0, A3]))]
    tcp = [a + b for a, b in zip(wrist, mv(R6, [0, 0, D6 + TOOL]))]
    return tcp, R6
print(fk([math.radians(x) for x in (0, 30, 60, 0, 90, 0)])[0])   ${T(lang, '# [0.675, 0.0, 0.5697...]', '# [0.675, 0.0, 0.5697...]')}`,
})

export const planarIkPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: ters kinematiğin düzlemsel kısmı (omuz ve dirsek)', 'Python: the planar part of inverse kinematics (shoulder and elbow)'),
  src: `import math
A2, A3 = 0.45, 0.45
def planar_ik(r, z, elbow_up=True):
    # r: ${T(lang, 'bilek merkezinin eksenden yatay uzaklığı, z: omuza göre yükseklik', 'horizontal distance of the wrist centre from the axis, z: height above the shoulder')}
    c3 = (r * r + z * z - A2 * A2 - A3 * A3) / (2 * A2 * A3)
    if abs(c3) > 1:
        return None                      ${T(lang, '# erişilemez', '# out of reach')}
    q3 = math.acos(c3) * (1 if elbow_up else -1)
    q2 = math.atan2(r, z) - math.atan2(A3 * math.sin(q3), A2 + A3 * math.cos(q3))
    return q2, q3
print([round(math.degrees(x)) for x in planar_ik(0.675, 0.39)])          ${T(lang, '# [30, 60] dirsek yukarı', '# [30, 60] elbow up')}
print([round(math.degrees(x)) for x in planar_ik(0.675, 0.39, False)])   ${T(lang, '# [90, -60] dirsek aşağı', '# [90, -60] elbow down')}`,
})

export const trapezoidPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: yamuk hız profilinin süresi ve eşzamanlı PTP', 'Python: duration of a trapezoidal profile and synchronised PTP'),
  src: `import math
def trapezoid(d, v, a):
    if d <= 0: return 0.0
    if d <= v * v / a:                   ${T(lang, '# hız tavana varamadan yavaşlar: üçgen', '# never reaches top speed: triangle')}
        return 2 * math.sqrt(d / a)
    return d / v + v / a                 ${T(lang, '# hızlan + sabit + yavaşla', '# accelerate + cruise + decelerate')}
VMAX, AMAX = [2.0, 2.0, 2.5, 3.5, 3.5, 5.0], 6
def ptp_time(q0, q1):
    ts = [trapezoid(abs(b - a), VMAX[i], AMAX) for i, (a, b) in enumerate(zip(q0, q1))]
    return max(ts)                       ${T(lang, '# en yavaş eklem süreyi belirler, hepsi aynı anda varır', '# the slowest joint sets the time, all arrive together')}
print(trapezoid(2, 1, 4), round(trapezoid(0.1, 1, 4), 3))   ${T(lang, '# 2.25  0.316', '# 2.25  0.316')}`,
})

export const segBoxPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: uzuv (doğru parçası) ile kutu çarpışması', 'Python: link (line segment) against box collision'),
  src: `def seg_hits_box(a, b, lo, hi, pad):
    t0, t1 = 0.0, 1.0                    ${T(lang, '# doğru parçasının kutu içinde kaldığı [t0, t1] aralığı', '# the interval [t0, t1] where the segment is inside the box')}
    for i in range(3):
        d = b[i] - a[i]
        l, h = lo[i] - pad, hi[i] + pad  ${T(lang, '# kutuyu uzuv yarıçapı kadar şişir', '# grow the box by the link radius')}
        if abs(d) < 1e-12:
            if a[i] < l or a[i] > h:
                return False
            continue
        u, v = (l - a[i]) / d, (h - a[i]) / d
        if u > v:
            u, v = v, u
        t0, t1 = max(t0, u), min(t1, v)
        if t0 > t1:
            return False
    return True
print(seg_hits_box((-1, .5, .5), (2, .5, .5), (0, 0, 0), (1, 1, 1), 0))      ${T(lang, '# True: içinden geçer', '# True: passes through')}
print(seg_hits_box((-1, 1.05, .5), (2, 1.05, .5), (0, 0, 0), (1, 1, 1), 0))  ${T(lang, '# False: yanından geçer', '# False: passes beside')}`,
})

export const rrtPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: RRT-Connect (2B oyuncak dünyada)', 'Python: RRT-Connect (in a 2D toy world)'),
  src: `import math, random
def rrt_connect(start, goal, free, step=0.1, iters=2000, lo=(0, 0), hi=(1, 1)):
    def dist(p, q): return math.hypot(p[0] - q[0], p[1] - q[1])
    def toward(p, q):
        d = dist(p, q)
        return q if d <= step else (p[0] + (q[0] - p[0]) * step / d, p[1] + (q[1] - p[1]) * step / d)
    def edge_free(p, q):                 ${T(lang, '# kenarı küçük adımlarla denetle', '# check the edge in small steps')}
        n = max(1, int(dist(p, q) / 0.02))
        return all(free((p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n)) for i in range(n + 1))
    def extend(tree, target):
        i = min(range(len(tree)), key=lambda k: dist(tree[k][0], target))
        q = toward(tree[i][0], target)
        if not edge_free(tree[i][0], q):
            return None
        tree.append((q, i))
        return len(tree) - 1
    def chain(tree, i):
        out = []
        while i is not None:
            out.append(tree[i][0]); i = tree[i][1]
        return out
    a, b = [(start, None)], [(goal, None)]   ${T(lang, '# biri başlangıçtan, biri hedeften büyür', '# one grows from the start, one from the goal')}
    for _ in range(iters):
        ia = extend(a, (random.uniform(lo[0], hi[0]), random.uniform(lo[1], hi[1])))
        if ia is not None:
            while True:                  ${T(lang, '# öbür ağacı yeni düğüme doğru ısrarla uzat', '# keep extending the other tree toward the new node')}
                ib = extend(b, a[ia][0])
                if ib is None: break
                if dist(b[ib][0], a[ia][0]) < 1e-9:
                    path = chain(a, ia)[::-1] + chain(b, ib)[1:]
                    return path if a[0][0] == start else path[::-1]
        a, b = b, a                      ${T(lang, '# ağaçların rolünü değiştir', '# swap the roles of the trees')}
    return None
random.seed(1)
wall = lambda p: not (0.45 < p[0] < 0.55 and p[1] < 0.8)
print(len(rrt_connect((0.1, 0.2), (0.9, 0.2), wall)))   ${T(lang, '# 25 nokta (tohum 1)', '# 25 points (seed 1)')}`,
})

export const safetyPy = (lang: Lang): CodeBlock => ({
  title: T(lang, 'Python: hız ve mesafe izleme (basit)', 'Python: speed and separation monitoring (simple)'),
  src: `SLOW, STOP, SLOW_SCALE = 0.8, 0.4, 0.25   ${T(lang, '# ders eşikleri (m, oran)', '# course thresholds (m, ratio)')}
def speed_scale(human_dist, e_stop=False):
    if e_stop: return 0.0                ${T(lang, '# acil durdurma her şeyden önce', '# the emergency stop comes first')}
    if human_dist is None: return 1.0    ${T(lang, '# hücrede kimse yok', '# nobody in the cell')}
    if human_dist <= STOP: return 0.0
    if human_dist <= SLOW: return SLOW_SCALE
    return 1.0
print([speed_scale(d) for d in (None, 2.0, 0.8, 0.5, 0.4, 0.1)])   ${T(lang, '# [1.0, 1.0, 0.25, 0.25, 0.0, 0.0]', '# [1.0, 1.0, 0.25, 0.25, 0.0, 0.0]')}
print(speed_scale(5, e_stop=True))                                  ${T(lang, '# 0.0', '# 0.0')}`,
})

export const hostTs = (lang: Lang): CodeBlock => ({
  title: T(lang, 'TypeScript: ArmScript\'i tarayıcıda çalıştırmak', 'TypeScript: running ArmScript in the browser'),
  src: `import { describeError, runProgram } from '@/lib/robot-kolu/armscript'
import { defaultCell } from '@/lib/robot-kolu/cell'
const src = 'ptp pose(0.5, 0.2, 0.3)\\nprint here()'
const r = runProgram(src, { cell: defaultCell(false) })   ${T(lang, '// saf işlev: ağ yok, eval yok', '// a pure function: no network, no eval')}
if (!r.ok) console.log(describeError(r.error!, '${lang}'))   ${T(lang, '// satır numaralı hata', '// error with a line number')}
else console.log(r.output, r.duration.toFixed(2), 's')       ${T(lang, '// çıktı ve benzetim süresi', '// output and simulated time')}`,
})
