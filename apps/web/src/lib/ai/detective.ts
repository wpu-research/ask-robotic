// Halüsinasyon dedektifi. Metinler ELLE YAZILMIŞ örneklerdir; gerçek bir model çıktısı değildir.
// Görev: "yapay zekâ özeti" sandığın cümleleri KAYNAKLA karşılaştır: uyumlu mu, çelişiyor mu, kaynakta hiç yok mu?
export type Mark = 'ok' | 'celisir' | 'yok'
export const MARK_LABEL: Record<Mark, string> = { ok: 'Kaynakla uyumlu', celisir: 'Kaynakla çelişiyor', yok: 'Kaynakta yok' }
export interface Claim { id: string; text: string; key: Mark; why: string }
export interface DetSet { id: string; title: string; kind: 'metin' | 'kod'; source: string; claims: Claim[] }

export const SETS: Record<string, DetSet> = {
  sensor: {
    id: 'sensor', title: 'Ultrasonik sensör notu', kind: 'metin',
    source: 'Ultrasonik sensör, ses dalgası gönderir ve yankının dönmesi için geçen süreyi ölçer. Süre ne kadar uzunsa nesne o kadar uzaktadır. Bu sensör yaklaşık iki metreye kadar olan mesafelerde iyi çalışır. Yumuşak ve eğik yüzeyler yankıyı zayıflatabilir, bu yüzden ölçüm yanlış çıkabilir. Sensör ışık değil ses kullandığı için karanlıkta da çalışır.',
    claims: [
      { id: 'c1', text: 'Sensör ses dalgası gönderip yankının dönüş süresini ölçer.', key: 'ok', why: 'Kaynağın ilk cümlesi.' },
      { id: 'c2', text: 'Yankı ne kadar uzun sürede dönerse nesne o kadar yakındır.', key: 'celisir', why: 'Kaynak tam tersini söylüyor: süre uzadıkça nesne uzaklaşır.' },
      { id: 'c3', text: 'Sensör yaklaşık iki metreye kadar iyi çalışır.', key: 'ok', why: 'Kaynakta aynen var.' },
      { id: 'c4', text: 'Sensör on metre uzaktaki nesneleri de kesin olarak ölçer.', key: 'celisir', why: 'Kaynak yaklaşık iki metre diyor.' },
      { id: 'c5', text: 'Ses kullandığı için karanlıkta da çalışır.', key: 'ok', why: 'Kaynağın son cümlesi.' },
      { id: 'c6', text: 'Sensör kızılötesi ışıkla ölçüm yapar.', key: 'celisir', why: 'Kaynak "ışık değil ses" diyor.' },
      { id: 'c7', text: 'Bu sensörü ilk olarak 1998 yılında bir Japon mühendis geliştirdi.', key: 'yok', why: 'Kaynakta böyle bir bilgi yok: uydurulmuş ayrıntı.' },
      { id: 'c8', text: 'Yumuşak yüzeyler ölçümü bozabilir.', key: 'ok', why: 'Kaynakta var.' },
    ],
  },
  kulup: {
    id: 'kulup', title: 'Kulüp duyurusu (kurgusal)', kind: 'metin',
    source: 'Çevrimiçi Robotik Kulübü her hafta salı akşamı saat 19.00\'da buluşur. Buluşmalar bir saat sürer. Katılmak için önceden kayıt gerekmez. Gruplar en fazla dört kişiden oluşur. Proje teslimi her ayın son cuma günüdür. Mentörler yardım isteklerine en geç iki gün içinde yanıt verir.',
    claims: [
      { id: 'k1', text: 'Kulüp her salı akşamı 19.00\'da buluşur.', key: 'ok', why: 'Kaynakta var.' },
      { id: 'k2', text: 'Buluşmalar iki saat sürer.', key: 'celisir', why: 'Kaynak bir saat diyor.' },
      { id: 'k3', text: 'Katılmak için kayıt olmak zorunludur.', key: 'celisir', why: 'Kaynak "önceden kayıt gerekmez" diyor.' },
      { id: 'k4', text: 'Gruplar en fazla dört kişidir.', key: 'ok', why: 'Kaynakta var.' },
      { id: 'k5', text: 'Kulübe katılmak için aylık ücret ödenir.', key: 'yok', why: 'Ücretten hiç söz edilmiyor.' },
      { id: 'k6', text: 'Projeler her ayın son cuması teslim edilir.', key: 'ok', why: 'Kaynakta var.' },
      { id: 'k7', text: 'Mentörler yardım isteklerine iki gün içinde yanıt verir.', key: 'ok', why: '"En geç iki gün" ile uyumlu.' },
    ],
  },
  kod: {
    id: 'kod', title: 'Kod açıklaması (kod incelemesi)', kind: 'kod',
    source: 'def ortalama(liste):\n    toplam = 0\n    for x in liste:\n        toplam += x\n    return toplam / len(liste)\n\nprint(ortalama([4, 8, 6]))',
    claims: [
      { id: 'p1', text: 'Fonksiyon, listedeki sayıların ortalamasını hesaplar.', key: 'ok', why: 'Toplamı eleman sayısına böler.' },
      { id: 'p2', text: 'Program ekrana 6.0 yazdırır.', key: 'ok', why: '(4+8+6)/3 = 6.0; Python 3\'te bölme ondalık verir.' },
      { id: 'p3', text: 'Program ekrana 18 yazdırır.', key: 'celisir', why: '18 toplamdır; fonksiyon 3\'e bölüp 6.0 döndürür.' },
      { id: 'p4', text: 'Liste boş verilirse fonksiyon 0 döndürür.', key: 'celisir', why: 'len([]) = 0 olduğundan sıfıra bölme hatası (ZeroDivisionError) oluşur.' },
      { id: 'p5', text: 'Fonksiyon girdi listesini küçükten büyüğe sıralar.', key: 'celisir', why: 'Kodda sıralama yok; liste hiç değiştirilmiyor.' },
      { id: 'p6', text: 'Fonksiyon sonucu bir dosyaya kaydeder.', key: 'yok', why: 'Kodda dosya işlemi yok.' },
      { id: 'p7', text: 'for döngüsü her sayıyı toplam değişkenine ekler.', key: 'ok', why: '`toplam += x` satırı.' },
    ],
  },
}

export interface DetReport { total: number; marked: number; correct: number; wrong: string[] }
export function scoreMarks(setId: string, marks: Record<string, Mark | undefined>): DetReport {
  const set = SETS[setId]
  if (!set) return { total: 0, marked: 0, correct: 0, wrong: [] }
  const marked = set.claims.filter((c) => marks[c.id]).length
  const wrong = set.claims.filter((c) => marks[c.id] && marks[c.id] !== c.key).map((c) => c.id)
  return { total: set.claims.length, marked, correct: marked - wrong.length, wrong }
}
