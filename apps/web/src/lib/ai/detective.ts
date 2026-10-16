// Halüsinasyon dedektifi. Metinler ELLE YAZILMIŞ örneklerdir; gerçek bir model çıktısı değildir.
// Görev: "yapay zekâ özeti" sandığın cümleleri KAYNAKLA karşılaştır: uyumlu mu, çelişiyor mu, kaynakta hiç yok mu?
export type Mark = 'ok' | 'celisir' | 'yok'
export const MARK_LABEL: Record<Mark, string> = { ok: 'Kaynakla uyumlu', celisir: 'Kaynakla çelişiyor', yok: 'Kaynakta yok' }
export interface Claim { id: string; text: string; key: Mark; why: string }
export interface DetSet { id: string; title: string; kind: 'metin' | 'kod'; source: string; claims: Claim[] }
/** Bir vakanın İngilizcesi: aynı iddia kimlikleri ve doğru cevaplar; yalnız metinler çevrilir. */
export interface DetSetEn { title: string; source: string; claims: Record<string, { text: string; why: string }> }
export const MARK_LABEL_EN: Record<Mark, string> = { ok: 'Matches the source', celisir: 'Contradicts the source', yok: 'Not in the source' }

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

/** SETS'in İngilizce metinleri (serbest atölye, site dili İngilizceyken). */
export const SETS_EN: Record<string, DetSetEn> = {
  sensor: {
    title: 'Ultrasonic sensor note',
    source: 'An ultrasonic sensor sends out a sound wave and measures the time it takes for the echo to come back. The longer the time, the farther away the object is. This sensor works well for distances up to about two metres. Soft and slanted surfaces can weaken the echo, so the measurement may be wrong. Because the sensor uses sound, not light, it also works in the dark.',
    claims: {
      c1: { text: 'The sensor sends a sound wave and measures how long the echo takes to return.', why: 'The first sentence of the source.' },
      c2: { text: 'The longer the echo takes to return, the closer the object is.', why: 'The source says the opposite: the longer the time, the farther the object.' },
      c3: { text: 'The sensor works well up to about two metres.', why: 'Stated in the source.' },
      c4: { text: 'The sensor also measures objects ten metres away precisely.', why: 'The source says about two metres.' },
      c5: { text: 'Because it uses sound, it also works in the dark.', why: 'The last sentence of the source.' },
      c6: { text: 'The sensor measures with infrared light.', why: 'The source says "sound, not light".' },
      c7: { text: 'A Japanese engineer first developed this sensor in 1998.', why: 'The source says nothing like this: an invented detail.' },
      c8: { text: 'Soft surfaces can spoil the measurement.', why: 'Stated in the source.' },
    },
  },
  kulup: {
    title: 'Club announcement (fictional)',
    source: 'The Online Robotics Club meets every Tuesday evening at 19.00. Meetings last one hour. No registration is needed to join. Groups have at most four people. The project deadline is the last Friday of every month. Mentors answer help requests within two days at the latest.',
    claims: {
      k1: { text: 'The club meets every Tuesday evening at 19.00.', why: 'Stated in the source.' },
      k2: { text: 'Meetings last two hours.', why: 'The source says one hour.' },
      k3: { text: 'Registration is required to join.', why: 'The source says "no registration is needed".' },
      k4: { text: 'Groups have at most four people.', why: 'Stated in the source.' },
      k5: { text: 'Members pay a monthly fee to join the club.', why: 'A fee is never mentioned.' },
      k6: { text: 'Projects are due on the last Friday of each month.', why: 'Stated in the source.' },
      k7: { text: 'Mentors answer help requests within two days.', why: 'Consistent with "within two days at the latest".' },
    },
  },
  kod: {
    title: 'Code explanation (code review)',
    source: 'def average(numbers):\n    total = 0\n    for x in numbers:\n        total += x\n    return total / len(numbers)\n\nprint(average([4, 8, 6]))',
    claims: {
      p1: { text: 'The function calculates the average of the numbers in the list.', why: 'It divides the total by the number of items.' },
      p2: { text: 'The program prints 6.0.', why: '(4+8+6)/3 = 6.0; in Python 3 division gives a decimal.' },
      p3: { text: 'The program prints 18.', why: '18 is the total; the function divides by 3 and returns 6.0.' },
      p4: { text: 'If the list is empty, the function returns 0.', why: 'len([]) = 0, so a division-by-zero error (ZeroDivisionError) occurs.' },
      p5: { text: 'The function sorts the input list from smallest to largest.', why: 'There is no sorting in the code; the list is never changed.' },
      p6: { text: 'The function saves the result to a file.', why: 'There is no file operation in the code.' },
      p7: { text: 'The for loop adds each number to the total variable.', why: 'The `total += x` line.' },
    },
  },
}
