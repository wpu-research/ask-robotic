# Notlar ve öneriler (paylaşılan dosyalara dokunulmadı)

Bu dosya, Sahne Atölyesi (Modül 2) işi sırasında **paylaşılan** dosyalarda (ders metni, `lesson-player.tsx`, `module-meta.ts`, kayıt/kabuk) gerekli
gördüğümüz değişikliklerin önerisidir. Hiçbiri uygulanmadı.

## 1. `packages/db/src/content/modul-2-scratch.ts` — "ekranlı etkinlik" yönlendirmeleri

Metinlerde başka bir ürünün adı ve "hesap aç / topluluğa paylaş / remix" gibi dış hizmete yönlendirmeler geçiyor. Portal tamamen sanal ve kapalı olduğundan
etkinlik artık **Sahne Atölyesi**'nde (dersin etkinlik penceresi) yapılıyor. Önerilen düzeltmeler:

| Ders | Şimdiki metin | Öneri |
|---|---|---|
| 1:1 Programlanmış dans | "Üç kâğıda… kartları sıraya dizmen yeterli… arkadaşın ya da aile üyen programı aynen uygulasın" | Sanal karşılığı eklendi ("Robot dans etsin"). Metin: "Üç komut kartı: **adım at**, **dön**, **alkış**. Etkinlik penceresinde Robot'a bu kartlarla 6 kartlık bir dans öğret. Robot kartları AYNEN uygular, yorum katmaz." Fiziksel kâğıt/kişi adımını "Dansı ailene göstererek anlat" ile değiştir (isteğe bağlı) |
| 1:2 İlk projem | "Tarayıcıda Scratch'i aç ve **Yeni proje** başlat. Hesap açmadan da çalışabilirsin." | "Etkinlik penceresindeki **Sahne Atölyesi**'ni kullan; proje bu tarayıcıda kaydedilir." |
| 1:2 | "Sprite listesi (sağ alt)… Blok paleti (sol)… Sahne (sağ üst)" | Yerleşim aynı. "Kodu **Kod** sekmesinde, karakterin görünüşünü **Kostümler** sekmesinde yaparsın" cümlesi eklenebilir |
| 1:2 | "Güvenlik notu: Scratch topluluğuna proje paylaşırken…" | "Projeni paylaşırken (dosya olarak indirip) gerçek adını, okulunu, adresini ve fotoğrafını projeye ya da proje notlarına yazma." |
| 2:1 | "…**sonraki kostüm** bloğunu bul" | Aynı. Kediyi silmek yerine kedinin hazır 2 kostümü kullanılır (etkinlikte sprite hazır gelir) |
| 3:1 | "Olaylar (sarı) … **… tuşuna basıldığında**" | Blok adı artık "… tuşuna basılınca" |
| 4:2 | "…**… mesajını aldığımda** … **yayın … mesajı**" | Bloklar: "… mesajını alınca", "… mesajını yayınla". Mesaj adı açılır listeden "Yeni mesaj…" ile |
| 5:1 | "Kenara geldiğinde sek" | "kenara değince sek" |
| 6:2 | "**kendimin klonunu oluştur**" | Aynı ("kendimin klonunu oluştur"). Klon bloklarının "Kontrol" kategorisinde olduğu doğru |
| 7:2 | "**Bir liste oluştur**… listenin **sıra. öğesi**" | "Liste oluştur" düğmesi; blok: "… listesinin … . öğesi". Liste içeriği üstteki **Değişkenler** penceresinden de yazılabilir |
| 8:1 | "Başkasının projesini **remix**le başlamak istersen orijinal sahibini belirt" | Sanal ortamda remix yok: "Başkasının fikrinden esinlendiysen proje notuna yaz." |
| 8:2 | "Paylaşırken proje açıklamasına… yaz" | "Proje bilgisi düğmesine basıp açılan bölüme nasıl oynanacağını yaz." (etkinlik hedefi bunu denetliyor) |
| 8:2 "Sırada ne var?" | "Scratch'te ekrandaki karakterleri yönettin." | "Sahne Atölyesi'nde ekrandaki karakterleri yönettin." |
| Başlık | modül adı 'Scratch ile Kendi Oyununu Yap' | Görev gereği **kalır** (arayüzde editör adı "Sahne Atölyesi") |

Blok isimlerinin kısa karşılığı (ders yazarı için): 🏁 tıklanınca = "yeşil bayrak tıklandığında"; "x'i … değiştir" = "x'i … artır"; "boyutu … yap"; "… saniye bekle"; "… kere tekrarla"; "sonsuza kadar".

## 2. `apps/web/src/lib/module-meta.ts`

`scratch.callout` ("Dersler tarayıcıda çalışan Scratch 3 ile yapılır. Hesap açmadan da kullanılabilir.") ve (varsa) `scratch` ile ilgili başka metinler:
"Dersler tarayıcıda çalışan **Sahne Atölyesi** ile yapılır: karakterlerini çizer ya da galeriden seçer, bloklarla canlandırırsın. Kurulum ve hesap gerekmez; çalışmaların bu tarayıcıda saklanır."

## 3. `apps/web/src/app/ders/[id]/lesson-player.tsx` (bağlantı)

`mikroActivity` / `oyunActivity` ile aynı desen:

```tsx
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { getSahneActivity } from '@/lib/sahne/activities'
const sahneActivity = getSahneActivity(p.activityKey)       // 'scratch:<hafta>:<ders>'
…
{sahneActivity && (
  <div className="lesson-lab lesson-sahne" data-activity={p.activityKey} style={{ gridColumn: '1 / -1' }}>
    <SahneEditor key={p.lesson.id} activity={sahneActivity} storageKey={`ask:sahne:ders:${p.activityKey}`}
                 onGoalsChange={(_r, all) => { if (all) onGoals() }} />
  </div>
)}
```

`p.activityKey` modül slug'ı + hafta + haftadaki sıra (1 tabanlı) ile `scratch:1:1` … `scratch:8:2` biçimindedir; `activities/index.ts` aynı anahtarlarla kayıtlıdır.
`SahneEditor` kendi `.sh-root`'unu (container query) kullanır; ders sayfasında tam genişlik verilmelidir (`gridColumn: '1 / -1'`).

## 4. Kayıt / kabuk

- Kenar çubuğu / komut paleti / `registry`: `Sahne atölyesi` → `/sahne-atolyesi` (ikon: kare-tuval ya da "sahne"). `Oyun atölyesi` ve `Blok atölyesi` girdileriyle aynı gruba konabilir.
- `docs/arayuz-referanslari.md` §6'daki "Kostümler ve Sesler ayrı bir iş" notu bu işle karşılandı (kostüm editörü: vektör+bitmap; sesler: sentez + efekt).

## 5. Tasarım kararları (bilmekte fayda var)

- Çalıştırma durumu kaydedilmez; proje başlangıç durumunu tutar. 🏁'e art arda basınca konum/değişken **korunur** (öğretmeyi amaçlıyoruz: "skoru bayrakta 0 yapmasaydın ne olurdu?"), ↺ başa sarar.
- Tuş başlıkları yalnız tuş olaylarıyla başlar (sürekli hareket için `sonsuza kadar` + "tuşa basılı mı?" — 5. hafta dersi böyle öğretiyor).
- Etkinlik hedefleri bazı dersleri "iki yoldan" kabul eder (ör. 2:1 kostüm değişimi: tekrarla ya da bayrağa art arda basmak). Amaç öğrenciyi yanlış yoldan cezalandırmamak.
