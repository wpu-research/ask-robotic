import type { WeekExtras } from '../extras'
import type { QuizQuestion } from '../types'

// Modül 1 (Blokla Kodlamaya İlk Adım) platform katmanı içeriği: hafta ve ders sırası modül-1-scratchjr.ts ile aynı.
// Sayılar etkinlik tanımlarından (apps/web/src/lib/jr/activities/modul1.ts) ve motordan (1 adım = 24 birim,
// robot başta sağa bakar, Sağa dön = aşağı, Sola dön = yukarı) alınmıştır.

/** Sorulardaki blok yığınlarını kod bloğu olarak yazar. */
const kod = (...satirlar: string[]) => '```\n' + satirlar.join('\n') + '\n```'

/** Haftalık rehberi sekiz bölümlü sabit biçimde kurar. */
function rehber(o: {
  hedefler: string[]
  plan: [string, string, string, string][]
  onkosul: string[]
  harita: string[]
  hatalar: string[]
  tekrar: string[]
  olcut: [string, string, string, string][]
  not: string[]
}): string {
  const liste = (a: string[]) => a.map((x) => `- ${x}`).join('\n')
  return `### Hafta hedefleri
Bu haftanın sonunda çocuk:
${o.hedefler.map((x, i) => `${i + 1}. ${x}`).join('\n')}

### Haftanın planı
Hafta iki dersten oluşur. Her ders kısa bir etkinliktir; ikisini aynı güne sığdırmak zorunda değilsiniz. Çocuk yorulursa ikinci dersi başka güne bırakın.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
${o.plan.map((r) => `| ${r.join(' | ')} |`).join('\n')}

### Ön koşul kontrolü
${liste(o.onkosul)}

### Kavram haritası
${liste(o.harita)}

### Sık yapılan hatalar
${liste(o.hatalar)}

### Hafta sonu tekrarı
${o.tekrar.map((x, i) => `${i + 1}. ${x}`).join('\n')}

Hafta sonu testi olarak iki dersin mini testleri yeterlidir. Hedef: her dersten çoğunu doğru yapmak. Eksik kalırsa dersin anlatımını birlikte yeniden okuyun.

### Proje değerlendirme ölçütü
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
${o.olcut.map((r) => `| ${r.join(' | ')} |`).join('\n')}

### Veli ve öğretmen notu
${liste(o.not)}
`
}

const q = (x: QuizQuestion): QuizQuestion => x

export const modul1Extras: WeekExtras[] = [
  // ---------------- Hafta 1: Komut ver, robot yapsın ----------------
  {
    guideMd: rehber({
      hedefler: [
        'Robotun yalnızca verilen komutları yaptığını söyler.',
        'Komutların sırayla çalıştığını ve sırayı değiştirince sonucun değiştiğini gösterir.',
        'Yeşil bayrağın betiği başlattığını bilir.',
        'İleri bloğundaki sayının adım sayısı olduğunu bilir ve sayıyı değiştirir.',
        'Sağa dön ile Sola dön arasındaki farkı ekranda görür.',
      ],
      plan: [
        ['1', 'Robot oyunu', '~25 dk', 'Anlatımı birlikte okuyun, robotu yıldıza götürün, sıra deneyini yapın, mini testi çözün.'],
        ['2', 'İlk hareket', '~25 dk', 'Kediyi yürütün, adım sayısını değiştirin, çöp kutusunu deneyin, mini testi çözün.'],
      ],
      onkosul: [
        'Çocuk sağ ve sol yönünü biliyor mu? (Bilmiyorsa dönüş bloklarında renkli ok işaretine bakın.)',
        'Parmakla ya da fareyle bir şeyi sürükleyip bırakabiliyor mu?',
        'Bilgisayar ya da tablet ekranını rahatça görebiliyor mu?',
      ],
      harita: [
        '**Komut:** İleri, Sağa dön, Sola dön, Zıpla',
        '**Sıra:** önce bu, sonra bu',
        '**Betik:** alt alta dizilmiş bloklar, üstte Yeşil bayrak',
        '**Adım sayısı:** İleri bloğundaki sayı',
      ],
      hatalar: [
        '**Yeşil bayrağı koymamak.** Betik çalışmaz. Başlat düğmesine bastığında hiçbir şey olmaz.',
        '**Sağa dön ile Sola dönü karıştırmak.** Robot ters yöne gider; hata değil, dene ve gör.',
        '**Sırayı karıştırmak.** Önce dönersen robot başka yere yürür.',
        '**Sayıyı çok küçük bırakmak.** Robot yıldıza varamaz. Sayıyı büyüt.',
        '**Alttaki blokları unutmak.** Bloğu ortadan tutarsan altındakiler de gelir.',
      ],
      tekrar: [
        'Her dersin kavram kartlarına bir daha bakın ve "Sık yapılan yanlış" satırını yüksek sesle okuyun.',
        'Mini testte yanlış yapılan soruların açıklamasını birlikte okuyun, sonra soruyu yeniden çözün.',
        'Robot oyununu bir kez daha, bu sefer farklı adım sayılarıyla çözün.',
        'Çocuğa şunu sorun: "Robot kendi kendine düşünür mü, yoksa bizim komutumuzu mu yapar?"',
      ],
      olcut: [
        ['Sıra', 'Sırayı karıştırıyor, nedenini söyleyemiyor', 'Doğru sırayı kurup robotu yıldıza götürüyor', 'Sırayı bilerek bozup sonucu önceden söylüyor'],
        ['Başlatma', 'Yeşil bayrağı unutuyor', 'Betiği Yeşil bayrakla başlatıyor', 'Bayrak olmayınca ne olacağını açıklıyor'],
        ['Adım', 'Sayıyı değiştirmiyor', 'Sayıyı değiştirip robotu yıldıza ulaştırıyor', 'Adım sayısını önceden tahmin ediyor'],
        ['Anlatım', 'Ne yaptığını söylemiyor', 'Robotun ne yaptığını kendi sözleriyle anlatıyor', 'Hatasını bulup nasıl düzelttiğini anlatıyor'],
      ],
      not: [
        '**Amaç.** Bu hafta çocuğa kod ezberletmiyoruz. Amaç, bilgisayarın yalnızca verilen komutları sırayla yaptığını hissetmesi.',
        '**Nasıl destek olunur?** Bloğu çocuğun yerine koymayın. Şunu sorun: "Robot ne yaptı? Sen ne istemiştin?"',
        '**Hata.** Yanlış sıra kuran çocuğa "yanlış" demeyin. Birlikte robotu izleyin; çocuk hatayı kendi bulsun.',
        '**Süre.** Kısa ve sık çalışmak uzun bir seanstan daha iyidir. Çocuk sıkılınca durun.',
        '**Güvenlik.** Bu platformdaki her şey sanaldır; yanlış yapılan bir şey geri alınır (Başa al düğmesi).',
        '**İlerleme.** Mini test sonuçları "İlerlemem" sayfasında görünür (taslak özellik).',
      ],
    }),
    lessons: [
      // 1.1 Robot oyunu
      {
        explainerMd: `### Bu derste öğreneceklerin
- Robot yalnızca senin verdiğin komutu yapar.
- Komutların sırası önemlidir.

### Önceden bilmen gerekenler
Hiçbir şey. Sağ ve sol yönünü bilmen yeter.

### Robot ne yapar?
Robot kendi kendine düşünmez. Ona **komut** verirsin. Komutlar: **İleri**, **Sağa dön**, **Sola dön** ve **Zıpla**. Her komut bir bloktur. Bloklar alt alta dizilir. Robot onları yukarıdan aşağıya, **sırayla** yapar.

Sıra değişirse robot başka yere gider. "Önce İleri, sonra Sağa dön" ile "önce Sağa dön, sonra İleri" aynı şey değildir.

Bloklardan oluşan diziye **betik** denir. Betik **Yeşil bayrak** ile başlar. Sonra 🏁 Başlat düğmesine basarsın ve robot bloklarını yapar. Robot yanlış yere giderse üzülme. Sırayı değiştir, yeniden dene.

### Birlikte konuşun
"Robot ne yaptı? Sen ne istemiştin?"

### Özet
Robot verdiğin komutları sırayla yapar. Sıra değişirse sonuç da değişir. Betik Yeşil bayrakla başlar.`,
        concepts: [
          { term: 'Komut', definition: 'Robota ne yapacağını söyleyen blok.', example: 'İleri, robota "yürü" der.', pitfall: 'Robotun kendi kendine bir şey düşündüğünü sanmak. Robot yalnızca komutu yapar.' },
          { term: 'Sıra', definition: 'Komutların önce ve sonra gelme düzeni.', example: 'Önce İleri, sonra Sağa dön: robot önce yürür, sonra döner.', pitfall: 'Sırayı karıştırmak. Önce dönersen robot başka yöne yürür.' },
          { term: 'Betik', definition: 'Alt alta dizilmiş bloklar. Bir tren gibi.', example: 'Yeşil bayrak, İleri, Sağa dön, İleri bir betiktir.', pitfall: 'Blokları ayrı ayrı bırakmak. Birbirine yapışmazsa betik olmaz.' },
          { term: 'Yeşil bayrak', definition: 'Betiği başlatan blok. Betiğin en üstünde durur.', example: '🏁 Başlat düğmesine basınca Yeşil bayraklı betik çalışır.', pitfall: 'Yeşil bayrağı koymayı unutmak. Başlat\'a basınca robot kıpırdamaz.' },
          { term: 'Sağa dön', definition: 'Robotu sağ yöne çeviren blok.', example: 'Sağa bakan robot Sağa dön yapınca aşağı bakar.', pitfall: 'Sağa dön ile Sola dönü karıştırmak. Robot ters yöne gider.' },
        ],
        quiz: [
          q({ id: 'm1h1d1-q1', kind: 'mcq', prompt: 'Robot ne yapar? 🤖', options: ['Aklından geçeni yapar', 'Verdiğim komutları sırayla yapar'], answer: 1, explanation: 'Robot kendi kendine düşünmez. Yalnızca bloklarla verdiğin komutları, verdiğin sırayla yapar.', skills: ['jr-sequence'] }),
          q({ id: 'm1h1d1-q2', kind: 'predict-output', prompt: 'Robot sağa bakıyor. Bu betiği yaptı:\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6') + '\n\nİkinci İleri\'de robot hangi yöne yürür?', options: ['⬆️ Yukarı', '⬇️ Aşağı', '➡️ Sağa'], answer: 1, explanation: 'Sağa bakan robot Sağa dön yapınca aşağı bakar. Yani ikinci İleri robotu aşağı yürütür. Yukarı için Sola dön gerekir.', skills: ['jr-motion', 'jr-sequence'] }),
          q({ id: 'm1h1d1-q3', kind: 'find-bug', prompt: 'Robot önce sağa gidip sonra aşağı inecek. Hangi betik hatalı?\n\n' + kod('A: 🏁 → ➡️ İleri → ↩️ Sağa dön → ➡️ İleri', 'B: 🏁 → ↩️ Sağa dön → ➡️ İleri → ➡️ İleri'), options: ['A hatalı', 'B hatalı'], answer: 1, explanation: 'B\'de robot önce dönüyor. Bu yüzden hemen aşağı yürür, sağa hiç gitmez. Önce İleri, sonra dönüş gerekir. A doğrudur.', skills: ['jr-sequence', 'jr-debug'] }),
          q({ id: 'm1h1d1-q4', kind: 'numeric', prompt: 'Robot bu betiği yapıyor. Toplam kaç adım yürür?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6'), answer: 13, unit: 'adım', explanation: 'Önce 7 adım, sonra 6 adım yürür: 7 + 6 = 13. Dönmek adım sayılmaz.', skills: ['jr-motion'] }),
        ],
        // Etkileşimli ders (v2). 5-7 yaş: kısa cümleler, en çok 3 seçenek; metinler sesli okunur.
        // Sayılar etkinlikten: robot sağa bakar, yıldıza İleri 7, Sağa dön, İleri 6 ile varır.
        steps: [
          { kind: 'intro', art: 'robot', title: 'Robot oyunu', body: 'Bu bir robot. Uzakta bir yıldız var. Hadi robotu yıldıza götürelim!' },
          { kind: 'choice', prompt: 'Robot ne yapar? 🤖', options: ['🤔 Aklına geleni yapar', '🧩 Benim komutlarımı yapar'], answer: 1, why: 'Robot kendi kendine düşünmez. Yalnızca senin verdiğin komutları yapar.', hint: 'Robot kendi kendine bir şey düşünebilir mi?', skills: ['jr-sequence'] },
          { kind: 'explain', art: 'robot', body: 'Komutlar bloktur. **İleri** robotu yürütür, içindeki sayı adım sayısıdır. **Sağa dön** robotu çevirir.' },
          { kind: 'choice', prompt: 'Robot sağa bakıyor. **Sağa dön** yapınca nereye bakar?', options: ['⬆️ Yukarı', '⬇️ Aşağı', '⬅️ Sola'], answer: 1, why: 'Sağa bakan robot Sağa dön yapınca aşağı bakar. Yukarı bakması için Sola dön gerekir.', hint: 'Robotun yüzü sağda. Onu biraz sağa çevir.', skills: ['jr-motion'] },
          { kind: 'numeric', prompt: 'Robot bu blokları yaptı. Kaç adım yürüdü?', code: '🏁 Yeşil bayrak\n➡️ İleri 2\n➡️ İleri 3', answer: 5, unit: 'adım', why: 'Önce 2 adım, sonra 3 adım yürüdü. 2 ile 3, 5 eder.', hint: 'İki bloktaki sayıları birlikte say.', skills: ['jr-motion'] },
          { kind: 'explain', art: 'robot', body: 'Robot blokları yukarıdan aşağıya, sırayla yapar. Sıra değişirse robot başka yere gider.' },
          { kind: 'order', prompt: 'Robot önce sağa gitsin, sonra aşağı insin. Blokları sırala.', lines: ['➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6'], why: 'Robot sağa bakıyor. Önce İleri 7 ile sağa yürür. Sonra Sağa dön ile aşağı bakar ve İleri 6 ile iner.', hint: 'Robot şu an hangi yöne bakıyor?', skills: ['jr-sequence', 'jr-motion'] },
          { kind: 'choice', prompt: 'Ece önce **Sağa dön** koydu. Robot nereye yürür?', code: '🏁 Yeşil bayrak\n↩️ Sağa dön\n➡️ İleri 7', options: ['➡️ Sağa yürür', '⬇️ Aşağı yürür'], answer: 1, why: 'Robot önce döndü ve aşağı baktı. Sonra İleri ile aşağı yürüdü. Sağa gitmesi için önce İleri gerekir.', hint: 'İlk blok ne yapıyor?', skills: ['jr-sequence', 'jr-debug'] },
          { kind: 'choice', prompt: 'Betiğin en üstünde hangi blok olmalı?', options: ['➡️ İleri', '⤴️ Zıpla', '🏁 Yeşil bayrak'], answer: 2, why: 'Yeşil bayrak betiği başlatır. O yoksa Başlat düğmesine basınca robot kıpırdamaz.', hint: 'Betiği hangi blok başlatır?', skills: ['jr-start-block'] },
          { kind: 'activity', prompt: 'Şimdi sıra sende! Robotu yıldıza götür. Varınca **Zıpla** ile kutla. Bitince **Kontrol et**\'e bas.' },
          { kind: 'reflect', prompt: 'Büyüğünle konuşun: Sağa dön bloğunu İleri\'den önce koyunca robot nereye gitti? Neden?' },
        ],
        // İngilizcesi (arayüz dili 'en'): yapı aynı; blok adları (İleri, Sağa dön, Yeşil bayrak, Zıpla) etkinlikteki gibi Türkçe kalır.
        stepsEn: [
          { kind: 'intro', art: 'robot', title: 'Robot game', body: 'This is a robot. There is a star far away. Let\'s take the robot to the star!' },
          { kind: 'choice', prompt: 'What does the robot do? 🤖', options: ['🤔 Whatever it thinks of', '🧩 What I tell it to do'], answer: 1, why: 'A robot does not think by itself. It only does what you tell it.', hint: 'Can a robot think of things by itself?', skills: ['jr-sequence'] },
          { kind: 'explain', art: 'robot', body: 'Commands are blocks. **İleri** (forward) makes the robot walk. The number on it is how many steps. **Sağa dön** (turn right) turns the robot.' },
          { kind: 'choice', prompt: 'The robot faces right. Where does it face after **Sağa dön** (turn right)?', options: ['⬆️ Up', '⬇️ Down', '⬅️ Left'], answer: 1, why: 'A robot facing right looks down after Sağa dön. To look up, it needs Sola dön (turn left).', hint: 'The robot\'s face is on the right. Turn it a little to the right.', skills: ['jr-motion'] },
          { kind: 'numeric', prompt: 'The robot did these blocks. How many steps did it walk?', code: '🏁 Yeşil bayrak\n➡️ İleri 2\n➡️ İleri 3', answer: 5, unit: 'steps', why: 'First 2 steps, then 3 steps. 2 and 3 make 5.', hint: 'Count the numbers on both blocks together.', skills: ['jr-motion'] },
          { kind: 'explain', art: 'robot', body: 'The robot does the blocks from top to bottom, in order. If the order changes, the robot goes somewhere else.' },
          { kind: 'order', prompt: 'The robot should go right first, then go down. Put the blocks in order.', lines: ['➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6'], why: 'The robot faces right. First İleri 7 takes it right. Then Sağa dön makes it look down, and İleri 6 takes it down.', hint: 'Which way is the robot facing now?', skills: ['jr-sequence', 'jr-motion'] },
          { kind: 'choice', prompt: 'Ece put **Sağa dön** first. Where does the robot walk?', code: '🏁 Yeşil bayrak\n↩️ Sağa dön\n➡️ İleri 7', options: ['➡️ It walks right', '⬇️ It walks down'], answer: 1, why: 'The robot turned first and looked down. Then İleri made it walk down. To go right, İleri has to come first.', hint: 'What does the first block do?', skills: ['jr-sequence', 'jr-debug'] },
          { kind: 'choice', prompt: 'Which block goes at the very top of the script?', options: ['➡️ İleri', '⤴️ Zıpla', '🏁 Yeşil bayrak'], answer: 2, why: 'Yeşil bayrak (green flag) starts the script. Without it, the robot does not move when you press Başlat (start).', hint: 'Which block starts the script?', skills: ['jr-start-block'] },
          { kind: 'activity', prompt: 'Your turn! Take the robot to the star. When it gets there, celebrate with **Zıpla** (jump). When you finish, press **Kontrol et** (check).' },
          { kind: 'reflect', prompt: 'Talk with a grown-up: When you put Sağa dön before İleri, where did the robot go? Why?' },
        ],
      },
      // 1.2 İlk hareket
      {
        explainerMd: `### Bu derste öğreneceklerin
- Betik bir tren gibidir; en önde Yeşil bayrak vardır.
- İleri bloğundaki sayı adım sayısıdır.
- Yanlış bloğu çöp kutusuna atabilirsin.

### Önceden bilmen gerekenler
1. ders: Robot oyunu. Komutların sırayla çalıştığını biliyorsun.

### Kedi yürüyor
Blokları vagonlar gibi alt alta yapıştırırsın. Trenin en önünde lokomotif var: 🏁 **Yeşil bayrak**. Lokomotif olmazsa tren yola çıkmaz. Başlat\'a basınca kedi bloklarını sırayla yapar.

**İleri** bloğundaki sayı, kedinin kaç **adım** yürüyeceğini söyler. 3 yazarsan 3 adım yürür. Sayıyı büyütürsen daha uzağa gider, küçültürsen daha az yürür. **Geri** bloğu kediyi geriye yürütür. İleri ile Geri birbirini götürür.

Yanlış blok mu koydun? Sürükle, **çöp kutusuna** bırak. Silinir.

### Birlikte konuşun
"Yeşil bayrak olmasaydı ne olurdu?"

### Özet
Betik Yeşil bayrakla başlar. İleri\'deki sayı adım sayısıdır. Yanlış blok çöp kutusuna atılır.`,
        concepts: [
          { term: 'Yeşil bayrak', definition: 'Betiğin en üstünde duran ve betiği başlatan blok.', example: 'Yeşil bayrak, 3 İleri\'nin üstüne konunca kedi yürümeye başlar.', pitfall: 'Betiği bayraksız bırakmak. Başlat\'a basınca betik çalışmaz.' },
          { term: 'Adım sayısı', definition: 'İleri bloğundaki sayı. Kedi o kadar adım yürür.', example: 'İleri 3 yazarsan kedi 3 adım yürür.', pitfall: 'Sayıyı değiştirmeyi unutmak. Kedi yıldıza varamaz.' },
          { term: 'Geri', definition: 'Kediyi geriye yürüten blok.', example: 'İleri 3, sonra Geri 3: kedi başladığı yere döner.', pitfall: 'Geri ile Sola dönü karıştırmak. Geri yürütür, Sola dön çevirir.' },
          { term: 'Çöp kutusu', definition: 'Yanlış bloğu silmek için sürükleyip bıraktığın yer.', example: 'Fazla İleri bloğunu çöp kutusuna bırakınca silinir.', pitfall: 'Bloğu silmeyi bilmeden uzun betik kurmak. Çöp kutusu yardım eder.' },
          { term: 'Başa al', definition: 'Kediyi başladığı yere geri götüren düğme.', example: '↺ Başa al\'a basınca kedi tekrar başlangıca gelir.', pitfall: 'Başa al\'a basmadan tekrar Başlat demek. Kedi yürüdüğü yerden devam eder.' },
        ],
        quiz: [
          q({ id: 'm1h1d2-q1', kind: 'mcq', prompt: 'Betiğin en üstüne neden Yeşil bayrak koyarız? 🏁', options: ['Kedi güzel görünsün diye', 'Betik onunla başlasın diye'], answer: 1, explanation: 'Yeşil bayrak betiği başlatır. Bayrak olmazsa Başlat\'a basınca betik çalışmaz.', skills: ['jr-start-block'] }),
          q({ id: 'm1h1d2-q2', kind: 'numeric', prompt: 'Kedi bu betiği yapıyor. Kaç adım yürür?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '➡️ İleri 3', '➡️ İleri 3'), answer: 9, unit: 'adım', explanation: '3 + 3 + 3 = 9 adım. Her İleri bloğu kendi sayısı kadar yürütür.', skills: ['jr-motion', 'jr-sequence'] }),
          q({ id: 'm1h1d2-q3', kind: 'predict-output', prompt: 'Kedi bu betiği yaptı. Sonunda nerede durur?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '⬅️ Geri 3'), options: ['Başladığı yerde', '3 adım ileride', '6 adım ileride'], answer: 0, explanation: 'Önce 3 adım ileri, sonra 3 adım geri gider. Aynı yere döner. 3 adım ileride olması için Geri bloğu olmamalıydı.', skills: ['jr-motion'] }),
          q({ id: 'm1h1d2-q4', kind: 'find-bug', prompt: 'Başlat\'a bastım ama kedi kıpırdamıyor.\n\n' + kod('➡️ İleri 3', '➡️ İleri 3', '➡️ İleri 3') + '\n\nHata ne?', options: ['İleri blokları çok fazla', 'En üstte Yeşil bayrak yok'], answer: 1, explanation: 'Betik Yeşil bayrakla başlar. Üstte bayrak yoksa Başlat\'a basınca betik çalışmaz. Blok sayısı çok olsa da sorun olmaz.', skills: ['jr-start-block', 'jr-debug'] }),
        ],
      },
    ],
  },

  // ---------------- Hafta 2: Aynı şeyi tekrar tekrar ----------------
  {
    guideMd: rehber({
      hedefler: [
        'Aynı işi çok kez yazmak yerine Tekrarla bloğunu kullanır.',
        'Tekrarla\'nın içindeki blokların tekrar ettiğini, dışındakilerin etmediğini ayırır.',
        'Tekrar sayısını değiştirince sonucun nasıl değiştiğini söyler.',
        'Sonsuza kadar bloğunun hiç bitmediğini ve Dur düğmesiyle durduğunu bilir.',
        'Hareket, görünüm ve ses bloklarını bir dansta birleştirir.',
      ],
      plan: [
        ['1', 'Tekrar etmek', '~20 dk', 'Uzun betiği Tekrarla ile kısaltın, sayıyı değiştirip deneyin, mini testi çözün.'],
        ['2', 'Dans eden karakter', '~30 dk', 'Dans adımlarını seçin, Tekrarla ve Sonsuza kadar\'ı deneyin, Dur düğmesini bulun, mini testi çözün.'],
      ],
      onkosul: [
        'Birinci haftanın sıra ve Yeşil bayrak fikrini hatırlıyor mu?',
        'Bir bloğu başka bir bloğun içine sürükleyip bırakabiliyor mu?',
        'Sayıya dokunup yeni sayı yazabiliyor mu?',
      ],
      harita: [
        '**Tekrarla:** C şeklinde blok, içindekileri verilen sayı kadar yapar',
        '**Sayı:** kaç kez tekrar',
        '**Sonsuza kadar:** hiç bitmez, Dur ile durur',
        '**Dans adımı:** hareket, görünüm ve ses blokları',
      ],
      hatalar: [
        '**Blokları C\'nin dışında bırakmak.** Yalnız içindekiler tekrar eder.',
        '**Fazla blokları silmeyi unutmak.** Kısa yol işe yaramaz, hâlâ uzun betik vardır.',
        '**Tekrar sayısını karıştırmak.** 4 yerine 2 yazınca kedi yarı kadar yapar.',
        '**Sonsuza kadar\'dan sonra blok eklemeye çalışmak.** Eklenemez; çünkü hiç bitmez.',
        '**Dur düğmesini bulamamak.** Sonsuz dansta kırmızı Dur düğmesine basın.',
      ],
      tekrar: [
        'Kavram kartlarına bir daha bakın ve "Sık yapılan yanlış" satırlarını yüksek sesle okuyun.',
        'Dans eden karakterin betiğini yeniden kurun: bu sefer farklı bir dans adımı seçin.',
        'Tekrar sayısını 2, 5 ve 10 yapıp kedinin ne kadar yürüdüğünü karşılaştırın.',
        'Çocuğa şunu sorun: "Tekrarla bloğu bize ne kazandırdı?"',
      ],
      olcut: [
        ['Tekrar', 'Blokları tek tek kopyalıyor', 'Dans adımlarını Tekrarla içine koyuyor', 'Sayıyı değiştirip sonucu önceden söylüyor'],
        ['İçeri ve dışarı', 'Bloklar dışarıda kalıyor', 'İçindeki ve dışındaki blokları ayırıyor', 'Neden yalnız içeridekilerin tekrar ettiğini anlatıyor'],
        ['Dans', 'Yalnız bir tür blok kullanıyor', 'Hareket ve görünüm veya ses karıştırıyor', 'Dansı bir hikâyeyle bağlıyor'],
        ['Durdurma', 'Sonsuz dansı durduramıyor', 'Dur düğmesini buluyor', 'Neden Sonsuza kadar\'ın arkasına blok gelmediğini anlatıyor'],
      ],
      not: [
        '**Amaç.** Bu hafta "döngü" fikrini hissettirmek. Terimi ezberletmek şart değil; "şu kadar kere tekrarla" demesi yeter.',
        '**Nasıl destek olunur?** "Önce kaç blok vardı, şimdi kaç?" diye sorun. Kısalmasını çocuk fark etsin.',
        '**Sonsuz dans.** Çocuk kaygılanabilir. Kırmızı Dur düğmesini birlikte bulun; her zaman durdurabildiğini görsün.',
        '**Dansı çocuk seçsin.** Hareketlere hikâye katın: "Kedi neden dans ediyor?"',
        '**Süre.** Dans dersi eğlencelidir; ama yorulmadan durun.',
        '**İlerleme.** Mini test sonuçları "İlerlemem" sayfasında görünür (taslak özellik).',
      ],
    }),
    lessons: [
      // 2.1 Tekrar etmek
      {
        explainerMd: `### Bu derste öğreneceklerin
- Aynı işi tekrar tekrar yazmak yorucudur.
- Tekrarla bloğu işi kısaltır.
- Tekrarla\'nın içindeki bloklar tekrar eder.

### Önceden bilmen gerekenler
1. hafta: komutlar sırayla çalışır, betik Yeşil bayrakla başlar.

### Kısa yol
Kedi dört kez zıplıyor, konuşuyor ve yürüyor. Aynı üç bloğu dört kez yazarsan betik çok uzar.

**Tekrarla** bloğu C harfine benzer. C\'nin içine koyduğun bloklar tekrar eder. Sayı kaç yazarsan o kadar kez tekrar eder. 4 yazarsan üç blok dört kez çalışır.

Kısa betik, uzun betikle **aynı işi** yapar. Yalnızca daha az blok kullanır.

Dikkat: C\'nin dışında kalan blok tekrar etmez. Yalnız bir kez çalışır.

Sayıyı değiştirmek kolaydır. 4 yerine 6 yazarsan kedi altı kez yapar.

### Birlikte konuşun
"Önce kaç blok vardı, şimdi kaç?"

### Özet
Tekrarla, aynı işi kısa yoldan yaptırır. İçindeki bloklar sayı kadar tekrar eder.`,
        concepts: [
          { term: 'Tekrarla', definition: 'İçindeki blokları verilen sayı kadar tekrar eden C şeklinde blok.', example: 'Tekrarla 4 içinde Zıpla varsa kedi 4 kez zıplar.', pitfall: 'Blokları C\'nin dışında bırakmak. Dışarıdaki blok tekrar etmez.' },
          { term: 'Tekrar sayısı', definition: 'Tekrarla bloğundaki sayı. Kaç kez tekrar edileceğini söyler.', example: 'Tekrarla 3 içindeki İleri 2 üç kez çalışırsa kedi 6 adım yürür.', pitfall: 'Sayıyı yanlış yazmak. 2 yazınca kedi 4 yerine 2 kez yapar.' },
          { term: 'C\'nin içi', definition: 'Tekrarla bloğunun ağzı. Tekrar edecek bloklar buraya konur.', example: 'Zıpla, Söyle ve İleri C\'nin içine konur.', pitfall: 'Bloğu C\'nin ağzına tam bırakmamak. Yapışmazsa içeride sayılmaz.' },
          { term: 'Kısa yol', definition: 'Aynı işi daha az blokla yapmak.', example: '12 blok yerine Tekrarla ile 4 blok yeter.', pitfall: 'Fazla blokları silmemek. Kısa yolda eski kopyalar kalmamalı.' },
        ],
        quiz: [
          q({ id: 'm1h2d1-q1', kind: 'mcq', prompt: 'Aynı işi çok kez yaptırmanın kısa yolu hangisi?', options: ['Blokları tek tek kopyalamak', 'Tekrarla bloğu 🔁'], answer: 1, explanation: 'Tekrarla, aynı işi tek seferde yazıp sayı kadar tekrar ettirir. Kopyalamak betiği uzatır.', skills: ['jr-repeat'] }),
          q({ id: 'm1h2d1-q2', kind: 'numeric', prompt: 'Kedi kaç kez zıplar?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 4', '  ⤴️ Zıpla 1'), answer: 4, unit: 'kez', explanation: 'Zıpla, Tekrarla\'nın içinde. Tekrarla 4 olduğu için Zıpla 4 kez çalışır: 4 kez zıplar.', skills: ['jr-repeat'] }),
          q({ id: 'm1h2d1-q3', kind: 'predict-output', prompt: 'Kedi toplam kaç adım yürür?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 3', '  ➡️ İleri 2'), options: ['2 adım', '6 adım', '3 adım'], answer: 1, explanation: 'İleri 2, üç kez çalışır: 2 + 2 + 2 = 6 adım. 2 adım yalnız bir tur olurdu.', skills: ['jr-repeat', 'jr-motion'] }),
          q({ id: 'm1h2d1-q4', kind: 'find-bug', prompt: 'Kedi 4 kez zıplamalıydı ama 1 kez zıpladı.\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 4', '  ➡️ İleri 1', '⤴️ Zıpla 1') + '\n\nHata ne?', options: ['Tekrarla sayısı 4', 'Zıpla, C\'nin dışında kalmış'], answer: 1, explanation: 'Zıpla, Tekrarla\'nın dışında. Dışındaki blok yalnız bir kez çalışır. Zıpla\'yı C\'nin içine sürüklemek gerekir.', skills: ['jr-repeat', 'jr-debug'] }),
        ],
      },
      // 2.2 Dans eden karakter
      {
        explainerMd: `### Bu derste öğreneceklerin
- Hareket, görünüm ve ses bloklarıyla dans kurmak.
- Dans adımlarını Tekrarla içine koymak.
- Sonsuza kadar hiç bitmez; Dur ile durur.

### Önceden bilmen gerekenler
2. hafta, 1. ders: Tekrarla bloğu.

### Dans zamanı
Kedinin dans adımları: **İleri**, **Geri**, **Zıpla**, **Sağa dön**. **Büyü** kediyi büyütür. **Ses çal** ses çıkarır. Adımları sen seçersin. Dans güzel olsun diye farklı adımlar karıştırabilirsin.

Dans adımlarını **Tekrarla** içine koyarsan dans birkaç kez tekrar eder.

**Sonsuza kadar** bloğu başkadır. Hiç bitmez. Kedi sonsuza dek dans eder. Durdurmak için sahnenin üstündeki kırmızı **Dur** düğmesine basarsın. Sonsuza kadar\'ın arkasına blok eklenemez, çünkü o hiç bitmez.

### Birlikte konuşun
"Kedi neden dans ediyor? Hangi blok onu durdurmadan dans ettiriyor?"

### Özet
Dans blokları Tekrarla ya da Sonsuza kadar içine konur. Sonsuz dansı Dur düğmesi durdurur.`,
        concepts: [
          { term: 'Dans adımı', definition: 'Karakterin yaptığı bir hareket, görünüm ya da ses bloğu.', example: 'Zıpla ve Büyü iki dans adımıdır.', pitfall: 'Adımları C\'nin dışına koymak. Dışarıdaki adım tekrar etmez.' },
          { term: 'Sonsuza kadar', definition: 'İçindekileri hiç durmadan tekrar eden blok.', example: 'Sonsuza kadar içindeki Zıpla ile kedi durmadan zıplar.', pitfall: 'Kendiliğinden biteceğini sanmak. Dur düğmesine basmak gerekir.' },
          { term: 'Dur düğmesi', definition: 'Çalışan betiği durduran kırmızı düğme.', example: 'Sonsuz dansı ⏹ Dur ile durdurursun.', pitfall: 'Dur düğmesini aramamak. Sonsuz tekrar kendiliğinden bitmez.' },
          { term: 'Büyü', definition: 'Karakteri bir miktar büyüten Görünüm bloğu.', example: 'Büyü iki kez kullanılırsa kedi daha da büyür.', pitfall: 'Büyü ile Küçül\'ü karıştırmak. Büyü büyütür, Küçül küçültür.' },
          { term: 'Ses çal', definition: 'Bir ses çıkaran Ses bloğu. İçindeki sayı sesi seçer.', example: 'Ses çal 2 ikinci sesi çalar.', pitfall: 'Ses çal\'ı hiç eklememek. Betik ses çıkarmaz.' },
        ],
        quiz: [
          q({ id: 'm1h2d2-q1', kind: 'mcq', prompt: 'Hangi blok hiç bitmez?', options: ['Tekrarla 4', 'Sonsuza kadar ♾️', 'Zıpla'], answer: 1, explanation: 'Sonsuza kadar içindekileri durmadan tekrar eder. Tekrarla 4 dört kez yapar ve biter.', skills: ['jr-forever', 'jr-repeat'] }),
          q({ id: 'm1h2d2-q2', kind: 'mcq', prompt: 'Sonsuz dansı nasıl durdururuz?', options: ['Kedi yorulunca durur', '⏹ Dur düğmesine basarız', 'Bir şey yapmayız'], answer: 1, explanation: 'Sonsuza kadar kendiliğinden bitmez. Sahnenin üstündeki kırmızı Dur düğmesi betiği durdurur.', skills: ['jr-forever'] }),
          q({ id: 'm1h2d2-q3', kind: 'mcq', prompt: 'Sonsuza kadar bloğunun arkasına blok ekleyebilir miyiz?', options: ['Evet, her zaman', 'Hayır, o hiç bitmez'], answer: 1, explanation: 'Sonsuza kadar hiç bitmez. Bu yüzden arkasına blok eklenemez; arkadaki blok hiçbir zaman çalışmazdı.', skills: ['jr-forever', 'jr-sequence'] }),
          q({ id: 'm1h2d2-q4', kind: 'predict-output', prompt: 'Kedi kaç kez büyür?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ⤴️ Zıpla 1', '  🔼 Büyü'), options: ['1 kez', '2 kez', '4 kez'], answer: 1, explanation: 'Büyü, Tekrarla\'nın içinde. Tekrarla 2 olduğu için Büyü 2 kez çalışır.', skills: ['jr-repeat', 'jr-looks'] }),
          q({ id: 'm1h2d2-q5', kind: 'numeric', prompt: 'Kedi toplam kaç adım yürür?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 5', '  ➡️ İleri 2'), answer: 10, unit: 'adım', explanation: 'İleri 2, beş kez çalışır: 5 × 2 = 10 adım.', skills: ['jr-repeat', 'jr-motion'] }),
        ],
      },
    ],
  },

  // ---------------- Hafta 3: Ne olunca ne olsun? ----------------
  {
    guideMd: rehber({
      hedefler: [
        'Olayın (dokunmanın) bir betiği başlattığını söyler.',
        'Olay olmayınca hiçbir şey olmadığını bilir.',
        'Dokununca bloğuyla bir karaktere tepki verdirir.',
        'Her karakterin kendi betiği olduğunu ve betiğin seçili karaktere yazıldığını bilir.',
        'Bekle bloğuyla konuşmaların sırasını ayarlar.',
      ],
      plan: [
        ['1', 'Olay: dokununca ne olur?', '~20 dk', 'Karakter seçin, Dokununca bloğuyla ev ve kediyi konuşturun/zıplatın, mini testi çözün.'],
        ['2', 'Dokununca konuşan hayvan', '~30 dk', 'Hayvanı konuşturun, Bekle ekleyin, bonus olarak topu ekleyin, mini testi çözün.'],
      ],
      onkosul: [
        'Yeşil bayrağın betiği başlattığını hatırlıyor mu?',
        'Sahnedeki bir karaktere dokunup seçebiliyor mu?',
        'Yazı kutusuna kısa bir cümle yazabiliyor mu?',
      ],
      harita: [
        '**Olay:** bir şey olunca başlayan betik (dokunma)',
        '**Dokununca:** karaktere dokununca betiği başlatan blok',
        '**Karakterin betiği:** her karakterin kendi betiği',
        '**Söyle ve Bekle:** konuşma balonu ve bekleme',
      ],
      hatalar: [
        '**Yanlış karakter seçili.** Betik başka karakterin olur; seçili karaktere bakın.',
        '**Dokununca yerine Yeşil bayrak koymak.** Dokununca tepki gelmez.',
        '**Bekle koymamak.** İki cümle üst üste biner gibi hızlı geçer.',
        '**Başlat\'a basmak.** Dokununca betiği için Başlat\'a basmak gerekmez; karaktere dokunmak yeter.',
        '**Boş yazı kutusu.** Söyle bloğu boşsa karakter bir şey söylemez.',
      ],
      tekrar: [
        'Kavram kartlarındaki "Sık yapılan yanlış" satırlarını yüksek sesle okuyun.',
        'Mini testte yanlış yapılan sorunun açıklamasını birlikte okuyun, sonra yeniden çözün.',
        'Ev ve hayvan betiklerini yeniden kurun; bu sefer farklı sözler seçin.',
        'Çocuğa şunu sorun: "Yeşil bayrakla Dokununca arasında ne fark var?"',
      ],
      olcut: [
        ['Olay', 'Betiği başlatamıyor', 'Dokununca bloğuyla betiği başlatıyor', 'Yeşil bayrak ve Dokununca farkını anlatıyor'],
        ['Karakter', 'Betik yanlış karakterde kalıyor', 'Doğru karakteri seçip betik yazıyor', 'İki karaktere ayrı betik verip nedenini anlatıyor'],
        ['Konuşma', 'Karakter konuşmuyor', 'Söyle ile bir cümle söyletiyor', 'Söyle, Bekle, Söyle sırasıyla sohbet kuruyor'],
        ['Anlatım', 'Ne yaptığını söylemiyor', 'Kendi sözleriyle anlatıyor', 'Hatasını bulup düzeltmeyi anlatıyor'],
      ],
      not: [
        '**Amaç.** Bu hafta "olay" fikri: bilgisayar bir şey olmasını bekler. Terimi ezberletmek şart değil.',
        '**Nasıl destek olunur?** "Hiçbir şeye dokunmazsak ne olur?" diye sorun. Cevabı çocuk denesin.',
        '**Karakter seçimi.** Betiklerin seçili karaktere ait olduğunu birlikte kontrol edin.',
        '**Bekle.** "Konuşma balonu çok çabuk kayboluyor, nasıl yavaşlatırız?" Çözümü çocuk bulsun.',
        '**Süre.** Kısa tutun; çocuk sıkılınca durun.',
        '**İlerleme.** Mini test sonuçları "İlerlemem" sayfasında görünür (taslak özellik).',
      ],
    }),
    lessons: [
      // 3.1 Olay
      {
        explainerMd: `### Bu derste öğreneceklerin
- Bir şey olmazsa bilgisayar da bir şey yapmaz.
- Dokununca bloğu, karaktere dokununca betiği başlatır.
- Her karakterin kendi betiği vardır.

### Önceden bilmen gerekenler
1. hafta: betik ve Yeşil bayrak.

### Kapı çalınca
Kapı çalınca "Kim o?" dersin. Kapı çalmazsa bir şey demezsin. Buna **olay** denir: bir şey olur, sen cevap verirsin.

Bilgisayarda da böyledir. **Dokununca** bloğu bir olaydır. Betiğin en üstüne koyarsan, karaktere dokununca betik çalışır. Dokunmazsan hiçbir şey olmaz. Bilgisayar sabırla bekler.

Her karakterin **kendi** betiği vardır. Önce karakteri seç, sonra ona blok ekle. Evi seçtiysen bloklar evin olur. Kediyi seçtiysen kedinin olur. Seçili karakteri her zaman kontrol et.

### Birlikte konuşun
"Hiçbir şeye dokunmazsak ne oldu?"

### Özet
Olay olunca betik çalışır. Dokununca bloğu karaktere dokununca başlatır. Her karakterin kendi betiği var.`,
        concepts: [
          { term: 'Olay', definition: 'Bir şeyin olması. Olay olunca betik çalışır.', example: 'Eve dokunmak bir olaydır; ev "Kim o?" der.', pitfall: 'Olay olmasa da betiğin çalışacağını sanmak. Dokunmazsan hiçbir şey olmaz.' },
          { term: 'Dokununca', definition: 'Karaktere dokununca betiği başlatan blok.', example: 'Kediye dokununca Zıpla çalışır.', pitfall: 'Dokununca yerine Yeşil bayrak koymak. Dokununca tepki gelmez.' },
          { term: 'Karakterin betiği', definition: 'Her karakterin kendi blokları. Bloklar seçili karaktere yazılır.', example: 'Evi seçip Söyle eklersen ev konuşur.', pitfall: 'Yanlış karakter seçili olmak. Blok başka karakterin olur.' },
          { term: 'Söyle', definition: 'Karakterin konuşma balonunda bir şey söylemesini sağlayan blok.', example: 'Söyle bloğuna "Kim o?" yazarsan ev "Kim o?" der.', pitfall: 'Yazı kutusunu boş bırakmak. Karakter bir şey söylemez.' },
        ],
        quiz: [
          q({ id: 'm1h3d1-q1', kind: 'mcq', prompt: 'Bir karakterin hiç betiği yok. Başlat\'a basınca ne olur?', options: ['Karakter kendiliğinden konuşur', 'Hiçbir şey olur'], answer: 1, explanation: 'Betik yoksa olay da yoktur. Bilgisayar yalnızca betiğe bakar; olay olmadan bir şey yapmaz.', skills: ['jr-events'] }),
          q({ id: 'm1h3d1-q2', kind: 'mcq', prompt: 'Kedi dokununca zıplasın. En üste hangi bloğu koyarız?', options: ['⏹ Dur', '🏁 Yeşil bayrak', '👆 Dokununca'], answer: 2, explanation: 'Dokununca bloğu, karaktere dokununca betiği başlatır. Yeşil bayrak yalnız Başlat düğmesine basınca çalışır.', skills: ['jr-events', 'jr-start-block'] }),
          q({ id: 'm1h3d1-q3', kind: 'predict-output', prompt: 'Eve bir kez dokununca ne olur?\n\n' + kod('👆 Dokununca', '💬 Söyle "Kim o?"', '⏱️ Bekle 1', '💬 Söyle "Gir!"'), options: ['Önce "Kim o?" der, sonra bekler, sonra "Gir!" der', 'Hiçbir şey olmaz', 'Yalnız "Gir!" der'], answer: 0, explanation: 'Bloklar sırayla çalışır: söyle, bekle, söyle. "Kim o?" önce gelir, "Gir!" sonra gelir.', skills: ['jr-events', 'jr-timing', 'jr-sequence'] }),
          q({ id: 'm1h3d1-q4', kind: 'find-bug', prompt: 'Kediye dokununca zıplamıyor.\n\n' + kod('🏁 Yeşil bayrak', '⤴️ Zıpla 1') + '\n\nHata ne?', options: ['Zıpla bloğu yanlış', 'Üstte Dokununca bloğu olmalı'], answer: 1, explanation: 'Yeşil bayraklı betik, Başlat\'a basınca çalışır. Dokununca zıplaması için en üstte Dokununca bloğu olmalı.', skills: ['jr-events', 'jr-debug'] }),
        ],
      },
      // 3.2 Dokununca konuşan hayvan
      {
        explainerMd: `### Bu derste öğreneceklerin
- Hayvana dokununca konuşturmak.
- Bekle ile sözlerin arasını açmak.
- Betikler seçili karaktere yazılır.

### Önceden bilmen gerekenler
3. hafta, 1. ders: Dokununca bloğu.

### Hayvan konuşuyor
Hayvana dokununca konuşsun istiyorsan betiğin en üstüne **Dokununca** koy. Altına **Söyle** ekle ve cümleni yaz. Başlat\'a basman gerekmez; hayvana dokunmak yeter.

Hayvan iki cümle söylesin istersen **Bekle** kullan. Bekle, sıradaki bloğu biraz bekletir. Böylece söz, bekle, söz olur. Hayvan sohbet ediyor gibi konuşur. Bekle\'deki sayı ne kadar bekleneceğini söyler.

Betikler karakterlere aittir. Topa zıplamak için önce **topu seç**, sonra ona betik ver. Köpeğin betiği köpeğin kalır. Önce hangi karakteri seçtiğine dikkat et. Sonra blokları ekle.

### Birlikte konuşun
"Hayvan ne zaman konuştu: bayrağa basınca mı, dokununca mı?"

### Özet
Dokununca ile hayvanı konuşturursun. Bekle sözleri ayırır. Her karakterin betiği kendisinindir.`,
        concepts: [
          { term: 'Dokununca', definition: 'Karaktere dokununca betiği başlatan blok.', example: 'Köpeğe dokununca "Merhaba!" der.', pitfall: 'Dokununca betiği için Başlat\'a basmak. Karaktere dokunmak yeter.' },
          { term: 'Bekle', definition: 'Sıradaki bloğu biraz bekleten Kontrol bloğu.', example: 'Söyle, Bekle 1, Söyle ile iki cümle ayrı söylenir.', pitfall: 'Bekle koymamak. Sözler art arda gelir, anlaşılmaz.' },
          { term: 'Seçili karakter', definition: 'Şu anda blok eklenen karakter. Karakter şeridinden seçilir.', example: 'Topu seçince betik topun olur.', pitfall: 'Yanlış karakter seçili olmak. Betik başka karakterde kalır.' },
          { term: 'Karakter ekleme', definition: 'Karakter şeridindeki + ile sahneye yeni karakter koymak.', example: '+ ile Top\'u ekleyip ona Zıpla verirsin.', pitfall: 'Karakteri ekleyip betik vermemek. Karakter kıpırdamaz.' },
        ],
        quiz: [
          q({ id: 'm1h3d2-q1', kind: 'mcq', prompt: 'Betik köpeğin.\n\n' + kod('👆 Dokununca', '💬 Söyle "Merhaba!"') + '\n\nKöpek ne zaman konuşur?', options: ['Topa dokununca', 'Köpeğe dokununca'], answer: 1, explanation: 'Betik köpeğe ait. Köpeğe dokununca köpek konuşur. Topa dokunmak bu betiği çalıştırmaz.', skills: ['jr-sprite-scripts', 'jr-events'] }),
          q({ id: 'm1h3d2-q2', kind: 'mcq', prompt: 'Bekle bloğu ne yapar? ⏱️', options: ['Karakteri gizler', 'Bir sonraki bloğu biraz bekletir', 'Sesi çalar'], answer: 1, explanation: 'Bekle, sıradaki bloğun başlamasını geciktirir. Böylece iki söz arasında boşluk olur.', skills: ['jr-timing'] }),
          q({ id: 'm1h3d2-q3', kind: 'numeric', prompt: 'Köpeğe bir kez dokununca kaç cümle söyler?\n\n' + kod('👆 Dokununca', '💬 Söyle "Merhaba!"', '⏱️ Bekle 1', '💬 Söyle "Oynar mısın?"'), answer: 2, unit: 'cümle', explanation: 'İki Söyle bloğu var, ikisi de sırayla çalışır. Bekle cümle söylemez.', skills: ['jr-timing', 'jr-events'] }),
          q({ id: 'm1h3d2-q4', kind: 'find-bug', prompt: 'Topa dokununca zıplamıyor. Zıpla betiğini köpeğe yazdım. Hata ne?', options: ['Top çok küçük', 'Betik köpeğin; topu seçip ona yazmalıyım'], answer: 1, explanation: 'Betikler seçili karaktere yazılır. Topun zıplaması için topu seçip ona Dokununca ve Zıpla vermek gerekir.', skills: ['jr-sprite-scripts', 'jr-debug'] }),
          q({ id: 'm1h3d2-q5', kind: 'mcq', prompt: 'Dokununca bloğu olan hayvan için Başlat\'a basmak gerekir mi?', options: ['Evet, hep basmak gerekir', 'Hayır, hayvana dokunmak yeter'], answer: 1, explanation: 'Dokununca betiği karaktere dokununca başlar. Başlat düğmesi yalnız Yeşil bayraklı betikler içindir.', skills: ['jr-events', 'jr-start-block'] }),
        ],
      },
    ],
  },

  // ---------------- Hafta 4: Hikâyenin sahneleri ----------------
  {
    guideMd: rehber({
      hedefler: [
        'Hikâyenin başı, ortası ve sonu olduğunu söyler.',
        'Sayfa ekler, arka planı seçer ve her sayfaya karakter koyar.',
        'Sayfaya git bloğuyla hikâyeyi bir sayfadan ötekine geçirir.',
        'Her sayfadaki karakterin ve betiğin ayrı olduğunu bilir.',
        'Planladığı hikâyeyi blokla bağlar.',
      ],
      plan: [
        ['1', 'Başı, ortası, sonu', '~20 dk', 'Hikâyeyi üç sahneye bölün, sayfaları ekleyin, arka planları seçin, mini testi çözün.'],
        ['2', 'İki sayfalı hikâye', '~30 dk', 'Karakterlere Yeşil bayrak betiği yazın, Sayfaya git ile sahneleri bağlayın, mini testi çözün.'],
      ],
      onkosul: [
        'Yeşil bayrak, Söyle ve İleri bloklarını kullanabiliyor mu?',
        'Kısa bir hikâyeyi başı, ortası ve sonuyla anlatabiliyor mu?',
        'Sayfa şeridindeki + düğmesini bulabiliyor mu?',
      ],
      harita: [
        '**Hikâye:** başı, ortası, sonu',
        '**Sayfa:** hikâyenin bir sahnesi',
        '**Arka plan:** sayfanın manzarası',
        '**Sayfaya git:** hikâyeyi başka sayfaya geçirir',
      ],
      hatalar: [
        '**Her şeyi tek sayfaya sığdırmak.** Sahne değişiyorsa yeni sayfa ekleyin.',
        '**2. sayfaya karakter koymamak.** Her sayfanın karakterleri ayrıdır.',
        '**2. sayfada başlatma bloğu koymamak.** Betik başlamaz; Yeşil bayrak gerekir.',
        '**Sayfaya git\'teki sayıyı sayfa sayısı sanmak.** Sayı, gidilecek sayfanın numarasıdır.',
        '**Sayfayı yanlışlıkla silmek.** Sayfayı sil düğmesi o sayfanın her şeyini siler.',
      ],
      tekrar: [
        'Kavram kartlarına bir daha bakın ve "Sık yapılan yanlış" satırlarını yüksek sesle okuyun.',
        'Mini testte yanlış yapılan sorunun açıklamasını birlikte okuyun, sonra yeniden çözün.',
        'Hikâyeyi bu sefer farklı karakter ve arka planla yeniden kurun.',
        'Çocuğa şunu sorun: "Hikâyen kaç sahne? Hangisi önce?"',
      ],
      olcut: [
        ['Plan', 'Hikâyenin sahneleri belli değil', 'Başı, ortası ve sonu var', 'Her sahneyi kendi sözleriyle anlatıyor'],
        ['Sayfalar', 'Yalnız bir sayfa var', 'En az iki sayfa ve farklı arka plan var', 'Her sayfada uygun karakter var'],
        ['Geçiş', 'Sayfa geçişi çalışmıyor', 'Sayfaya git ile 2. sayfaya geçiyor', 'Neden Yeşil bayrak gerektiğini anlatıyor'],
        ['Anlatım', 'Ne yaptığını söylemiyor', 'Hikâyeyi sırayla anlatıyor', 'Hikâyeyi başka bir sona çevirmeyi düşünüyor'],
      ],
      not: [
        '**Amaç.** Bu hafta çocuk önce planlamayı öğreniyor, sonra bloğa geçiyor.',
        '**Nasıl destek olunur?** Önce hikâyeyi sözle anlattırın: "İlk sahnede ne var? İkincide ne değişti?"',
        '**Sayfalar.** Her sayfanın karakterleri ayrıdır. 2. sayfada yeniden eklemek gerekir.',
        '**Sayfayı sil.** O sayfanın her şeyini siler; birlikte dikkatli olun.',
        '**Süre.** Hikâye kurmak uzun sürebilir. Çocuk yorulursa ikinci sahneyi başka güne bırakın.',
        '**İlerleme.** Mini test sonuçları "İlerlemem" sayfasında görünür (taslak özellik).',
      ],
    }),
    lessons: [
      // 4.1 Başı, ortası, sonu
      {
        explainerMd: `### Bu derste öğreneceklerin
- Hikâyenin başı, ortası ve sonu vardır.
- Her sahne bir sayfa olur.
- Sayfaya arka plan ve karakter eklenir.

### Önceden bilmen gerekenler
Hiçbir şey. Küçük bir hikâye düşünmen yeter.

### Hikâyeyi önce planla
Hikâyenin **başı**, **ortası** ve **sonu** vardır. Örneğin: kedi evden çıkar, yağmur başlar, kedi eve döner. Bu üç parça üç **sahne** olur.

Uygulamada her sahne bir **sayfadır**. Sayfa şeridindeki **+** yeni sayfa ekler. Her sayfaya bir **arka plan** seçersin: Çimen, Gece ya da Oda. Karakter şeridindeki **+** ile karakter ekleyebilirsin.

Sahneler doğru sırada olursa herkes hikâyeni anlar. Sırayı bozarsan hikâye anlaşılmaz. Sonu başa koyarsan kedi eve döner, sonra evden çıkar!

### Birlikte konuşun
"Hikâyen kaç sahne? Hangisi önce?"

### Özet
Hikâye başı, ortası ve sonuyla planlanır. Her sahne bir sayfa olur.`,
        concepts: [
          { term: 'Sahne', definition: 'Hikâyenin bir parçası. Uygulamada bir sayfadır.', example: 'Kedinin evden çıkması birinci sahnedir.', pitfall: 'Her şeyi tek sahneye sığdırmak. Hikâye anlaşılmaz.' },
          { term: 'Başı, ortası, sonu', definition: 'Hikâyenin üç parçası, bu sırayla anlatılır.', example: 'Kedi çıkar, yağmur başlar, kedi döner.', pitfall: 'Sırayı karıştırmak. Sonu başa koyunca hikâye anlaşılmaz.' },
          { term: 'Sayfa', definition: 'Sahnenin bulunduğu yer. Sayfa şeridinden + ile eklenir.', example: '+ ye iki kez basınca 3 sayfa olur.', pitfall: 'Sayfa eklemeyi unutmak. İkinci sahne için yer olmaz.' },
          { term: 'Arka plan', definition: 'Sayfanın manzarası.', example: 'Gece sahnesi için Gece arka planı seçilir.', pitfall: 'Aynı arka planı her sayfaya koymak. Sahnelerin farkı anlaşılmaz.' },
        ],
        quiz: [
          q({ id: 'm1h4d1-q1', kind: 'mcq', prompt: 'Hikâyenin üç parçası hangisi?', options: ['Mavi, kırmızı, sarı', 'Başı, ortası, sonu', 'Yalnız sonu'], answer: 1, explanation: 'Her hikâyenin bir başı, bir ortası, bir sonu vardır. Renkler hikâyenin parçası değildir.', skills: ['jr-planning'] }),
          q({ id: 'm1h4d1-q2', kind: 'numeric', prompt: 'Başta 1 sayfan var. Sayfa şeridindeki + düğmesine 2 kez basarsan kaç sayfan olur? ➕', answer: 3, unit: 'sayfa', explanation: 'Her basış bir sayfa ekler: 1 + 1 + 1 = 3 sayfa.', skills: ['jr-pages'] }),
          q({ id: 'm1h4d1-q3', kind: 'mcq', prompt: 'Sayfanın manzarasını nereden değiştirirsin?', options: ['Çöp kutusundan', 'Dur düğmesinden', 'Arka plan listesinden'], answer: 2, explanation: 'Arka plan listesi sayfanın manzarasını seçtirir. Çöp kutusu blok siler, Dur düğmesi betiği durdurur.', skills: ['jr-pages'] }),
          q({ id: 'm1h4d1-q4', kind: 'find-bug', prompt: 'Hikâye sırası böyle:\n\n' + kod('1) Kedi eve döner', '2) Yağmur başlar', '3) Kedi evden çıkar') + '\n\nHangi sahne yanlış yerde?', options: ['Yağmur başlar: ilk olmalı', 'Kedi evden çıkar: son olmalı', 'Kedi eve döner: son olmalı'], answer: 2, explanation: 'Kedi önce evden çıkar, sonra yağmur başlar, en sonda eve döner. "Eve döner" hikâyenin sonu olmalı.', skills: ['jr-planning', 'jr-debug'] }),
        ],
      },
      // 4.2 İki sayfalı hikâye
      {
        explainerMd: `### Bu derste öğreneceklerin
- Hikâyeyi iki sayfaya bölmek.
- Sayfaya git bloğuyla ikinci sahneye geçmek.
- Yeni sayfada da betik gerekir.

### Önceden bilmen gerekenler
4. hafta, 1. ders: sayfa ve arka plan.

### Sahneden sahneye
Birinci sayfada kedi yürür ve bir şey söyler. Sonra ikinci sahneye geçmek istersin. Bunun için betiğin sonuna **Sayfaya git** bloğunu koyarsın. İçindeki sayı, **gidilecek sayfanın numarasıdır**. 2 yazarsan ikinci sayfaya gider.

Her sayfanın karakterleri **ayrıdır**. İkinci sayfaya karakter eklemen gerekir. O karakterin de betiği olmalı. Betik **Yeşil bayrak** ile başlarsa, sayfa değişince kendiliğinden çalışır.

Sayfaya git sonda durur; arkasına blok eklenmez. Böylece sahne değişir ve hikâye devam eder.

### Birlikte konuşun
"Birinci sahneden ikinciye hangi blok geçirdi?"

### Özet
Sayfaya git, hikâyeyi başka sayfaya geçirir. Yeni sayfadaki karakterin de Yeşil bayraklı betiği olmalı.`,
        concepts: [
          { term: 'Sayfaya git', definition: 'Hikâyeyi numarası yazılan sayfaya geçiren blok.', example: 'Sayfaya git 2, ikinci sayfaya götürür.', pitfall: 'İçindeki sayıyı sayfa sayısı sanmak. O, gidilecek sayfanın numarasıdır.' },
          { term: 'Sayfa numarası', definition: 'Sayfanın sırası: 1, 2, 3...', example: 'İkinci sahne 2. sayfadadır.', pitfall: 'Olmayan bir sayfaya gitmek. Önce sayfayı eklemelisin.' },
          { term: 'Sayfanın karakterleri', definition: 'Her sayfanın kendi karakterleri ve betikleri vardır.', example: '2. sayfada ev ekleyip ona Söyle verirsin.', pitfall: '2. sayfaya karakter eklemeyi unutmak. Sahne boş kalır.' },
          { term: 'Yeni sayfada başlatma', definition: 'Sayfa değişince o sayfadaki Yeşil bayraklı betikler kendiliğinden çalışır.', example: 'Ev "Hoş geldin!" der, çünkü betiği Yeşil bayrakla başlar.', pitfall: 'Yeni sayfadaki betiğe başlatma bloğu koymamak. Betik çalışmaz.' },
        ],
        quiz: [
          q({ id: 'm1h4d2-q1', kind: 'mcq', prompt: 'Hikâyeyi 1. sayfadan 2. sayfaya hangi blok geçirir?', options: ['Zıpla', 'Bekle', 'Sayfaya git'], answer: 2, explanation: 'Sayfaya git, hikâyeyi numarası yazılan sayfaya geçirir. Zıpla ve Bekle sayfa değiştirmez.', skills: ['jr-pages'] }),
          q({ id: 'm1h4d2-q2', kind: 'mcq', prompt: 'Sayfaya git bloğundaki 2 ne demek? 📄', options: ['2 saniye bekle', '2. sayfaya git', '2 kez zıpla'], answer: 1, explanation: 'Sayfaya git\'in sayısı, gidilecek sayfanın numarasıdır. 2 yazılırsa 2. sayfaya geçilir.', skills: ['jr-pages'] }),
          q({ id: 'm1h4d2-q3', kind: 'predict-output', prompt: '1. sayfa:\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '💬 Söyle "Eve gidiyorum!"', '📄 Sayfaya git 2') + '\n\n2. sayfada ev:\n\n' + kod('🏁 Yeşil bayrak', '💬 Söyle "Hoş geldin!"') + '\n\nBaşlat\'a basınca ne olur?', options: ['Yalnız ev konuşur', 'Önce kedi konuşur, sonra 2. sayfada ev "Hoş geldin!" der', 'İki sayfa aynı anda görünür'], answer: 1, explanation: 'Kedi yürür ve konuşur, sonra Sayfaya git 2. sayfaya geçer. Orada evin Yeşil bayraklı betiği çalışır ve ev "Hoş geldin!" der.', skills: ['jr-pages', 'jr-sequence'] }),
          q({ id: 'm1h4d2-q4', kind: 'find-bug', prompt: '2. sayfada ev konuşmuyor.\n\n' + kod('💬 Söyle "Hoş geldin!"') + '\n\nHata ne?', options: ['Ev çok büyük', 'Betiğin üstünde Yeşil bayrak yok'], answer: 1, explanation: 'Sayfa değişince yalnız Yeşil bayraklı betikler kendiliğinden başlar. Başlatma bloğu olmayan betik çalışmaz.', skills: ['jr-start-block', 'jr-pages', 'jr-debug'] }),
          q({ id: 'm1h4d2-q5', kind: 'numeric', prompt: 'Hikâyende 2 sayfa var. Sayfa şeridindeki + düğmesine 2 kez daha basarsan kaç sayfan olur?', answer: 4, unit: 'sayfa', explanation: '2 sayfa vardı, iki sayfa daha eklendi: 2 + 2 = 4 sayfa.', skills: ['jr-pages'] }),
        ],
      },
    ],
  },

  // ---------------- Hafta 5: Hata yapmak programcının işi ----------------
  {
    guideMd: rehber({
      hedefler: [
        'Hata bulmanın programcılığın doğal bir parçası olduğunu söyler.',
        'Çalışmayan bir programda eksik başlatma bloğu, yanlış yön ve yanlış sayıyı arar.',
        'Hatayı bulunca neyi düzelttiğini anlatır.',
        'Tekrar, konuşma ve sayfa bloklarını birleştirerek kendi hikâyesini kurar.',
        'Projesini aileye sunar ve anlatır.',
      ],
      plan: [
        ['1', 'Hata avı', '~25 dk', 'Bozuk programı çalıştırın, hataları bulup düzeltin, mini testi çözün.'],
        ['2', 'Benim hikâyem (final)', '~40 dk', 'Hikâyeyi planlayın, kurun, deneyin ve aileye sunun. Gerekirse iki güne bölün.'],
      ],
      onkosul: [
        'Yeşil bayrak, Tekrarla, Söyle ve Sayfaya git bloklarını kullanabiliyor mu?',
        'Bir betiğin neden çalışmadığını merak edip bakabiliyor mu?',
        'Hikâyesini sözle anlatabiliyor mu?',
      ],
      harita: [
        '**Hata:** programın beklediğin gibi çalışmaması',
        '**Hata ayıklama:** hatayı bulup düzeltmek',
        '**Başlatma bloğu:** olmazsa betik çalışmaz',
        '**Yön ve sayı:** yanlış dönüş, yanlış adım ya da tekrar sayısı',
      ],
      hatalar: [
        '**Hata yapınca bırakmak.** Hata normaldir; nerede durduğuna bakın.',
        '**Betiğe başlatma bloğu koymayı unutmak.** Betik soluk görünür ve çalışmaz.',
        '**Yanlış yöne dönmek.** Sağa dön ile Sola dönü kontrol edin.',
        '**Tekrar sayısını az yazmak.** Kedi yıldıza varamaz.',
        '**Ayrı kalan bloğa bayrak koymak.** Betiğin parçası olması gereken blok, ana betiğe yapıştırılmalı; ayrı betik olursa sıra bozulur.',
        '**Finalde hedefleri unutmak.** En az bir tekrar, bir Söyle ve iki sayfa olmalı.',
      ],
      tekrar: [
        'Kavram kartlarındaki "Sık yapılan yanlış" satırlarını yüksek sesle okuyun.',
        'Mini testte yanlış yapılan soruların açıklamasını birlikte okuyun, sonra yeniden çözün.',
        'Hata avı programını sıfırdan bozup yeniden düzeltin.',
        'Çocuğa şunu sorun: "En zor hata hangisiydi? Nasıl buldun?"',
      ],
      olcut: [
        ['Hata bulma', 'Hatayı bulamıyor', 'En az bir hatayı bulup düzeltiyor', 'Üç hatayı bulup her birini anlatıyor'],
        ['Hikâye', 'Hikâye çalışmıyor', 'Tekrar, Söyle ve iki sayfa var', 'Hikâyede farklı kategorilerden bloklar karışıyor'],
        ['Deneme', 'Hiç denemiyor', 'Sık sık Başlat\'a basıp deniyor', 'Sorunu bulunca düzeltip yeniden deniyor'],
        ['Sunum', 'Anlatamıyor', 'Hikâyesini aileye anlatıyor', 'Nasıl yaptığını ve neyi değiştireceğini anlatıyor'],
      ],
      not: [
        '**Amaç.** Bu hafta hata yapmanın normal olduğunu göstermek. "Yanlış yaptın" yerine "Hata yakaladın!" deyin.',
        '**Nasıl destek olunur?** Takılınca ipucu verin: "Kedi nerede durdu? Orada hangi blok bitti?"',
        '**Hata avı.** Çocuk hataları bulsun, siz bulmayın. Hatayı bulunca neyi düzelttiğini yüksek sesle anlatmasını isteyin.',
        '**Final.** Planı çocuk yapsın. Hedefler alt sınırdır; çocuk daha fazlasını eklemekte özgür.',
        '**Sunum.** Sorular sorun: "Bu karakter neden böyle yapıyor?" "Bunu nasıl yaptın?"',
        '**İlerleme.** Mini test sonuçları "İlerlemem" sayfasında görünür (taslak özellik).',
      ],
    }),
    lessons: [
      // 5.1 Hata avı
      {
        explainerMd: `### Bu derste öğreneceklerin
- Hata yapmak programcının işinin bir parçasıdır.
- Hata bulup düzeltmek hata ayıklamadır.
- Bozuk programda nelere bakmalı.

### Önceden bilmen gerekenler
1., 2. ve 3. haftalar: sıra, tekrar, olay.

### Dedektif ol
Bazen program istediğin gibi çalışmaz. Bu bir **hatadır**. Programcılar hata bulunca üzülmez. Önce **bakarlar**: kedi nerede durdu? Hangi blok bitti? Sonra düzeltip yeniden denerler. Buna **hata ayıklama** denir.

Şunlara bak:
- Betiğin en üstünde **başlatma bloğu** var mı? Yoksa o betiği silme; bloğunu ana betiğin doğru yerine yapıştır (yalnız bayrak eklersen betik ana betikle aynı anda, başlangıç yönüyle çalışır).
- Kedi **yanlış yöne** mi dönüyor?
- **Sayı** az mı? Tekrarla ya da İleri\'nin sayısı küçük olabilir.

Her düzeltmeden sonra Başlat\'a bas ve dene. Hata bulmak bir oyun gibidir. Ne kadar çok bulursan o kadar iyi programcı olursun.

### Birlikte konuşun
"En zor hangi hatayı buldun? Nasıl buldun?"

### Özet
Hata normaldir. Bak, düzelt, yeniden dene. Üç şeye bak: başlatma bloğu, yön, sayı.`,
        concepts: [
          { term: 'Hata', definition: 'Programın istediğin gibi çalışmaması.', example: 'Kedi yıldıza varamadı; bir hata var.', pitfall: 'Hatayı utanç sanmak. Programcılar sürekli hata bulur.' },
          { term: 'Hata ayıklama', definition: 'Hatayı bulup düzeltmek.', example: 'Tekrarla sayısını 2\'den 3\'e çıkarıp yeniden denemek.', pitfall: 'Hepsini silip baştan başlamak. Önce nerede durduğuna bak.' },
          { term: 'Başlatma bloğu', definition: 'Betiğin en üstündeki Yeşil bayrak ya da Dokununca bloğu.', example: 'Yeşil bayrak, betiği Başlat\'a basınca çalıştırır.', pitfall: 'Betikte başlatma bloğu olmaması. Betik soluk görünür ve çalışmaz.' },
          { term: 'Yanlış yön', definition: 'Sağa dön ile Sola dönün karışması.', example: 'Yıldız yukarıdaysa Sola dön gerekir.', pitfall: 'Her zaman Sağa dön koymak. Robot ters yöne gider.' },
          { term: 'Yanlış sayı', definition: 'İleri ya da Tekrarla\'daki sayının küçük ya da büyük olması.', example: 'Tekrarla 2 yerine 3 olmalıydı.', pitfall: 'Sayıya bakmamak. Kedi yıldızdan önce durur.' },
        ],
        quiz: [
          q({ id: 'm1h5d1-q1', kind: 'mcq', prompt: 'Programım çalışmıyor. Programcı ne yapar?', options: ['Bilgisayarı kapatır', 'Nerede durduğuna bakar ve düzeltir', 'Hiçbir şey yapmaz'], answer: 1, explanation: 'Programcılar önce hatanın nerede olduğuna bakar. Sonra düzeltir ve yeniden dener. Hata yapmak normaldir.', skills: ['jr-debug'] }),
          q({ id: 'm1h5d1-q2', kind: 'predict-output', prompt: 'Kedi sağa 9 adım gitti. Yıldız yukarıda. Sonra şunu yaptı:\n\n' + kod('↩️ Sağa dön', '➡️ İleri 8') + '\n\nKedi hangi yöne yürür?', options: ['⬆️ Yukarı', '⬇️ Aşağı', '⬅️ Sola'], answer: 1, explanation: 'Sağa bakan kedi Sağa dön yapınca aşağı bakar. Yıldıza yukarı çıkması için Sola dön gerekir.', skills: ['jr-motion', 'jr-debug'] }),
          q({ id: 'm1h5d1-q3', kind: 'find-bug', prompt: 'Kedi yıldızdan önce duruyor. Yıldız için kedinin sağa 9 adım gitmesi gerek.\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ➡️ İleri 3', '↪️ Sola dön') + '\n\nHata ne?', options: ['Sola dön yanlış', 'Zıpla eksik', 'Tekrarla 2 olmuş; 3 olmalı'], answer: 2, explanation: '2 × 3 = 6 adım olur, 9 değil. Tekrarla 3 olursa 3 × 3 = 9 adım eder. Sola dön yukarı çıkmak için doğrudur.', skills: ['jr-debug', 'jr-repeat'] }),
          q({ id: 'm1h5d1-q4', kind: 'numeric', prompt: 'Kedi her turda 3 adım yürüyor. Tekrarla 3 olursa toplam kaç adım yürür?\n\n' + kod('🔁 Tekrarla 3', '  ➡️ İleri 3'), answer: 9, unit: 'adım', explanation: 'Üç tur, her turda 3 adım: 3 × 3 = 9 adım.', skills: ['jr-repeat', 'jr-motion'] }),
          q({ id: 'm1h5d1-q5', kind: 'mcq', prompt: 'Betiğin en üstünde başlatma bloğu yok. Başlat\'a basınca ne olur?', options: ['Hemen çalışır', 'Çalışmaz'], answer: 1, explanation: 'Başlatma bloğu olmayan betik soluk görünür ve Başlat\'a basınca çalışmaz. Bu önemli bir hata nedenidir.', skills: ['jr-start-block', 'jr-debug'] }),
        ],
      },
      // 5.2 Benim hikâyem (final)
      {
        explainerMd: `### Bu derste öğreneceklerin
- Öğrendiklerini kendi hikâyende birleştirmek.
- Önce plan, sonra deneme, sonra düzeltme.
- Hikâyeni aileye anlatmak.

### Önceden bilmen gerekenler
Bütün haftalar: sıra, tekrar, olay, sayfa, hata ayıklama.

### Kendi hikâyen
Önce **plan yap**: hangi karakterler, kaç sahne, kim ne yapacak? Sonra blokları kur. Çok blok kullanmak gerekmez. Küçük ve güzel bir hikâye yeter.

Hikâyende şunlar olsun:
- bir **Tekrarla** ya da **Sonsuza kadar**
- bir **Söyle**
- **iki sayfa**

Sık sık Başlat\'a bas ve dene. Çalışmayan bir betik varsa üstünde başlatma bloğu var mı diye bak.

Bitince hikâyeni **aileye sun**. Ne yaptığını ve nasıl yaptığını anlat. Hata olduysa nasıl bulduğunu da söyle.

### Birlikte konuşun
"Hikâyende en çok neyi sevdin? Sonraki sefer neyi değiştirirdin?"

### Özet
Plan yap, kur, dene, düzelt, anlat. Hikâyende tekrar, konuşma ve iki sayfa olsun.`,
        concepts: [
          { term: 'Plan', definition: 'Önce düşünmek: karakterler, sahneler, kim ne yapacak.', example: 'Kedi, ev ve iki sahne: gündüz ve gece.', pitfall: 'Plansız başlayıp kaybolmak. Önce hikâyeni anlat.' },
          { term: 'Deneme', definition: 'Sık sık Başlat\'a basıp bakmak.', example: 'Bir blok ekleyince Başlat\'a basıp kedi ne yaptı diye bakarsın.', pitfall: 'En sonda denemek. Hata nerede bulmak zorlaşır.' },
          { term: 'Hikâye hedefleri', definition: 'Bir Tekrarla ya da Sonsuza kadar, bir Söyle ve iki sayfa.', example: 'Kedi dört kez zıplar, "Yoruldum!" der, ikinci sayfaya geçer.', pitfall: 'Hedefleri unutmak. Hikâyede bir tane eksik kalır.' },
          { term: 'Sunum', definition: 'Hikâyeni aileye gösterip anlatmak.', example: 'Projeyi çalıştırır ve ne yaptığını söylersin.', pitfall: 'Sessiz göstermek. Anlatırsan öğrendiğin kalıcı olur.' },
        ],
        quiz: [
          q({ id: 'm1h5d2-q1', kind: 'mcq', prompt: 'Hikâyeni yapmadan önce ne yapmalısın?', options: ['Hemen sil', 'Plan yap: karakterler ve sahneler', 'Hiçbir şey'], answer: 1, explanation: 'Plan, hikâyede kaybolmanı önler. Hangi karakter, kaç sahne, kim ne yapacak diye düşünürsün.', skills: ['jr-planning'] }),
          q({ id: 'm1h5d2-q2', kind: 'mcq', prompt: 'Final hikâyesinde en az hangileri olmalı?', options: ['Yalnız Zıpla', 'Tekrarla ya da Sonsuza kadar, Söyle ve iki sayfa', 'Yalnız arka plan'], answer: 1, explanation: 'Hedefler: bir tekrar bloğu, bir Söyle ve iki sayfa. Bunlar yalnız alt sınırdır; daha fazlasını ekleyebilirsin.', skills: ['jr-repeat', 'jr-looks', 'jr-pages'] }),
          q({ id: 'm1h5d2-q3', kind: 'numeric', prompt: 'Kedi toplam kaç adım yürür?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ➡️ İleri 2', '  ⤴️ Zıpla 1', '💬 Söyle "Yoruldum!"', '📄 Sayfaya git 2'), answer: 4, unit: 'adım', explanation: 'İleri 2, iki kez çalışır: 2 + 2 = 4 adım. Zıpla ve Söyle adım sayılmaz.', skills: ['jr-repeat', 'jr-motion'] }),
          q({ id: 'm1h5d2-q4', kind: 'find-bug', prompt: 'Hikâyem çalışmıyor.\n\n' + kod('➡️ İleri 3', '💬 Söyle "Merhaba!"', '⤴️ Zıpla 1') + '\n\nİlk neye bakmalıyım?', options: ['Arka plan rengine', 'Üstte başlatma bloğu var mı diye'], answer: 1, explanation: 'Başlatma bloğu olmayan betik çalışmaz. Üste Yeşil bayrak ya da Dokununca koymak gerekir.', skills: ['jr-start-block', 'jr-debug'] }),
          q({ id: 'm1h5d2-q5', kind: 'predict-output', prompt: 'Kedinin betiği:\n\n' + kod('🏁 Yeşil bayrak', '♾️ Sonsuza kadar', '  ⤴️ Zıpla 1') + '\n\nKedi ne zaman durur?', options: ['Bir kez zıplayınca', '⏹ Dur\'a basınca', 'Hiçbir şey yapmasam bile durur'], answer: 1, explanation: 'Sonsuza kadar hiç bitmez. Kedi, Dur düğmesine basılana kadar zıplar.', skills: ['jr-forever'] }),
        ],
      },
    ],
  },
]
