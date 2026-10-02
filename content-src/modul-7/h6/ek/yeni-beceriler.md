# Modül 7 Hafta 6: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatasıyla durur.

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `agent-tools` | Araç kullanımı | Yapay zekâ | Model-araç ayrımını bilir: model çağrı ister, uygulama aracı çalıştırır, sonuç gözlem olarak döner; araç çağrısını `arac(girdi)` biçiminde yazar.
- `agent-loop` | Ajan döngüsü | Yapay zekâ | Düşün-yap-gözle döngüsünü sıralar, adım sonuçlarını `$n` ve `$son` ile taşır, betikli ajanın sınırını bilir.
- `agent-limits` | Hata, sınır ve durma | Yapay zekâ | Adım sınırı, hata gözlemi ve durma koşullarını (sonuç, hata, sınır) açıklar; `tekrar` toplamını duvarla karşılaştırır.
- `agent-safety` | Ajan güvenliği | Yapay zekâ | Önce ölç, güvenlik payı, en az yetki ve insan onayı ilkelerini uygular.
- `agent-plan` | Ajan planı ve hesap | Yapay zekâ | Ölç-hesapla-ilerle planını adım numaralarıyla kurar, kalanın yüzdesini ve payı doğru hesaplar.
- `agent-eval` | Ajanı ölçme | Yapay zekâ | Betikli ajan ile model kullanan ajanın güvenilirlik farkını bilir; ajanı tekrarlı denemelerle ölçmenin gerekçesini açıklar.

## Kullanılan mevcut beceriler
Yok.

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'ai-muhendisligi:6:1': ['agent-tools', 'agent-loop', 'agent-limits'],
'ai-muhendisligi:6:2': ['agent-loop', 'agent-tools', 'agent-limits'],
'ai-muhendisligi:6:3': ['agent-limits', 'agent-plan', 'agent-safety'],
'ai-muhendisligi:6:4': ['agent-plan', 'agent-safety', 'agent-loop'],
'ai-muhendisligi:6:5': ['agent-plan', 'agent-loop', 'agent-eval', 'agent-safety'],
```
(Bütün soruların `skills` etiketleri ilgili dersin kümesinin içindedir; betikle denetlendi.)
