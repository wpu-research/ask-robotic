# Derleme servisi (`POST /api/compile`)

Öğrencinin yazdığı Arduino Uno (C++) kodunu sunucuda **yalnız derler**, çalıştırmaz; `.hex` döndürür.
Tasarım gerekçesi: `docs/devre-simulatoru-tasarim.md` > "Derleme servisinin güvenliği".

## Mimari

```
istemci -> route.ts -> validate.ts -> compile.ts -> arduino-cli (alt süreç, ayrı süreç grubu)
```

- `apps/web/src/app/api/compile/route.ts`: bayrak, içerik türü, hız sınırı, gövde sınırı, doğrulama, durum kodları.
- `apps/web/src/lib/compile/validate.ts`: kaynak doğrulayıcı (önişlemci modeli: satır birleştirme, yorum ve dize temizleme, mantıksal satır taraması; izin listesi).
- `apps/web/src/lib/compile/compile.ts`: izole dizin, `arduino-cli`, zaman aşımı, çıktı temizleme, önbellek, kuyruk.

Derleme başına akış: `mkdtemp(os.tmpdir()/ask-compile-XXXX)` > `sketch/sketch.ino` > `arduino-cli compile --fqbn arduino:avr:uno --output-dir <dir>/build <dir>/sketch` (shell yok, sabit argüman dizisi) > hex okunur > dizin silinir (hata ve zaman aşımında da).
`compileSketch` doğrulamayı kendisi de çağırır (route atlansa bile doğrulanmamış kod derleyiciye gitmez).

| Durum | HTTP |
|---|---|
| Bayrak kapalı | 503 `{error}` |
| JSON değil | 415 |
| Hız sınırı (IP başına 20/dk) | 429 + `Retry-After` |
| Gövde > 40 KB | 413 |
| Bozuk JSON / `code` metin değil | 400 `{error}` |
| Doğrulama hatası | 400 `{ok:false, errors:[{line,message}]}` |
| Derleme hatası | 422 `{ok:false, errors:[{line,column,message}]}` (en çok 20) |
| Kuyruk dolu | 503 + `Retry-After` |
| Zaman aşımı | 504 |
| İç hata | 500 (ayrıntı yok) |
| Başarı | 200 `{ok:true, hex, flashBytes, ramBytes, cached}` |

## Ortam değişkenleri

| Değişken | Varsayılan | Anlamı |
|---|---|---|
| `COMPILE_ENABLED` | `false` | Yalnız `true` ise servis açılır; aksi halde 503. |
| `ARDUINO_CLI` | `arduino-cli` | Yürütülebilir dosya yolu. Alt sürece yalnız `PATH, HOME, USER, LANG, LC_ALL, TMPDIR` ve `ARDUINO_*` değişkenleri aktarılır (`DATABASE_URL` vb. aktarılmaz). |

## Sınırlar

| Sınır | Değer |
|---|---|
| Kaynak boyutu / satır / satır uzunluğu | 32 KB / 1500 / 400 karakter |
| İstek gövdesi | 40 KB |
| Derleme süresi | 60 sn (süreç grubu SIGKILL ile öldürülür) |
| Çıktı tamponu | 1 MB (aşılırsa süreç öldürülür, iç hata) |
| Eşzamanlı derleme / kuyruk | 2 / 10 (aşılırsa `busy`) |
| Önbellek | bellek içi LRU, 200 girdi, sha256(kaynak); derleme hataları da önbelleğe alınır |
| Aynı kaynak eşzamanlı | tek derleme (in-flight dedupe), kuyruk yeri tüketmez |
| Hız sınırı | IP başına 20/dk (`rateLimited`, bellek içi) |

## Doğrulayıcının kuralları (özet)

- İzinli yönergeler: `include define undef if ifdef ifndef elif else endif`. Diğerleri (`pragma error warning line include_next import ident sccs assert unassert`, `# 33 "x"` biçimi) reddedilir.
- `#include` yalnız `<...>` ve izin listesindeki başlıklar (`ALLOWED_HEADERS`). Tırnaklı, yollu, makroyla üretilen include reddedilir.
- Kelime olarak (yorum/dize dışında) yasak: `asm __asm __asm__ _Pragma __attribute__ __attribute incbin __has_include* __builtin_*`.
- Ayrıca yasak: diğraf `%:`, trigraf `??x`, token yapıştırma `##` (yasak sözcüğü parçalardan üretmeyi engeller), dize dışında `\` (UCN ile gizleme), ham dize `R"(...)"`, NUL/denetim karakterleri, yalnız CR.
- Yorumlar GCC gibi tek boşluğa çevrilir (çok satırlı yorum da tek boşluk), `\`+satır sonu birleştirilir; böylece `#in\`+LF+`clude`, `/* */#include`, `# /*\n*/ include` hileleri gerçek önişlemcinin gördüğü haliyle yakalanır.

## Bilinen riskler ve öneriler

1. **Web sürecinin içinde derleme (en büyük risk).** Şu an derleyici, Next.js sunucusuyla aynı kullanıcı ve dosya sistemiyle çalışır. `gcc` bir güvenlik sınırı değildir; doğrulayıcıdaki bir atlatma ya da derleyici/arduino-cli açığı sunucuyu etkiler. **Üretimde ayrı bir izole servis/konteyner olarak çalıştırın** (web uygulamasından ayrı ölçeklenir): yalnız `arduino-cli` + `arduino:avr` + kütüphaneler içeren imaj, web sunucusundan yalnız HTTP/kuyruk ile çağrılır.
2. **Ağ erişimi.** Konteyner dışarıya ağ erişimi olmayan ağda çalışmalı (`--network none` ya da egress kapalı). Böylece `arduino-cli` çekirdek/kütüphane indirmeye çalışamaz ve olası bir kaçış veri dışarı çıkaramaz. Çekirdek ve kütüphaneler imaj yapılırken kurulmalı, `arduino-cli` yapılandırmasında otomatik güncelleme kapalı olmalı.
3. **Kaynak sınırları.** Zaman aşımı ve çıktı sınırı uygulama içindedir, ancak bellek/CPU/disk/süreç sayısı sınırı YOKTUR. Konteyner düzeyinde `--memory`, `--cpus`, `--pids-limit`, salt-okunur kök dosya sistemi, `/tmp` için boyutu sınırlı tmpfs, root olmayan kullanıcı, `no-new-privileges`, seccomp/AppArmor kullanın. Derleme süresince RAM için `ulimit -v` benzeri sınır yoktur: şablon-metaprogramlama bombası (`constexpr`/şablon özyinelemesi) 32 KB kodla bile onlarca saniye ve yüzlerce MB tüketebilir; 60 sn sınırı bunu yalnızca zamanla keser.
4. **arduino-cli kütüphane arama yolları.** `#include <X.h>` kullanıcı kütüphane dizininde (`~/Arduino/libraries`), kurulu paketlerde (`~/.arduino15`) ve çekirdekte aranır. İzin listesi başlık ADLARINI sınırlar, ancak (a) o dizinlere bir kütüphane eklenirse aynı adı taşıyan başlık çözülür; (b) izinli bir kütüphanenin kendi başlıkları başka dosyaları `#include` edebilir (kütüphane kodu güvenilir kabul edilir, bu yüzden kütüphane dizini sunucu tarafında salt-okunur ve yalnız yönetici tarafından yönetilmeli); (c) `arduino-cli` aynı `~/.arduino15` ve derleme önbelleğini (`$TMPDIR/arduino`) eşzamanlı derlemelerde paylaşır. Kütüphane listesi `validate.ts` ile `arduino-cli lib list` çıktısı birlikte gözden geçirilmeli; kullanıcı yazma izni olan başka kütüphane yolu bırakılmamalı.
5. **Derleme çıktısındaki bilgi.** Hata çıktısı ham döndürülmez: yalnız ayrıştırılmış `dosya.ino:SATIR:SÜTUN: error:` kayıtları döner ve yollar/ANSI temizlenir. Yine de hata mesajı kullanıcının kendi kodundan alıntı içerebilir (zararsız). `__FILE__` / `__DATE__` makroları derlenen ikiliye geçici dizin adını (`/tmp/ask-compile-XXXX/sketch/sketch.ino`) gömer; hex içinde görünür. Düşük risk, ama dizin adı rastgeledir ve işlem sonrası silinir.
6. **IP tespiti ve hız sınırı.** Anahtar `x-real-ip`, yoksa `x-forwarded-for`'un SON girdisidir (istemcinin eklediği soldaki değerlere güvenilmez). Güvenilir tek proxy varsayımı vardır: ön tarafta birden çok proxy/CDN varsa ya herkes aynı anahtarı paylaşır (haksız 429) ya da yanlış girdi seçilir. Sınıf/okul gibi NAT arkasındaki kullanıcılar tek IP paylaşır; 20/dk onlar için dar olabilir. Sınırlayıcı bellek içidir: çok örnekli dağıtımda örnek başına çalışır, süresi dolan anahtarlar temizlenmez (bellek büyümesi). Servise oturum/yetki zorunluluğu eklenmemiştir; kimlik doğrulama, kötüye kullanımı en etkili azaltır.
7. **Önbellek zehirlenmesi yoktur ama bellek tüketimi vardır.** 200 girdi x en çok ~1 MB hex ≈ en çok birkaç yüz MB; tipik Uno hex'i 10-60 KB'tır. Önbellek yalnız tek süreçte geçerlidir (yeniden başlatmada ve örnekler arasında paylaşılmaz).
8. **Doğrulayıcı bir sözcüksel modeldir, GCC'nin kendisi değil.** Belirsiz yapılar (kapanmamış tırnak, ham dize, `\`, `##`) bilerek reddedilir veya sıkı taranır, ama yeni bir GCC/arduino-cli sürümü farklı lexing davranışı getirirse (ör. rakam ayırıcı `1'000` C++14, farklı `-std`) model yeniden gözden geçirilmelidir. Derleyici sürümü sabitlenmeli (`arduino:avr` 1.8.6 / avr-gcc 7.3) ve sürüm yükseltmeleri doğrulayıcı testleriyle birlikte yapılmalıdır.
9. **`execFile` yerine `spawn`.** Alt süreç ağacını öldürebilmek için süreç grubu (`detached`) gerekir; Node `execFile` bu seçeneği yok sayar. Bu nedenle shell kullanmayan `spawn` ile aynı güvenlik özellikleri (argüman dizisi, shell yok) sağlanır ve tampon sınırı elle uygulanır.
10. **Windows desteklenmez** (süreç grubu öldürme POSIX'e özgüdür).
