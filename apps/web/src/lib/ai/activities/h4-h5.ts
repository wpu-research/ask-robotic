// Hafta 4-5: eval tablosu, metin benzerliği, parçalama ve RAG.
import { defineActivity, type AiActivity } from '../activity'
import { runEval } from '../evals'
import { embedRank } from '../views'
import { ragView } from '../views'
import { contextHas } from '../rag'
import { words } from '../text'

const SENT_BASE = [{ text: 'Bu uygulama çok güzel', expected: 'olumlu' }, { text: 'Berbat bir ders', expected: 'olumsuz' }]
const ev = (s: { target: 'sentiment' | 'engel'; cases: { text: string; expected: string }[] }) => runEval(s.target, s.cases)

// 16
const L16 = defineActivity({
  id: 'eval-neden', title: 'Neden ölçmeliyiz?', tool: 'eval',
  intro: '"Çalışıyor gibi görünüyor" ölçü değildir. Bu araçtaki sınıflandırıcı bir MODEL DEĞİL, kural tabanlı küçük bir programdır; ama bir modele yaptığın gibi onu test vakalarıyla ölçeceksin. Vakalar yaz, doğruluğu (doğru / toplam) izle ve sistemin yanıldığı bir vaka bul.',
  initial: () => ({ target: 'sentiment', cases: SENT_BASE.map((c) => ({ ...c })) }),
  goals: [
    { id: 'bes', label: 'En az 5 test vakası yaz', test: (s) => ev(s).total >= 5 },
    { id: 'hata', label: 'Sistemin yanıldığı en az bir vaka bul', hint: 'Alay ("Harika, yine bozuldu") ya da "fena değil" gibi kalıpları dene.', test: (s) => { const r = ev(s); return r.total > r.correct } },
    { id: 'dogru', label: 'En az bir vakayı sistem doğru bilsin', test: (s) => ev(s).correct >= 1 },
  ],
  solution: () => ({ target: 'sentiment', cases: [...SENT_BASE, { text: 'Çok yavaş ve sıkıcı', expected: 'olumsuz' }, { text: 'Kolay değil', expected: 'olumsuz' }, { text: 'Harika, yine bozuldu', expected: 'olumsuz' }] }),
})

// 17
const L17 = defineActivity({
  id: 'eval-vaka-yaz', title: 'İyi test vakası yazmak', tool: 'eval',
  intro: 'İyi bir test seti sadece kolay örnekler içermez. Her etiketten örnek koy: olumlu, olumsuz ve "belirsiz" (ne olumlu ne olumsuz). En az 8 vaka yaz.',
  initial: () => ({ target: 'sentiment', cases: SENT_BASE.map((c) => ({ ...c })) }),
  goals: [
    { id: 'sekiz', label: 'En az 8 vaka', test: (s) => ev(s).total >= 8 },
    { id: 'uc', label: 'Üç etiketin de en az bir örneği olsun', test: (s) => { const r = ev(s).recall; return ['olumlu', 'olumsuz', 'belirsiz'].every((l) => (r[l]?.n ?? 0) >= 1) } },
    { id: 'tekrar', label: 'Aynı vakayı iki kez yazma', test: (s) => { const r = ev(s); return r.total > 0 && r.duplicates === 0 } },
  ],
  solution: () => ({ target: 'sentiment', cases: [...SENT_BASE, { text: 'Çok yavaş ve sıkıcı', expected: 'olumsuz' }, { text: 'Harika bir proje', expected: 'olumlu' }, { text: 'Ders salı günü', expected: 'belirsiz' }, { text: 'Kolay ve eğlenceli', expected: 'olumlu' }, { text: 'Kullanışsız bir araç', expected: 'olumsuz' }, { text: 'Toplantı saat beşte', expected: 'belirsiz' }] }),
})

// 18
const L18 = defineActivity({
  id: 'eval-karisiklik', title: 'Doğruluk yetmez: hangi etiket kaçıyor?', tool: 'eval',
  intro: 'Tek bir doğruluk sayısı, hangi etikette zayıf olduğunu gizler. Tabloda her beklenen etiket için kaç vakanın doğru bulunduğuna (geri çağırma) bak. Olumsuz etiketinden en az iki vaka yaz ve sistemin en az iki yerde yanıldığı bir set kur.',
  initial: () => ({ target: 'sentiment', cases: SENT_BASE.map((c) => ({ ...c })) }),
  goals: [
    { id: 'olumsuz', label: 'En az 2 "olumsuz" vakası yaz', test: (s) => (ev(s).recall['olumsuz']?.n ?? 0) >= 2 },
    { id: 'iki-hata', label: 'Sistemin en az 2 vakada yanıldığı bir set kur', test: (s) => { const r = ev(s); return r.total - r.correct >= 2 } },
    { id: 'mutlak', label: 'Doğruluk %40\'ın altına düşmesin (sistem tamamen kötü değil)', test: (s) => ev(s).accuracy >= 0.4 },
  ],
  solution: () => ({ target: 'sentiment', cases: [...SENT_BASE, { text: 'Çok yavaş ve sıkıcı', expected: 'olumsuz' }, { text: 'Harika, yine bozuldu', expected: 'olumsuz' }, { text: 'Fena değil', expected: 'olumlu' }] }),
})

// 19
const L19 = defineActivity({
  id: 'eval-kenar', title: 'Kenar durumlar ve sınırlar', tool: 'eval',
  intro: 'Hatalar çoğunlukla sınırlarda saklanır. Bu sınıflandırıcı bir robotun "dur / yavaşla / devam" kararını verir (girdi: mesafe=<cm> hız=<cm/sn>). Eşik değerlerinin hemen iki yanını ve hızı hesaba katıp katmadığını test et. Aynı vakayı tekrarlamak (ya da test verisini sistemi ayarlarken kullanmak) ölçümü şişirir.',
  initial: () => ({ target: 'engel', cases: [{ text: 'mesafe=25 hız=40', expected: 'yavaşla' }] }),
  goals: [
    { id: 'alti', label: 'En az 6 vaka yaz', test: (s) => ev(s).total >= 6 },
    { id: 'sinir', label: 'Bir eşik değerinin tam üstünde dene (mesafe=20 ya da mesafe=50)', test: (s) => s.cases.some((c) => /mesafe\s*=\s*(20|50)(?!\d)/i.test(c.text)) },
    { id: 'tekrar', label: 'Aynı vaka tekrar etmesin', test: (s) => { const r = ev(s); return r.total > 0 && r.duplicates === 0 } },
    { id: 'hata', label: 'Sistemin yanıldığı en az bir vaka bul', hint: 'Mesafe orta, hız çok yüksek olunca ne olmalı?', test: (s) => { const r = ev(s); return r.total > r.correct } },
  ],
  solution: () => ({ target: 'engel', cases: [{ text: 'mesafe=25 hız=40', expected: 'yavaşla' }, { text: 'mesafe=19', expected: 'dur' }, { text: 'mesafe=20', expected: 'yavaşla' }, { text: 'mesafe=49', expected: 'yavaşla' }, { text: 'mesafe=50', expected: 'devam' }, { text: 'mesafe=40 hız=100', expected: 'dur' }] }),
})

// 20
const L20 = defineActivity({
  id: 'eval-proje', title: 'Proje: Kendi eval setin', tool: 'eval',
  intro: 'Haftanın projesi: yorum sınıflandırıcısı için kendi test setini kur. En az 10 vaka, her etiketten dengeli örnek ve sistemin zayıf yerlerini ortaya çıkaran en az iki zor vaka.',
  initial: () => ({ target: 'sentiment', cases: SENT_BASE.map((c) => ({ ...c })) }),
  goals: [
    { id: 'on', label: 'En az 10 vaka', test: (s) => ev(s).total >= 10 },
    { id: 'denge', label: 'Olumlu ve olumsuzdan en az 3\'er vaka, belirsizden en az 1', test: (s) => { const r = ev(s).recall; return (r['olumlu']?.n ?? 0) >= 3 && (r['olumsuz']?.n ?? 0) >= 3 && (r['belirsiz']?.n ?? 0) >= 1 } },
    { id: 'zor', label: 'Sistemin yanıldığı en az 2 zor vaka', test: (s) => { const r = ev(s); return r.total - r.correct >= 2 } },
    { id: 'tekrar', label: 'Tekrarlanan vaka yok', test: (s) => { const r = ev(s); return r.total > 0 && r.duplicates === 0 } },
  ],
  solution: () => ({ target: 'sentiment', cases: [...SENT_BASE, { text: 'Harika bir proje', expected: 'olumlu' }, { text: 'Kolay ve eğlenceli', expected: 'olumlu' }, { text: 'Çok faydalı', expected: 'olumlu' }, { text: 'Çok yavaş ve sıkıcı', expected: 'olumsuz' }, { text: 'Kullanışsız', expected: 'olumsuz' }, { text: 'Ders salı günü', expected: 'belirsiz' }, { text: 'Harika, yine bozuldu', expected: 'olumsuz' }, { text: 'Fena değil', expected: 'olumlu' }] }),
})

// 21 — benzerlik
const L21 = defineActivity({
  id: 'benzerlik-ara', title: 'Metinleri sayılarla karşılaştır', tool: 'embed',
  intro: 'Bilgisayar iki metnin ne kadar benzediğini nasıl ölçer? Her metni bir sayı listesine (vektöre) çevirip kosinüs benzerliğine bakar. Bu araçta vektörler kelime sayımından ve TF-IDF\'ten GERÇEKTEN hesaplanır. (Gerçek gömme modelleri anlamı kodlar; buradaki yöntem yalnız ortak kelimelere bakar.) Sekiz kısa belge arasında en benzerini bul.',
  initial: () => ({ query: 'sensör', method: 'sayim' }),
  goals: [
    { id: 'iki', label: 'En az 2 kelimelik bir sorgu yaz', test: (s) => words(s.query).length >= 2 },
    { id: 'tfidf', label: 'Yöntemi TF-IDF yap', test: (s) => s.method === 'tfidf' },
    { id: 'ust', label: 'İlk sonuç "Ultrasonik sensör" belgesi olsun ve benzerlik 0,4\'ü geçsin', test: (s) => { const r = embedRank(s)[0]; return !!r && r.item.id === 'd2' && r.score > 0.4 } },
  ],
  solution: () => ({ query: 'ses dalgası', method: 'tfidf' }),
})

// 22 — kosinüs ve sınır
const L22 = defineActivity({
  id: 'benzerlik-sinir', title: 'Eş anlamlıyı yakalayamayan vektör', tool: 'embed',
  intro: 'Sayım tabanlı vektörler yalnız AYNI kelimeleri eşleştirir. "Mesafe" ile "uzaklık" aynı şeydir ama ortak harfleri yoktur. Anlamca ilgili ama hiç ortak kelimesi olmayan bir sorgu bul ve benzerliğin sıfır çıktığını gör. Gerçek gömme modelleri bu sorunu büyük ölçüde aşmak için vardır.',
  initial: () => ({ query: 'mesafe ölçme', method: 'tfidf' }),
  goals: [
    { id: 'uzak', label: 'Sorguda "uzak" kökü geçsin (örn. uzaklık)', test: (s) => /uzak/i.test(s.query) },
    { id: 'uc', label: 'En az 3 kelimelik sorgu yaz', test: (s) => words(s.query).length >= 3 },
    { id: 'sifir', label: 'Hiçbir belgeyle eşleşme olmasın (en yüksek benzerlik 0)', test: (s) => (embedRank(s)[0]?.score ?? 0) === 0 },
  ],
  solution: () => ({ query: 'uzaklığı nasıl bulur', method: 'tfidf' }),
})

// 23 — parçalama
const L23 = defineActivity({
  id: 'rag-parcala', title: 'Parçalama: ne kadar büyük?', tool: 'rag',
  intro: 'RAG\'da uzun belge önce parçalara bölünür. Parça çok büyükse bağlama gereksiz metin girer; çok küçükse cevap parçalara bölünüp kaybolur. Soru: "Proje teslimi ne zaman?" Parça boyutunu ayarla: cevabı getir ama bağlamı küçük tut.',
  initial: () => ({ question: 'Proje teslimi ne zaman?', size: 200, overlap: 0, topK: 1 }),
  goals: [
    { id: 'cevap', label: 'Getirilen bağlamda "son cuma" geçsin', test: (s) => contextHas(ragView(s), 'son cuma') },
    { id: 'parca', label: 'Belge en az 5 parçaya bölünsün', test: (s) => ragView(s).chunks.length >= 5 },
    { id: 'kisa', label: 'Bağlam 45 kelimeyi geçmesin', test: (s) => words(ragView(s).context).length <= 45 + ragView(s).retrieved.length },
    { id: 'ortusme', label: 'Örtüşme parça boyunun yarısından az olsun', test: (s) => s.overlap * 2 < s.size },
  ],
  solution: () => ({ question: 'Proje teslimi ne zaman?', size: 20, overlap: 5, topK: 1 }),
})

// 24 — getirme ve yerleştirme
const L24 = defineActivity({
  id: 'rag-getir', title: 'Getirme: doğru parçayı bul', tool: 'rag',
  intro: 'Getirme adımı soruyu vektöre çevirir, parçalarla kosinüs benzerliğine göre sıralar ve en iyi K tanesini bağlama koyar. Soru ne kadar belirsizse getirme o kadar şansa kalır. Mentörlerin ne kadar sürede yanıt verdiğini bulduran net bir soru yaz.',
  initial: () => ({ question: 'Yardım', size: 30, overlap: 5, topK: 2 }),
  goals: [
    { id: 'cevap', label: 'Şablon yanıt "iki gün" içersin', hint: 'Soruda "mentör" ve "yanıt" kelimelerini kullan.', test: (s) => (ragView(s).template.sentence ?? '').includes('iki gün') },
    { id: 'soru', label: 'Soru en az 4 kelime olsun', test: (s) => words(s.question).length >= 4 },
    { id: 'az', label: 'En çok 3 parça getir', test: (s) => s.topK <= 3 },
  ],
  solution: () => ({ question: 'Mentörler ne kadar sürede yanıt verir?', size: 30, overlap: 5, topK: 2 }),
})

// 25 — proje
const L25 = defineActivity({
  id: 'rag-proje', title: 'Proje: Kendi RAG hattın', tool: 'rag',
  intro: 'Tüm hattı kur: parça boyutu, örtüşme, kaç parça getirileceği ve soru. Hedef, "Bronz rozet için ne gerekir?" sorusunun cevabını getirmek. Hat gerçek hesaplanır; son kutudaki yanıt ise bir şablondur, model değildir.',
  initial: () => ({ question: 'Rozetler hakkında bilgi', size: 30, overlap: 5, topK: 2 }),
  goals: [
    { id: 'cevap', label: 'Şablon yanıt "iki proje" içersin', test: (s) => (ragView(s).template.sentence ?? '').includes('iki proje') },
    { id: 'boyut', label: 'Parça boyutu 15 ile 60 kelime arasında', test: (s) => s.size >= 15 && s.size <= 60 },
    { id: 'ortusme', label: 'Örtüşme 0\'dan büyük olsun', test: (s) => s.overlap > 0 },
    { id: 'k', label: 'Getirilen parça sayısı 1 ile 3 arasında', test: (s) => s.topK >= 1 && s.topK <= 3 },
  ],
  solution: () => ({ question: 'Bronz rozet için ne gerekir?', size: 20, overlap: 5, topK: 2 }),
})

export const H4_H5: Record<number, AiActivity> = { 16: L16, 17: L17, 18: L18, 19: L19, 20: L20, 21: L21, 22: L22, 23: L23, 24: L24, 25: L25 }
