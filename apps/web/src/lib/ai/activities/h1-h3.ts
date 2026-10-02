// Hafta 1-3: token/BPE, sonraki kelime ve sıcaklık, bağlam penceresi, prompt yazımı.
import { defineActivity, type AiActivity } from '../activity'
import { lintPrompt, mentions, onTopic } from '../promptlint'
import { nextView, tokView, tokenCountBy, maxPiecesPerWord } from '../views'
import { words } from '../text'

const nWords = (s: string) => words(s).length

// 2 — Token
const L2 = defineActivity({
  id: 'token-gorsel', title: 'Yazının token\'ları', tool: 'tokenizer',
  intro: 'Modeller yazıyı harf harf ya da kelime kelime değil, "token" denen parçalar hâlinde görür. Aşağıdaki araç gerçek bir BPE algoritmasıyla (küçük bir derlemden eğitilmiş) metnini parçalar. Birleştirme sayısını kaydırarak parçaların nasıl büyüdüğünü izle.',
  initial: () => ({ text: 'robot', corpus: 'tr', merges: 0, window: 0 }),
  goals: [
    { id: 'cumle', label: 'En az 8 kelimelik bir cümle yaz', test: (s) => nWords(s.text) >= 8 },
    { id: 'azal', label: 'Birleştirmeleri artır: token sayısı karakter sayısından az olsun', hint: 'Birleştirme kaydırıcısını sağa çek.', test: (s) => { const v = tokView(s); return v.count < v.chars } },
    { id: 'fark', label: 'Aynı metin Türkçe ve İngilizce derlemde farklı sayıda token versin', hint: 'En az 10 birleştirme kullan.', test: (s) => { if (s.merges < 10) return false; const c = tokenCountBy(s.text, s.merges); return c.tr !== c.en } },
  ],
  solution: () => ({ text: 'robot duvarı görür ve sağa döner ve ileri gider', corpus: 'tr', merges: 60, window: 0 }),
})

// 3 — BPE
const L3 = defineActivity({
  id: 'bpe-birlestirme', title: 'BPE: parçalar nasıl öğrenilir?', tool: 'tokenizer',
  intro: 'BPE derlemde en sık yan yana gelen iki parçayı birleştirir, sonra bunu tekrarlar. Birleştirme sayısı 0 iken her harf ayrı token\'dır. Derlemde hiç geçmeyen bir kelime yazarsan ne olduğuna bak.',
  initial: () => ({ text: 'robot sağa döner ve ileri gider', corpus: 'tr', merges: 0, window: 0 }),
  goals: [
    { id: 'yari', label: 'Token sayısını karakter sayısının %60\'ına ya da daha aza indir', hint: 'Birleştirme sayısını 40 ve üstüne çıkar.', test: (s) => { const v = tokView(s); return v.chars > 0 && v.count * 10 <= v.chars * 6 } },
    { id: 'yeni', label: 'Derlemde geçmeyen bir kelime yaz: en az 3 parçaya bölünsün', hint: 'Örneğin "kalemlik" gibi robotla ilgisiz bir kelime dene.', test: (s) => s.merges >= 40 && maxPiecesPerWord(s.text, s.corpus, s.merges) >= 3 },
    { id: 'sozluk', label: 'Birleştirme sayısı en az 40 olsun', test: (s) => s.merges >= 40 },
  ],
  solution: () => ({ text: 'robot kalemlik duvarı görür', corpus: 'tr', merges: 60, window: 0 }),
})

// 4 — Sonraki kelime
const L4 = defineActivity({
  id: 'sonraki-kelime', title: 'Sonraki kelimeyi tahmin et', tool: 'nextword',
  intro: 'Dil modellerinin özü: şimdiye kadar yazılanlara bakıp sonraki parçayı tahmin etmek. Bu araç, küçük bir robot derleminden SAYARAK bir tahmin tablosu çıkarır (gerçek bir sinir ağı değil). Bağlamı değiştir, tablonun nasıl değiştiğine bak, sonra birkaç kelime ürettir.',
  initial: () => ({ text: 'robot', temperature: 1, order: 1, seed: 1, count: 0, tried: [] }),
  goals: [
    { id: 'baglam', label: 'Bağlamı en az 2 kelimeye çıkar', test: (s) => nWords(s.text) >= 2 },
    { id: 'emin', label: 'Öyle bir bağlam bul ki en olası kelimenin olasılığı %40\'ın üstünde olsun', hint: 'İki kelimeye bakan (mertebe 2) modelle "robot sağa" dene.', test: (s) => (nextView(s).top?.p ?? 0) > 0.4 },
    { id: 'uret', label: 'En az 3 kelime ürettir', test: (s) => s.count >= 3 },
  ],
  solution: () => ({ text: 'robot sağa', temperature: 1, order: 2, seed: 1, count: 3, tried: [] }),
})

// 5 — Proje: mini dil modeli
const L5 = defineActivity({
  id: 'mini-dil-modeli', title: 'Proje: Mini dil modeli', tool: 'nextword',
  intro: 'Kendi mini dil modelini kullan: bir başlangıç kelimesi seç, iki kelimelik bağlam (mertebe 2) kullan ve bir cümle üret. Üretilen metinde bir cümle bitiş noktası (.) çıkana kadar dene. Tohumu değiştirerek farklı cümleler al.',
  initial: () => ({ text: 'robot', temperature: 1, order: 1, seed: 1, count: 0, tried: [] }),
  goals: [
    { id: 'mertebe', label: 'İki kelimelik bağlam kullan (mertebe 2)', test: (s) => s.order === 2 },
    { id: 'uzun', label: 'En az 8 kelime üret', test: (s) => s.count >= 8 },
    { id: 'nokta', label: 'Üretilen metin bir cümle sonu (.) içersin', hint: 'Tohumu değiştir ya da biraz daha kelime ürettir.', test: (s) => nextView(s).gen.words.includes('.') },
  ],
  solution: () => ({ text: 'robot', temperature: 1, order: 2, seed: 1, count: 10, tried: [] }),
})

// 6 — Sıcaklık
const L6 = defineActivity({
  id: 'sicaklik', title: 'Sıcaklık: ihtiyatlı mı, maceracı mı?', tool: 'nextword',
  intro: 'Sıcaklık, softmax\'ın olasılıkları ne kadar keskin ya da düz yaptığını belirler. Düşük sıcaklıkta en olası kelime baskın çıkar; yüksek sıcaklıkta nadir kelimelerin şansı artar. Kaydırıcıyı iki uca da götür ve olasılık çubuklarını izle.',
  initial: () => ({ text: 'robot', temperature: 1, order: 1, seed: 1, count: 0, tried: [] }),
  goals: [
    { id: 'dusuk', label: 'Sıcaklığı 0,3\'ün altına indir', test: (s) => s.tried.includes('dusuk') },
    { id: 'yuksek', label: 'Sıcaklığı 1,8\'in üstüne çıkar', test: (s) => s.tried.includes('yuksek') },
    { id: 'uret', label: 'Her iki durumda da denedikten sonra en az 4 kelime ürettir', test: (s) => s.count >= 4 },
  ],
  solution: () => ({ text: 'robot', temperature: 1, order: 1, seed: 1, count: 4, tried: ['dusuk', 'yuksek'] }),
})

// 7 — Bağlam penceresi
const L7 = defineActivity({
  id: 'baglam-penceresi', title: 'Bağlam penceresi', tool: 'tokenizer',
  intro: 'Bir modelin aynı anda "görebildiği" token sayısı sınırlıdır: buna bağlam penceresi denir. Sığmayan en eski token\'lar dışarıda kalır. Uzun bir metin yaz, pencereyi küçült ve neyin dışarıda kaldığına bak.',
  initial: () => ({ text: 'Robot duvarı görür.', corpus: 'tr', merges: 40, window: 0 }),
  goals: [
    { id: 'uzun', label: 'En az 25 token\'lık bir metin yaz', test: (s) => tokView({ ...s, window: 0 }).count >= 25 },
    { id: 'tasma', label: 'Pencereyi küçült: en az 5 token dışarıda kalsın', test: (s) => s.window > 0 && tokView(s).dropped.length >= 5 },
    { id: 'kalan', label: 'Pencerede yine de en az 8 token kalsın', test: (s) => s.window >= 8 },
  ],
  solution: () => ({ text: 'Robot duvarı görür ve sağa döner. Sonra ileri gider ve engeli görür, durur.', corpus: 'tr', merges: 40, window: 12 }),
})

// 9 — Açık yazma
const L9 = defineActivity({
  id: 'acik-prompt', title: 'Açık görev yaz', tool: 'prompt',
  intro: 'Görev: bir robot kulübü duyurusunu 13 yaşındaki öğrenciler için özetletecek bir prompt yaz. Denetleyici kural tabanlıdır: görev, rol, bağlam, örnek, biçim ve kısıt parçalarını arar; anlamı anlamaz.',
  initial: () => ({ prompt: 'Duyuruyu özetle.', task: 'ozet' }),
  goals: [
    { id: 'gorev', label: 'Açık bir görev fiili kullan', test: (s) => lintPrompt(s.prompt).rules.gorev! },
    { id: 'konu', label: 'Konuya sadık kal: "duyuru" ve "özet" geçsin', test: (s) => onTopic(s.task, s.prompt) },
    { id: 'bicim', label: 'Çıktı biçimini söyle (madde, cümle sayısı…)', test: (s) => lintPrompt(s.prompt).rules.bicim! },
    { id: 'puan', label: 'Puanı en az 55\'e çıkar', test: (s) => lintPrompt(s.prompt).score >= 55 },
  ],
  solution: () => ({ task: 'ozet', prompt: 'Sen deneyimli bir robotik kulübü mentörüsün. Aşağıdaki kulüp duyurusunu 13 yaşındaki öğrenciler için özetle. Özeti en fazla 3 madde olarak yaz. Teknik terim kullanma.' }),
})

// 10 — Proje: şablon
const L10 = defineActivity({
  id: 'prompt-sablonu', title: 'Proje: Prompt şablonu', tool: 'prompt',
  intro: 'Tekrar kullanabileceğin bir şablon yaz: öğrenci yorumlarını "olumlu" ya da "olumsuz" olarak sınıflandıran bir prompt. Rol, bağlam, örnek, biçim ve kısıt parçalarının hepsini koymaya çalış.',
  initial: () => ({ prompt: 'Yorumu sınıflandır.', task: 'siniflandir' }),
  goals: [
    { id: 'puan', label: 'Kontrol listesi puanı en az 80', test: (s) => lintPrompt(s.prompt).score >= 80 },
    { id: 'rol', label: 'Bir rol tanımla', test: (s) => lintPrompt(s.prompt).rules.rol! },
    { id: 'ornek', label: 'Bir örnek ekle', test: (s) => lintPrompt(s.prompt).rules.ornek! },
    { id: 'konu', label: 'Konuya sadık kal: "yorum" ve "olumlu" geçsin', test: (s) => onTopic(s.task, s.prompt) },
  ],
  solution: () => ({ task: 'siniflandir', prompt: 'Sen bir yorum inceleme asistanısın. Öğrenci yorumlarını olumlu ya da olumsuz olarak sınıflandır. Örnek: Girdi: Dersi çok sevdim. Çıktı: olumlu. Yanıtta yalnızca tek kelime yaz: olumlu veya olumsuz.' }),
})

// 11 — Few-shot
const L11 = defineActivity({
  id: 'ornekle-ogret', title: 'Örnek vererek öğret', tool: 'prompt',
  intro: 'Bir modele davranışı anlatmanın en güçlü yollarından biri birkaç örnek göstermektir. En az iki "Girdi: … Çıktı: …" çifti içeren bir sınıflandırma prompt\'u yaz. Örneklerin farklı etiketleri göstermesi iyi olur.',
  initial: () => ({ prompt: 'Öğrenci yorumlarını olumlu ya da olumsuz olarak sınıflandır.', task: 'siniflandir' }),
  goals: [
    { id: 'iki', label: 'En az iki "Girdi:" örneği yaz', test: (s) => (s.prompt.toLocaleLowerCase('tr-TR').match(/girdi\s*:/g) ?? []).length >= 2 },
    { id: 'cikti', label: 'Her örnekte "Çıktı:" olsun', test: (s) => (s.prompt.toLocaleLowerCase('tr-TR').match(/çıktı\s*:/g) ?? []).length >= 2 },
    { id: 'iki-etiket', label: 'İki örnekte iki farklı etiket (olumlu ve olumsuz) göster', test: (s) => mentions(s.prompt, 'çıktı: olumlu') && mentions(s.prompt, 'çıktı: olumsuz') },
    { id: 'konu', label: 'Konuya sadık kal', test: (s) => onTopic(s.task, s.prompt) },
  ],
  solution: () => ({ task: 'siniflandir', prompt: 'Öğrenci yorumlarını olumlu ya da olumsuz olarak sınıflandır. Girdi: Dersi çok sevdim. Çıktı: olumlu. Girdi: Hiçbir şey anlamadım. Çıktı: olumsuz. Yanıtta yalnızca etiketi yaz.' }),
})

// 12 — Yapılandırılmış çıktı
const L12 = defineActivity({
  id: 'json-cikti', title: 'Yapılandırılmış çıktı: JSON', tool: 'prompt',
  intro: 'Programlar serbest metni değil düzenli veriyi işler. Bir yorumdan "duygu" ve "konu" bilgisini JSON olarak çıkartacak bir prompt yaz: anahtar adlarını ve bir örnek çıktıyı belirt.',
  initial: () => ({ prompt: 'Yorumdan bilgi çıkar.', task: 'json' }),
  goals: [
    { id: 'json', label: 'Biçim olarak JSON iste', test: (s) => mentions(s.prompt, 'json') },
    { id: 'anahtar', label: 'İki anahtar adını yaz: duygu ve konu', test: (s) => mentions(s.prompt, 'duygu', 'konu') },
    { id: 'ornek', label: 'Bir örnek çıktı göster', test: (s) => lintPrompt(s.prompt).rules.ornek! },
    { id: 'puan', label: 'Puanı en az 70\'e çıkar', test: (s) => lintPrompt(s.prompt).score >= 70 },
  ],
  solution: () => ({ task: 'json', prompt: 'Sen bir veri çıkarma asistanısın. Öğrenci yorumundan duygu ve konu bilgisini çıkar. Yanıtı yalnızca JSON olarak ver, anahtarlar duygu ve konu olsun. Örnek: Girdi: Robot dersi çok eğlenceliydi. Çıktı: {"duygu": "olumlu", "konu": "robot dersi"}. JSON dışında hiçbir şey yazma.' }),
})

// 14 — İterasyon
const L14 = defineActivity({
  id: 'prompt-iterasyon', title: 'Prompt\'u yinelemeyle düzelt', tool: 'prompt',
  intro: 'İlk prompt nadiren en iyisidir. Kısa ve belirsiz bir istemle başla, denetleyicinin eksik dediği parçaları tek tek ekle ve puanın nasıl yükseldiğini izle. Görev: bir Python fonksiyonundaki hatayı bulup açıklatmak.',
  initial: () => ({ prompt: 'Python kodumdaki hatayı bul.', task: 'kod' }),
  goals: [
    { id: 'konu', label: 'Konuya sadık kal: "Python" ve "hata" geçsin', test: (s) => onTopic(s.task, s.prompt) },
    { id: 'kisit', label: 'Bir kısıt koy (en fazla…, kodu baştan yazma…)', test: (s) => lintPrompt(s.prompt).rules.kisit! },
    { id: 'bicim', label: 'Çıktı biçimini söyle', test: (s) => lintPrompt(s.prompt).rules.bicim! },
    { id: 'puan', label: 'Puanı en az 75\'e çıkar', test: (s) => lintPrompt(s.prompt).score >= 75 },
  ],
  solution: () => ({ task: 'kod', prompt: 'Sen deneyimli bir Python öğretmenisin. Aşağıdaki fonksiyondaki hatayı bul ve 13 yaşındaki bir öğrenci için açıkla. Örnek: Hata: liste boşken sıfıra bölünüyor. Yanıtı en fazla 4 madde olarak yaz. Kodu baştan yazma.' }),
})

// 15 — Proje: ödev yardımcısı
const L15 = defineActivity({
  id: 'prompt-kutuphanesi', title: 'Proje: Duyuru özetleyici prompt\'u', tool: 'prompt',
  intro: 'Bu haftanın projesi: eksiksiz bir prompt. Duyuru özetleyen, rolü, hedef kitlesi, örneği, biçimi ve kısıtı olan, en az 40 kelimelik bir prompt yaz. Hedef: kontrol listesinden tam puan.',
  initial: () => ({ prompt: 'Duyuruyu özetle.', task: 'ozet' }),
  goals: [
    { id: 'tam', label: 'Kontrol listesi puanı en az 90', test: (s) => lintPrompt(s.prompt).score >= 90 },
    { id: 'uzun', label: 'En az 40 kelime', test: (s) => nWords(s.prompt) >= 40 },
    { id: 'konu', label: 'Konuya sadık kal: "duyuru" ve "özet" geçsin', test: (s) => onTopic(s.task, s.prompt) },
  ],
  solution: () => ({ task: 'ozet', prompt: 'Sen deneyimli bir robotik kulübü mentörüsün. Aşağıdaki kulüp duyurusunu 13 yaşındaki öğrenciler için özetle; amaç, öğrencilerin toplantıyı kaçırmamasıdır. Örnek: Duyuru: Salı günü buluşuyoruz, projelerinizi getirin. Özet: - Kulüp salı günü buluşuyor. - Projeni getir. Özeti en fazla 3 madde olarak yaz. Teknik terim kullanma ve duyuruda olmayan bir bilgi ekleme.' }),
})

export const H1_H3: Record<number, AiActivity> = { 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 9: L9, 10: L10, 11: L11, 12: L12, 14: L14, 15: L15 }
