# Modül planı ve ilkeler (güncel: 2026-10-01)

## Temel ilke: tamamen sanal eğitim
Portalda **hiçbir fiziki şey kullanılmaz**: kit, kart, kablo, multimetre, kâğıt, oyuncak, ebeveynle beden oyunu, tablet uygulaması yok.
Her etkinlik tarayıcıda, platformun kendi araçlarıyla yapılır:
- blok editörü (Modül 1; Modül 2 için de kendi editörümüz hedefleniyor),
- sanal devre/Arduino simülatörü (Modül 3-4),
- sanal robot arenası ve fizik benzetimi (Modül 5 ve sonrası).

Bu ilkenin sonuçları:
- Derslerde "kendi kartında/robotunda kur", "multimetreyle ölç", "kâğıda çiz" gibi fiziki eylemler **olmaz**. Bunlar sanal karşılıklarıyla (sanal devre tahtası, sanal ölçü aletleri, uygulama içi etkinlik) değiştirilir.
- Gerçek dünyayla ilgili bilgi notları (gürültü, sıçrama, ölü bölge gibi) kalabilir; ama öğrenciden fiziki bir şey yapması istenmez. Bu etkiler simülatörde modellenip gösterilir.
- "Simülasyondan gerçeğe" haftası (Modül 4, ders 71-75) yeniden tasarlanacak: gerçek kart kurulumu yerine "gerçek dünya etkilerini simülatörde gözlemlemek".
- Platformun kendi simülatörleri müfredatın **kritik yolu**: ders içeriği, bu araçlar olmadan uçtan uca tamamlanamaz.

## Modül listesi
| # | Modül | Durum |
|---|---|---|
| 1 | Blokla Kodlamaya İlk Adım (5-7 yaş) | Metin + uygulama yazılıyor (kendi blok editörü hazır) |
| 2 | Scratch ile Kendi Oyununu Yap (8-12 yaş) | Metin var; kendi Scratch tarzı editör ve "ekransız" dersin sanallaştırılması gerekiyor |
| 3 | Arduino Temelleri (35 ders) | Metin + doğrulanmış programlar var; sanal devre simülatörü ve metinlerin sanallaştırılması gerekiyor |
| 4 | Sensörler ve Projeler (40 ders) | Aynı; 8. hafta yeniden tasarlanacak |
| 5 | Robotik (40 ders) | 7/8 hafta yazıldı (H5 PID sürüyor); sanal robot arenası arayüzü gerekiyor |
| 6 | Diğer Kartlar (ESP32, RP2040, Raspberry Pi) | Planlandı |
| 7 | AI Engineering + Claude | Planlandı |
| 8 | **Endüstriyel robot kolu (KUKA tarzı)** | Planlandı (aşağıya bak) |
| 9 | **Drone** | Planlandı (aşağıya bak) |

## Eklenecek modüller

### Modül 8 — Endüstriyel robot kolu (KUKA tarzı)
- Sanal 6 eksenli robot kolu hücresi: eklem uzayı / kartezyen hareket, ileri-ters kinematik, tutucu, al-bırak, yol planlama, çarpışmasız yörünge, basit hücre güvenliği.
- Robot programlama dili: KUKA'nın KRL'sine benzeyen, **platformun kendi** yorumlayıcılı bir dil. 
- **Dikkat:** KUKA bir ticari markadır; KRL, KUKA.Sim/WorkVisual yazılımlarının içeriği tescillidir. Resmî KUKA içeriği kopyalanmaz, "resmî KUKA eğitimi" izlenimi verilmez. Modül adı konusunda (ör. "Endüstriyel robot kolu: KUKA tarzı programlama" yerine nötr ad) karar bekleniyor.
- Ön koşul: Modül 5'in robot kol ve ters kinematik dersleri (108-109).

### Modül 9 — Drone
- Sanal çok pervaneli (multirotor) uçuş fiziği: itki, tork, yönelim (roll/pitch/yaw), irtifa tutma.
- Kontrol: PID ile yönelim ve irtifa, durum kestirimi (IMU füzyonu: Modül 5'teki tamamlayıcı filtre), görev planı (waypoint), güvenlik (failsafe).
- Ağ ve protokol tarafı: MAVLink fikri, telemetri (Hyvex GCS derslerindeki gibi).
- Ön koşul: Modül 5 (PID, IMU, denge).
- **Esin kaynağı (kullanıcı önerisi, 2026-10-01): "LiteWing Blockly" tarzı görsel dron programlama.** Ürün gerçek bir drona bağlanan bir masaüstü uygulaması; biz yalnız arayüz düzenini esin alıyoruz, marka, görsel ve içerik kopyalanmaz. Sanal uyarlama:
  - **Blok editörü** (Blockly, Apache-2.0): kategoriler Olaylar, Uçuş (arm et, kalkış yüksekliği, in), LED, Hareket (öne/yana eğ, yükseklik), Navigasyon, Şekiller (daire, kare), Sensörler, Kayıt, Yardımcılar + standart Mantık, Döngü, Matematik, Liste, Metin, Değişken, Fonksiyon.
  - **Üst çubuk:** Çalıştır / İn / Dur.
  - **Sağ panel sekmeleri:** üretilen **Python** kodu (blok ↔ metin köprüsü) ve **Sensörler** (yapay ufuk, pusula/yönelim, irtifa, pil).
  - **Konsol** çıktısı; sanal dron sahnesi (2B üstten + 3B görünüm).
  - Müfredat akışı: blokla uçuş → Python'a geçiş → PID ile yönelim/irtifa → görev planı → failsafe.
  - Gerçek dron bağlantısı (Wi-Fi) **yok**: portal tamamen sanal.
  - Blokları güvenli çalıştırmak için üretilen kod sunucuda değil, tarayıcıda yalıtılmış bir yorumlayıcıda adım adım koşturulur (JS Interpreter yaklaşımı).
- **Ortak kabuk fikri:** "blok editörü + sanal sahne + sensör paneli + konsol" düzeni Modül 2 (Scratch tarzı), Modül 8 (robot kol) ve Modül 9 (dron) için ortak bir bileşen olarak tasarlanabilir.
- Hyvex'te yazılı drone/PX4 bilgisi kaynak olarak kullanılabilir; yalnız orada geçenlere dayan, uydurma ayrıntı yok.

## Mimari sonuç: ortak sanal ortam altyapısı
Modül 3-5, 8, 9 aynı iki parçaya dayanır: (1) tarayıcıda çalışan program yürütücü (Arduino için avr8js; gerçek derleme gerektirir), (2) 2B/3B fizik benzetimi. Bu iki parçanın ortak, yeniden kullanılabilir olması maliyeti düşürür.
**Açık risk:** Arduino C++ derlemesi şimdilik sunucuda `arduino-cli` ister (kullanıcı kodu çalıştırmak güvenlik/kaynak sınırı gerektirir). Tarayıcı içi derleme alternatifi araştırılmalı.
