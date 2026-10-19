// İnsansı robot: ileri ve ters kinematiğin Python ve C++ karşılıkları (sayfada gösterilir; kinematik.ts ile aynı denklemler).

export const PY_SNIPPET = `import math

L1, L2 = 0.16, 0.16  # uyluk ve baldır boyu (m) / thigh and shank length

def leg_fk(hip_pitch, knee, hip_roll=0.0):
    """Kalçaya göre bilek konumu (x ileri, y yana, z yukarı). Açılar derece.
    Ankle position relative to the hip. Angles in degrees."""
    th, tk, r = map(math.radians, (hip_pitch, knee, hip_roll))
    x = L1 * math.sin(th) + L2 * math.sin(th - tk)
    zp = -L1 * math.cos(th) - L2 * math.cos(th - tk)
    # yuvarlanma: bacak düzlemini x ekseni etrafında döndür / roll about x
    return x, -zp * math.sin(r), zp * math.cos(r)

def leg_ik(x, y, z):
    """İki bağlı ters kinematik; diz geriye bükülür, taban yere paralel kalır.
    Two-link IK; knee bends backwards, the sole stays parallel to the ground."""
    roll = math.atan2(y, -z)
    zp = -math.hypot(y, z)
    d = min(math.hypot(x, zp), L1 + L2 - 1e-6)
    knee = math.pi - math.acos((L1**2 + L2**2 - d**2) / (2 * L1 * L2))
    alpha = math.atan2(x, -zp)
    beta = math.acos((L1**2 + d**2 - L2**2) / (2 * L1 * d))
    hip = alpha + beta
    ankle = -(hip - knee)            # düz ayak / flat foot
    return tuple(math.degrees(a) for a in (hip, roll, knee, ankle, -roll))

# gidiş-dönüş denetimi / round-trip check
hp, hr, kn, ap, ar = leg_ik(0.04, 0.01, -0.27)
print(leg_fk(hp, kn, hr))   # ≈ (0.04, 0.01, -0.27)

# LIPM: ağırlık merkezinin destek ayağına göre ileri konumu (bir adım, T saniye)
def lipm_x(t, S=0.06, T=0.6, zc=0.30, g=9.81):
    Tc = math.sqrt(zc / g)
    return -S / 2 * math.sinh((T / 2 - t) / Tc) / math.sinh(T / (2 * Tc))
`

export const CPP_SNIPPET = `#include <cmath>
#include <cstdio>

constexpr double L1 = 0.16, L2 = 0.16;   // m
constexpr double DEG = 180.0 / M_PI;

struct Vec3 { double x, y, z; };
struct LegAngles { double hipPitch, hipRoll, knee, anklePitch, ankleRoll; };

// İleri kinematik: kalçaya göre bilek (açılar derece) / forward kinematics
Vec3 legFK(double hipPitch, double knee, double hipRoll) {
  double th = hipPitch / DEG, tk = knee / DEG, r = hipRoll / DEG;
  double x  = L1 * std::sin(th) + L2 * std::sin(th - tk);
  double zp = -L1 * std::cos(th) - L2 * std::cos(th - tk);
  return { x, -zp * std::sin(r), zp * std::cos(r) };
}

// İki bağlı ters kinematik (diz geriye) / two-link inverse kinematics
LegAngles legIK(Vec3 p) {
  double roll = std::atan2(p.y, -p.z);
  double zp = -std::hypot(p.y, p.z);
  double d = std::fmin(std::hypot(p.x, zp), L1 + L2 - 1e-6);
  double knee = M_PI - std::acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2));
  double hip = std::atan2(p.x, -zp) + std::acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  return { hip * DEG, roll * DEG, knee * DEG, -(hip - knee) * DEG, -roll * DEG };
}

int main() {
  LegAngles a = legIK({0.04, 0.01, -0.27});
  Vec3 q = legFK(a.hipPitch, a.knee, a.hipRoll);
  std::printf("%.4f %.4f %.4f\\n", q.x, q.y, q.z);  // 0.0400 0.0100 -0.2700
  // servo sınırı denetimi: diz 0..130° / servo limit check
  if (a.knee < 0 || a.knee > 130) std::puts("diz sınır dışında / knee out of range");
}
`
