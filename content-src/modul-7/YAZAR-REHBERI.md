# Modül 7 — AI Mühendisliği + Claude — Yazar rehberi

Yaş 13+, Türkçe, "sen" hitabı, emoji yok. Ders biçimi: `# Başlık` · `süre: N` (15-40) · `## Merak` · `## Etkinlik` · `## Konuşalım`. Etkinlik içinde `### Dene`, `### Nasıl çalışıyor?`, `### Kendini sına` kullanılır. Dosya adı `hN/NN-kısa-ad.md` (NN küresel ders numarası, 01-40).

## Sanal ve dürüst
- Etkinlikler tarayıcıda yerel çalışır (`lib/ai/**`, `components/ai/**`). Dış API, anahtar, hesap YOK. Derslerde "Claude puanladı", "model cevapladı" gibi sahte iddia yazma.
- Gerçek hesaplanan şeyler: BPE token'lama, n-gram sayımı + softmax/sıcaklık, TF-IDF + kosinüs, RAG getirme, ajan araçları (hesap makinesi, bilgi tabanı, sanal robot), eval doğruluğu.
- Simülasyon/şablon olanlar (arayüzde etiketli): RAG'ın sentez adımı, ajanın "model adımı" (öğrencinin betiği ya da betikli demo), prompt puanlayıcı (kural tabanlı), injection "modeli", halüsinasyon vakaları (elle yazılmış).
- Claude ve diğer modeller hakkında olgusal iddialar genel ve temkinli olsun: sürüm numarası, fiyat, tarih, kıyaslama sonucu yazma.
- Marka: arayüzde ve ders metninde başka ürün/kit adı kullanma.

## Etkinlik bağlantısı
Etkinlik anahtarı `ai-muhendisligi:<hafta>:<haftadaki sıra 1-5>` (`lib/ai/activities`). Etkinlikli derslerde `## Etkinlik` Yapay Zekâ Atölyesi aracını anlatır ve hedeflerle tutarlı olmalıdır. Etkinliksiz dersler (1, 8, 13, 31, 37, 39, 40) yalnız metin + `### Kendini sına`.

## Ders planı (küresel numara: araç)
H1: 1 metin · 2 token · 3 BPE · 4 sonraki kelime · 5 proje mini dil modeli
H2: 6 sıcaklık · 7 bağlam penceresi · 8 metin (sistem mesajı, rol) · 9 açık prompt · 10 proje şablon
H3: 11 örnekle öğret · 12 JSON çıktı · 13 metin (düşünme zinciri) · 14 prompt iterasyonu · 15 proje özetleyici
H4: 16-20 eval (20 proje)
H5: 21-22 benzerlik · 23-24 RAG · 25 proje RAG
H6: 26-29 ajan · 30 proje mini ajan
H7: 31 metin (kodda yapay zekâ) · 32 kod incelemesi · 33-34 injection · 35 proje
H8: 36 halüsinasyon · 37 metin (gizlilik, telif, önyargı) · 38 robotta karar (ajan) · 39 metin (insan denetimi) · 40 metin (portföy)

## Teslim
Ders metnindeki her sayısal örnek araçla doğrulanabilir olmalı. `content:build` çalıştırma; içerik üretici ayrı bir adımdır.
