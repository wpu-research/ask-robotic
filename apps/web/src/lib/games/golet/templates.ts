// JavaScript kipi için başlangıç kodları ve örnekler. Kod her tikte BAŞTAN çalışır; tikler arası bilgi `hafiza` nesnesinde durur.

export const STARTER = `// Kodun her tikte baştan çalışır (bir tik = bir adım).
// Komutlar:
//   swim(yön, hız)      yönü (0 sağ, 90 yukarı, 180 sol, 270 aşağı) ve hızı (0-100) ayarlar
//   cannon(yön, menzil) top atar (menzil en çok 70; top 16 tikte bir hazır olur)
//   scan(yön)           o yöndeki en yakın rakibin uzaklığı, yoksa Infinity
//   health() getX() getY() speed()
// hafiza: tikler arasında bilgi taşımak için bir nesne (örn. hafiza.sayac)

for (let a = 0; a < 360; a += 5) {
  const uzaklik = scan(a);
  if (uzaklik < Infinity) {
    cannon(a, uzaklik);
    break;
  }
}
`

export const ORBIT = `// Ateş et, sonra rakibin etrafında yan yan yüz: hareket eden ördeği vurmak zordur.
for (let a = 0; a < 360; a += 5) {
  const uzaklik = scan(a);
  if (uzaklik < Infinity) {
    cannon(a, uzaklik);
    swim(a + 90, 100);
    break;
  }
}
`

export const WANDER = `// Gezgin gibi dolaş: birkaç tikte bir rastgele yön seç.
hafiza.kalan = (hafiza.kalan ?? 0) - 1;
if (hafiza.kalan <= 0) {
  swim(Math.random() * 360, 30);
  hafiza.kalan = 40;
}
// Duvara yaklaşınca ortaya dön.
if (getX() < 12 || getX() > 88 || getY() < 12 || getY() > 88) {
  const yon = Math.atan2(50 - getY(), 50 - getX()) * 180 / Math.PI;
  swim(yon, 30);
}
`

export const DODGE = `// Önce rakibi ara; bulunca ateş et. Canın azaldıysa daha hızlı kaç.
let bulundu = false;
for (let a = 0; a < 360; a += 5) {
  const uzaklik = scan(a);
  if (uzaklik < Infinity) {
    cannon(a, uzaklik);
    swim(a + 90, health() < 50 ? 100 : 60);
    bulundu = true;
    break;
  }
}
if (!bulundu) swim(0, 0);
`

export const ZIGZAG = `// Zikzak kaçış: her 20 tikte yan yönü değiştir; Usta gibi tahmin eden rakipler şaşırır.
hafiza.n = (hafiza.n ?? 0) + 1;
if (hafiza.n % 20 === 0) hafiza.yan = -(hafiza.yan ?? 1);
const yan = hafiza.yan ?? 1;
for (let a = 0; a < 360; a += 5) {
  const uzaklik = scan(a);
  if (uzaklik < Infinity) {
    cannon(a, uzaklik);
    swim(a + 90 * yan, 100);
    break;
  }
}
// Duvara yaklaşınca ortaya dön (duvarda durmak seni hedef yapar).
if (getX() < 16 || getX() > 84 || getY() < 16 || getY() > 84) {
  swim(Math.atan2(50 - getY(), 50 - getX()) * 180 / Math.PI, 100);
}
`

/** `nameEn`: İngilizce arayüzdeki ad. Kod (yorumlar ve `hafiza` gibi adlar dahil) çalışma biçimini korumak için değişmez. */
export interface Template { id: string; name: string; nameEn: string; code: string }
export const TEMPLATES: Template[] = [
  { id: 'baslangic', name: 'Tara ve ateş et', nameEn: 'Scan and fire', code: STARTER },
  { id: 'kacis', name: 'Ateş et ve kaç', nameEn: 'Fire and dodge', code: ORBIT },
  { id: 'zikzak', name: 'Zikzak kaçış (final)', nameEn: 'Zigzag escape (final)', code: ZIGZAG },
  { id: 'can', name: 'Canına göre hız', nameEn: 'Speed by health', code: DODGE },
  { id: 'gezgin', name: 'Dolaşma (hafiza)', nameEn: 'Wandering (hafiza memory)', code: WANDER },
]

/** Seviye çözümleri (JavaScript kipi); testte her seviyede kazandığı doğrulanır. */
export const JS_SOLUTIONS: Record<number, string> = {
  1: 'cannon(0, 55);\n',
  2: 'cannon(45, 64);\n',
  3: STARTER, 4: STARTER, 6: STARTER, 7: STARTER,
  5: ORBIT, 8: ORBIT, 9: ORBIT, 10: ZIGZAG,
}
