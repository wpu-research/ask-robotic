// Kazanım–değer matrisi: her modül haftası için bir TYMM değeri, o değerin derste gözlenebilir eylemi ve öğrencinin
// hafta sonunda gösterdiği kazanım çıktısı. Öğretmen sayfası (/ogretmen/kazanim) ve gelişim karnesi kullanır.
// Değer listesi Türkiye Yüzyılı Maarif Modeli değerlerinin bir alt kümesidir. MEB kazanım kodları burada tutulmaz:
// kodlar okulun müfredat eşleştirmesiyle eklenmeli, tahmin edilmemeli.

export const DEGERLER = {
  adalet: 'Adalet',
  caliskanlik: 'Çalışkanlık',
  dostluk: 'Dostluk',
  duyarlilik: 'Duyarlılık',
  durustluk: 'Dürüstlük',
  estetik: 'Estetik',
  mahremiyet: 'Mahremiyet',
  merhamet: 'Merhamet',
  sabir: 'Sabır',
  saygi: 'Saygı',
  sorumluluk: 'Sorumluluk',
  tasarruf: 'Tasarruf',
  yardimseverlik: 'Yardımseverlik',
} as const

export type DegerKey = keyof typeof DEGERLER

export interface KazanimSatiri {
  deger: DegerKey
  /** Değerin bu haftanın etkinliğinde gözlenebilir hâli */
  eylem: string
  /** Hafta sonunda öğrencinin yapabildiği, gözlenebilir çıktı */
  cikti: string
}

const r = (deger: DegerKey, eylem: string, cikti: string): KazanimSatiri => ({ deger, eylem, cikti })

/** Modül slug'ı → haftalar (dizi sırası = hafta sırası). Uzunluk modülün hafta sayısına eşit olmalı (testte doğrulanır). */
export const KAZANIM_DEGER: Readonly<Record<string, readonly KazanimSatiri[]>> = {
  scratchjr: [
    r('saygi', 'Arkadaşının verdiği komutları sırayla dinleyip uygular.', '3-4 adımlık bir komut dizisini sırasıyla söyler ve karaktere uygulatır.'),
    r('sabir', 'Doğru tekrar sayısını deneyerek bulur, hemen vazgeçmez.', 'Tekrarlanan hareketi tekrar bloğuyla kısaltır.'),
    r('dostluk', 'Karakterine nazik bir selamlaşma konuşması yazar.', '"Dokununca" olayıyla konuşan bir karakter yapar.'),
    r('estetik', 'Sahneleri renk ve düzen gözeterek anlamlı sıralar.', 'Başı, ortası ve sonu olan iki sayfalı bir hikâye kurar.'),
    r('durustluk', 'Hatasını saklamadan söyler ve düzeltir.', 'Bozuk bir programdaki hatayı bulur, düzeltir ve kendi hikâyesini anlatır.'),
  ],
  scratch: [
    r('saygi', 'Başkasının projesini incelerken emeğe değer verir.', 'Sahne Atölyesi\'nde karakter ekleyip ilk programını çalıştırır.'),
    r('sabir', 'Kostüm ve bekleme sürelerini deneyerek ayarlar.', 'Kostüm değiştirerek yürüyen, sonsuz döngülü bir karakter yapar.'),
    r('estetik', 'Sesleri uyumlu bir ezgiye dönüştürür.', 'Tuşlara ses bağlayarak kendi çalgısını yapar.'),
    r('dostluk', 'İki karakter arasında nazik bir diyalog kurar.', 'Yayın mesajlarıyla sahne değiştiren iki karakterli bir hikâye yazar.'),
    r('adalet', 'Skor kurallarını herkes için açık ve aynı koyar.', 'Değişkenle skor tutan bir yakalama oyunu yapar.'),
    r('sorumluluk', 'Can ve oyun bitti kurallarını tutarlı işletir.', 'Zamanlayıcı, can ve klon kullanarak oyununu geliştirir.'),
    r('yardimseverlik', 'Arkadaşlarının oynayabileceği yararlı bir bilgi yarışması hazırlar.', 'Kendi bloğunu tanımlar, soruları listede tutar.'),
    r('caliskanlik', 'Planla, yap, test et döngüsünü sonuna kadar götürür.', 'Kendi oyununu ya da hikâyesini planlar, test eder ve sergiler.'),
  ],
  'arduino-temelleri': [
    r('sorumluluk', 'Devreyi güç kapalıyken kurar, LED direncini atlamaz.', 'Ohm yasasıyla LED direncini hesaplar, trafik ışığını programlar.'),
    r('durustluk', 'Seri Monitör\'de ölçtüğünü olduğu gibi raporlar.', 'Buton okuyup sıçramayı gideren kapı zili ve sayaç yapar.'),
    r('tasarruf', 'Işığı yalnız gerektiğinde yakan bir devre tasarlar.', 'LDR ve kalibrasyonla akıllı gece lambası yapar.'),
    r('estetik', 'Işığı ve sesi uyum içinde birleştirir.', 'PWM, RGB LED ve buzzer\'ı fonksiyonlarla birleştiren müzik kutusu yapar.'),
    r('sorumluluk', 'Yüksek akım ve röle güvenlik kurallarına uyar.', 'Sıcaklığa bağlı fan ve servo tarayıcıyı transistör ve H-köprüsüyle sürer.'),
    r('sabir', 'Bloklayan kodu adım adım bloklamayan yapıya dönüştürür.', 'millis() ve durum makinesiyle birden çok işi aynı anda yürütür.'),
    r('caliskanlik', 'Bitirme projesini parçalardan bütüne tamamlar.', 'LCD, I2C ve EEPROM kullanan çalışan bir termostat yapar.'),
  ],
  'sensorler-ve-projeler': [
    r('duyarlilik', 'Park ve engel uyarısını görme güçlüğü olan biri için de düşünür.', 'Ultrasonik sensör ve medyan filtreyle park sensörü yapar.'),
    r('mahremiyet', 'Hareket algılayan sistemde kimin ve neyin izlendiğini sorgular.', 'PIR ve IR sensörlerle durum makineli hırsız alarmı kurar.'),
    r('tasarruf', 'Sulamayı ölçüme göre yapar, suyu israf etmez.', 'Sıcaklık, nem ve basınç ölçen hava istasyonu ve sulama uyarısı yapar.'),
    r('sorumluluk', 'Gaz ve yangın uyarısında yanlış alarm ile kaçırma riskini tartar.', 'Kalibre edilmiş eşiklerle yangın ve gaz alarm paneli kurar.'),
    r('sabir', 'Sensör sapmasını filtreyle adım adım ayarlar.', 'MPU6050 ve tamamlayıcı filtreyle eğimle kontrol edilen servo yapar.'),
    r('mahremiyet', 'Şifre ve kart verisini korunaklı saklar.', 'Keypad, RFID ve EEPROM ile yetkili akıllı kapı kilidi yapar.'),
    r('durustluk', 'Ölçülen veriyi değiştirmeden, zaman damgasıyla kaydeder.', 'RTC ve SD kartla CSV veri kaydedici yapar.'),
    r('caliskanlik', 'Gerçek dünyadaki gürültü ve hataları sistemli ayıklar.', 'Simülasyon ile gerçek devre farklarını hesaba katan akıllı oda projesini bitirir.'),
  ],
  robotik: [
    r('saygi', 'Ortak pistte başkalarının robotuna ve sırasına saygı gösterir.', 'Diferansiyel sürüşü hesaplar, seri komutlarla arabayı sürer.'),
    r('duyarlilik', 'Robotun çevresindekilere çarpmaması için önlem tasarlar.', 'Mesafe sensörü ve durum makinesiyle engelden kaçan robot yapar.'),
    r('sabir', 'Kalibrasyonu ve eşiği deneyerek iyileştirir.', 'Kalibre edilmiş IR sensörlerle pisti tamamlayan çizgi izleyen robot yapar.'),
    r('durustluk', 'Ölçülen sapmayı gizlemeden raporlar.', 'Enkoder ve odometriyle kare ve sekiz çizen robot yapar.'),
    r('caliskanlik', 'PID kazançlarını sistemli deneylerle ayarlar.', 'PID ile çizgi izleyen ve duvar takip eden robot yapar.'),
    r('sorumluluk', 'Devrilme ve düşmeye karşı güvenlik sınırı koyar.', 'IMU ve kaskad PID ile kendini dengeleyen robot yapar.'),
    r('yardimseverlik', 'Robot kolun bir insana yardım edeceği bir görev tasarlar.', 'Davranış tabanlı gezgin robot ve al-bırak yapan robot kol programlar.'),
    r('dostluk', 'Takımda görev paylaşır, arkadaşının işini destekler.', 'Bitirme robotunu tasarlar, test eder ve ölçümleriyle sunar.'),
  ],
  'ai-muhendisligi': [
    r('caliskanlik', 'Modelin içini merak eder, adım adım çözümler.', 'Token, BPE ve sonraki kelime olasılığıyla mini dil modeli kurar.'),
    r('saygi', 'Kullanıcıya uygun ton ve rol seçer.', 'Sistem mesajı ve açık görevle yeniden kullanılabilir prompt şablonu yazar.'),
    r('estetik', 'Çıktıyı okunur, düzenli ve amaca uygun tasarlar.', 'Örnekli ve JSON çıktılı bir duyuru özetleyici prompt\'u geliştirir.'),
    r('adalet', 'Modeli farklı durumları eşit kapsayan testlerle ölçer.', 'Kenar durumlarını içeren kendi eval setini yazar ve sonuçları yorumlar.'),
    r('durustluk', 'Cevabı kaynağa dayandırır; kaynak yoksa "bilmiyorum" der.', 'Embedding ve parçalamayla kendi RAG hattını kurar.'),
    r('tasarruf', 'Gereksiz araç çağrısı yapmadan önce ölçer.', 'Durma koşulu ve sınırları olan mini bir ajan döngüsü kurar.'),
    r('sorumluluk', 'Bulduğu açığı kötüye kullanmadan raporlar.', 'Prompt injection denemelerini ve katmanlı savunmayı içeren kırmızı takım raporu yazar.'),
    r('mahremiyet', 'Kişisel veriyi, telifi ve önyargıyı gözeterek karar verir.', 'Robotta karar için kural ile modeli karşılaştıran mühendislik portföyünü hazırlar.'),
  ],
  'mikro-kart': [
    r('estetik', 'Kendi desenini özgün ve düzenli çizer.', 'LED koordinatlarıyla desen ve atan kalp animasyonu yapar.'),
    r('adalet', 'Zar ve skorda herkese eşit şans tanır.', 'Düğme olayları ve değişkenle zar oyunu skor panosu yapar.'),
    r('duyarlilik', 'Ortamın sıcaklığını, ışığını ve sesini gözlemleyip önemser.', 'İvme, ışık, sıcaklık, pusula ve ses sensörleriyle çevre istasyonu kurar.'),
    r('sabir', 'Ezgiyi nota nota deneyerek oluşturur.', 'Liste ve tempo kullanarak sanal piyano yapar.'),
    r('mahremiyet', 'Gizli mesajı yalnız alıcısının okuyacağı şekilde gönderir.', 'İki kart arasında mesajlaşan uzaktan kumanda yapar.'),
    r('yardimseverlik', 'Bir canlıya fayda sağlayan bir cihaz tasarlar.', 'Nem ve sıcaklık ölçen akıllı saksı final projesini tamamlar.'),
  ],
  'oyun-atolyesi': [
    r('estetik', 'Sahnesini renk ve düzen gözeterek kurar.', 'Ok tuşlarıyla gezen kedi oyununu yapar.'),
    r('adalet', 'Kazanma ve kaybetme kurallarını adil koyar.', 'Çarpışma ve skorla meyve avı oyunu yapar.'),
    r('sabir', 'Labirenti ve haritayı deneyerek düzenler.', 'Duvarlı harita ve kayan kamerayla hazine adası oyunu yapar.'),
    r('duyarlilik', 'Oyuncuyu bıktırmayan, ölçülü bir zorluk ayarlar.', 'Devriye, takip ve rastgele hareketle düşman davranışı yazar.'),
    r('caliskanlik', 'Fizik ayarlarını deneyerek iyileştirir.', 'Yerçekimi ve zıplamayla platform oyunu yapar.'),
    r('dostluk', 'Arkadaşlarının oyununu test edip yapıcı geri bildirim verir.', 'Kendi tam oyununu yapar, hatalarını ayıklar ve paylaşır.'),
  ],
}

export const kazanimFor = (moduleSlug: string, weekPosition: number): KazanimSatiri | null =>
  KAZANIM_DEGER[moduleSlug]?.[weekPosition - 1] ?? null
