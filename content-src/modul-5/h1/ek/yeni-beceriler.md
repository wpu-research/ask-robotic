# Modül 5 Hafta 1: önerilen yeni beceri kimlikleri

lib/skills.ts değiştirilmedi. Bu haftanın sorularındaki `skills` alanları yalnızca MEVCUT kimlikleri kullanır (build.mjs bilinmeyen kimliği reddeder). Aşağıdaki kimlikler koordinatör tarafından skills.ts'e eklenirse sorulardaki yaklaşık etiketler bu kimliklerle değiştirilebilir. LESSON_SKILLS anahtarları: `robotik:1:<ders>` (ders 1-5; küresel numara 76-80).

| Önerilen kimlik | Alan | Açıklama | Sorular |
|---|---|---|---|
| robot-diffdrive | Robotik | v, ω ve R'yi tekerlek hızlarından hesaplar; ters problemi çözer. | m5h1d76-q1..q5, m5h1d79-q3, m5h1d80-q4 |
| robot-motor-driver | Robotik | Motor sürücüsünün IN/EN girişlerini, doğruluk tablosunu, PWM doluluğunu ve ortak GND kuralını bilir. | m5h1d77-q1..q5 |
| robot-calibration | Robotik | Ölü bölgeyi ve azami hızı ölçer; hizdanPwm ile hızı PWM'e çevirir. | m5h1d78-q1..q5 |
| robot-serial-cmd | Robotik | Seri komut ayrıştırıcıyı (tampon, atoi, constrain, switch) kurar ve hatalarını bulur. | m5h1d79-q1, q2, q4, q5 |
| robot-failsafe | Robotik | Watchdog ve güvenli durum fikrini uygular; durma mesafesini (hız × süre) hesaplar. | m5h1d80-q1, q2, q3, q5, m5h1d79-q5 |

Şu an kullanılan eşleme (mevcut kimlikler): prog-planning (76 q1-q2, 78 q5, 80 q3/q5), prog-timing (76 q3, 78 q1-q2, 79 q3, 80 q1/q3/q4), digital-out (76 q5, 77 q1-q3, 79 q1), prog-debug (77 q4, 78 q3-q4, 79 q2/q4, 80 q2), prog-structure (78 q3, 79 q1/q5, 80 q2), circuit-wiring (77 q4-q5).

Not: platform-icerik.test.ts yalnızca Modül 3 H1 için `LESSON_SKILLS` alt küme denetimi yapar; robotik:1:N anahtarları eklenirse yukarıdaki mevcut kimlikler de o ders eşlemesine girmelidir.
