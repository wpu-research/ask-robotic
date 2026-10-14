// Tanıtım ana sayfası (giriş yapmamış ziyaretçi için "/"). Brilliant ana sayfası düzeninden uyarlandı.
export const landing = {
  metaTitle: 'Robotik ve yapay zekâ için kişisel öğretmenin',
  metaDescription: '5–18 yaş için bloklarla kodlamadan elektroniğe, robotikten yapay zekâ mühendisliğine etkileşimli dersler. Donanım gerekmez.',
  hero: {
    title: 'Robotik ve yapay zekâ için kişisel öğretmenin',
    lead: 'Bloklarla kodlamadan Arduino’ya, robotlardan yapay zekâ mühendisliğine. Robi seninle birlikte düşünür, cevabı vermez; sen bulursun.',
    learner: 'Öğrenciyim',
    adult: 'Veli ya da öğretmenim',
    continue: 'Kaldığın yerden devam et',
    noHardware: 'Donanım gerekmez · Tarayıcıda çalışır',
  },
  demo: {
    eyebrow: 'Hemen dene',
    question: 'LED’i yak ama bozma: direnci seç.',
    check: 'Kontrol et',
    ok: 'İşte bu! Gerçek bir mühendis gibi hesapladın.',
    bad: 'Tam değil. Akım çok yüksekse direnci büyüt.',
    again: 'Tekrar dene',
    cta: 'Böyle yüzlerce adım seni bekliyor',
    goalOn: 'LED yansın',
    goalSafe: 'Akım en çok 20 mA olsun',
  },
  stats: {
    lessons: 'etkileşimli ders',
    courses: 'kurs',
    parts: 'parçalık ansiklopedi',
    ages: 'yaş aralığı',
    hardware: 'kit maliyeti',
  },
  meet: {
    title: 'Robi ile tanış',
    lead: 'Her derste yanında olan rehber robot. Ekranını görür, takıldığın yeri anlar, sana soru sorarak yol gösterir.',
    tabs: { kodlama: 'Kodlama', elektronik: 'Elektronik', robotik: 'Robotik', ai: 'Yapay zekâ' },
    mock: {
      coach: { kodlama: 'delay() kaç milisaniye bekler?', elektronik: 'Yanık süreyi kısaltırsan ne olur?', robotik: 'Sensör hangi mesafeyi okuyor?', ai: 'Neden “durur” daha olası?' },
      blinkGoal: '✓ Saniyede 1 kez yansın',
      arenaGoal: '→ Engele 20 cm kala dur',
      tokens: ['▁robot', '▁sağa', '▁dön', 'er', '.'],
      next: ['durur', 'döner', 'uçar'],
    },
    features: {
      kodlama: [
        { title: 'Yaparak öğren, izleyerek değil', text: 'Bloklarla ve kodla her adımda bir şey dener, sonucunu hemen görürsün.' },
        { title: 'Kodu okumayı ve düzeltmeyi öğren', text: 'Hatayı bul, çıktıyı tahmin et, eksik parçayı tamamla: gerçek programcı becerileri.' },
        { title: 'Kendi oyununu yap', text: 'Olaylar, döngüler ve değişkenlerle hayal ettiğin oyunu kur.' },
      ],
      elektronik: [
        { title: 'Gerçek devre, sanal laboratuvar', text: 'Arduino, direnç, LED ve sensörlerle devre kur; kod derlenir, devre canlanır.' },
        { title: 'Formülden önce sezgi', text: 'Kaydırıcıyı oynat, akımın değiştiğini gör; Ohm yasası kendiliğinden anlaşılır.' },
        { title: 'Hiçbir şey bozulmaz', text: 'LED mi yandı? ↺ ile baştan başla. Kit, lehim, kayıp parça yok.' },
      ],
      robotik: [
        { title: 'Sanal arenada robot sür', text: 'Engelden kaç, çizgi izle, enkoder ve PID ile robotunu yönet.' },
        { title: 'Sensörleri canlı izle', text: 'Mesafe ışınları, çizgi sensörü değerleri ve konum anında ekranda.' },
        { title: 'Yarışmalara hazır ol', text: 'Problem çözme ve planlama becerilerini proje haftalarıyla geliştir.' },
      ],
      ai: [
        { title: 'Yapay zekânın içine bak', text: 'Token, olasılık, benzerlik ve bilgi getirme: dil modellerinin nasıl çalıştığını kendin dene.' },
        { title: 'Sorumlu yapay zekâ', text: 'Prompt yazma, ölçme, güvenlik ve etik: kullanmayı değil anlamayı öğren.' },
        { title: 'Kendi AI uygulamanı kur', text: 'Ajanlar, değerlendirme ve RAG ile küçük ama gerçek bir uygulama yap.' },
      ],
    },
  },
  trust: {
    title: 'Etkili ve güvenilir',
    items: [
      { title: 'Kısa adımlar, anında geri bildirim', text: 'Her ders 8–15 etkileşimden oluşur. Doğruysa “Neden?”, yanlışsa ipucu.' },
      { title: 'Ustalığa göre pratik', text: 'Zorlandığın beceriler tekrar karşına çıkar; bildiklerin seni yormaz.' },
      { title: 'Çocuk verisine saygı', text: 'Reklam yok, öğrenciler arası mesajlaşma yok. Okul hesaplarında e-posta bile gerekmez.' },
      { title: 'Programla uyumlu', text: 'Bilişim Teknolojileri, Yapay Zekâ Uygulamaları ve Robotik Kodlama dersleriyle eşleşir.' },
    ],
  },
  catalog: {
    title: '5 yaşından 18 yaşına',
    lead: 'Her yaşa uygun bir başlangıç noktası. Okuma bilmeyen minikler için sesli anlatım bile var.',
    all: 'Tüm konular',
  },
  habit: {
    title: 'Her zaman senin temponda',
    lead: 'Günde 10–15 dakika yeter. Seri, XP ve sınıf ligleri öğrenmeyi alışkanlığa çevirir.',
    points: ['Günlük hedefini sen seç', 'Seri şarjı: bir gün kaçırsan da serin korunur', 'Telefonda, tablette ve bilgisayarda çalışır'],
  },
  schools: {
    title: 'Okullar için hazır',
    lead: 'Sınıf oluştur, QR kartla öğrencileri dakikalar içinde ekle, ödev ver, kimin takıldığını canlı gör. 40 dakikalık ders planları dahil.',
    cta: 'Okul programını incele',
    points: ['Öğretmen paneli', 'QR kartla giriş', 'Projeksiyon modu', 'Beceri ısı haritası'],
  },
  how: {
    title: 'Nasıl çalışır?',
    steps: [
      { title: 'Planını çıkar', text: 'Yaşını ve ilgini söyle; Robi sana uygun başlangıcı önersin.' },
      { title: 'Kısa adımlarla öğren', text: 'Her adımda dene, kontrol et, nedenini öğren.' },
      { title: 'Kendi projeni yap', text: 'Her hafta bir proje: trafik ışığından robot sürüşüne.' },
    ],
  },
  final: {
    title: 'Mühendislik yolculuğun bugün başlasın',
    lead: 'Ücretsiz başla. Kart gerekmez.',
    cta: 'Ücretsiz başla',
    login: 'Zaten hesabım var',
  },
}
