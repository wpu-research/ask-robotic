# Yapay zekâyla kod yazma iş akışı
süre: 30

## Merak
Terminalde çalışan, kod dosyalarını okuyup düzenleyebilen ve komut çalıştırabilen yapay zekâ araçları var (Claude Code bunlardan biridir). Peki "yap" deyip bırakmak güvenli mi? Mühendisler bu araçlarla nasıl çalışıyor?

## Etkinlik
Bu ders okuma dersidir; etkinlik aracı yoktur. Burada Claude Code tarzı araçları çalıştırmıyoruz; iş akışının ilkelerini öğreniyoruz.

### Ajan gibi çalışan kodlama araçları
Bu tür araçlar, 6. haftada gördüğün ajan döngüsünün kodlamaya uygulanmış hâlidir: kod tabanını okur, plan yapar, dosyaları değiştirir, test komutlarını çalıştırır, sonucu görüp düzeltir. Araçlar (dosya okuma, düzenleme, komut çalıştırma) gerçektir; kararları ise bir dil modeli verir.

### İyi bir iş akışı
1. **Hedefi netleştir:** Ne istiyorsun, hangi dosyalar etkilenecek, neyi bozmamalı?
2. **Önce plan iste:** Kod yazdırmadan önce planı oku, yanlış varsayımı o aşamada düzelt.
3. **Küçük adımlar:** Büyük değişikliği parçala; her parçayı ayrı doğrula.
4. **Test yazdır / çalıştır:** Davranışı bir testle tanımla. Test geçmeden "bitti" deme.
5. **Değişikliği oku:** Üretilen kodu satır satır incele. Anlamadığın kodu sahiplenme.
6. **Sürüm kontrolü:** Değişiklikleri küçük kayıtlarla (commit) sakla; hata olursa geri dönebil.

### Dikkat edilecekler
- Model, var olmayan bir fonksiyonu ya da kütüphaneyi "uydurabilir". Çalıştırmadan inanma.
- Gizli bilgiler (parola, anahtar) isteme ve koda yazdırma.
- Araca verilen izinler en az düzeyde tutulmalı; riskli komutlarda onay iste.
- Bir şey çalışıyorsa nedenini anlamak senin işin: modelin açıklaması da yanlış olabilir (32. ders).

### Kendini sına
1. Neden önce plan okumak, doğrudan kod yazdırmaktan iyidir?
2. "Testler geçti" cümlesi neyi garanti eder, neyi etmez?
3. Üretilen bir değişikliği kabul etmeden önce hangi üç şeye bakarsın?

## Konuşalım
Yapay zekâyla yazdığın bir kodun hatası kimin sorumluluğudur? Bu soruya "kodu yazan kişi" cevabı yeterli mi?
