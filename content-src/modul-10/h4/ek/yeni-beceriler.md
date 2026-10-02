# Modül 10 Hafta 4: önerilen yeni beceri kimlikleri

lib/skills.ts DEĞİŞTİRİLMEDİ. build.mjs bilinmeyen kimliği reddettiği için sorular mevcut kimliklerle etiketlendi
(prog-timing, prog-loops-arrays, prog-debug, prog-planning, prog-structure). Daha isabetli etiketleme için önerilen yeni kimlikler:

| Kimlik | Etiket | Alan | Açıklama |
|---|---|---|---|
| sound-frequency | Ses ve frekans | Ses | Frekansın (Hz) perdeyi belirlediğini, notaların ve oktavın frekans ilişkisini bilir. |
| music-tempo | Tempo ve süre | Ses | 60000 / tempo ile nota ve sus sürelerini hesaplar; tempo sınırını (20-400) bilir. |
| map-range | Aralık eşleme | Programlama | Eşle bloğuyla bir sensör aralığını başka bir aralığa çevirir. |
| event-sound-control | Olay ve ses kontrolü | Programlama | Başlıkları, koşulu ve sürekli sesi başlatma/durdurmayı doğru kurar. |
| list-record | Liste ve kayıt | Programlama | Listeye ekleme, 0 tabanlı numara ve geri oynatmayı kullanır. |

Önerilen soru eşlemesi (mevcut etiket -> önerilen):
- d16: q1,q3 -> sound-frequency; q2 -> music-tempo; q4,q5 -> event-sound-control
- d17: hepsi -> music-tempo (q4 ayrıca event-sound-control)
- d18: q1,q4,q5 -> list-record; q2,q3 -> music-tempo
- d19: q1,q2 -> map-range; q3,q4,q5 -> event-sound-control
- d20: q1,q2 -> music-tempo; q3,q4 -> list-record; q5 -> prog-planning

LESSON_SKILLS eşlemesi (şu an yok; eklenirse sorular bunun alt kümesi olmalı):
- mikro-kart:4:1: prog-structure, prog-timing, prog-debug
- mikro-kart:4:2: prog-timing, prog-debug
- mikro-kart:4:3: prog-loops-arrays, prog-timing, prog-debug
- mikro-kart:4:4: prog-timing, prog-debug, prog-structure
- mikro-kart:4:5: prog-timing, prog-loops-arrays, prog-debug, prog-planning
