# Modül 3 Hafta 6 için önerilen yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` dizisine eklenmeli (build.mjs bilinmeyen kimlikte durur).

| id | label | area | description |
|---|---|---|---|
| prog-blocking | Bloklama | Programlama | delay()'in programı beklettiğini ve bakış anları arasındaki olayların kaçtığını bilir. |
| prog-millis | millis ile zamanlama | Programlama | millis() ve simdi - son >= aralik kalıbıyla bekletmeden zamanlama yapar; unsigned long taşmasını bilir. |
| prog-fsm | Durum makineleri | Programlama | Durumları ve geçişleri enum + switch ile yazar; zamanla ve olayla geçiş yapar. |
| prog-interrupts | Kesmeler | Programlama | attachInterrupt, ISR kuralları, volatile ve timer kesmesi aralığını kullanır/hesaplar. |
| prog-multitask | Çoklu görev | Programlama | Birden çok işi delay olmadan görev tablosuyla düzenler; zaman aşımıyla güvenli duruma geçer. |

Önerilen `LESSON_SKILLS` eşlemesi (soru etiketleri bunların alt kümesidir):

```
'arduino-temelleri:6:1': ['prog-blocking', 'prog-timing', 'prog-debug'],
'arduino-temelleri:6:2': ['prog-millis', 'prog-timing', 'prog-debug'],
'arduino-temelleri:6:3': ['prog-fsm', 'prog-millis', 'prog-timing', 'prog-debug'],
'arduino-temelleri:6:4': ['prog-interrupts', 'prog-timing', 'prog-debug'],
'arduino-temelleri:6:5': ['prog-multitask', 'prog-fsm', 'prog-millis', 'prog-interrupts', 'prog-planning', 'prog-timing', 'prog-debug'],
```
