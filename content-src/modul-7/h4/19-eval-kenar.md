# Kenar durumlar ve sınırlar
süre: 30

## Merak
Hatalar genellikle sınırlarda saklanır: 19 ile 20 arasında, 49 ile 50 arasında. Robot kontrolünde bu fark, çarpmakla çarpmamak arasındaki farktır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Kenar durumlar
Bir kural "20'den küçükse dur" diyorsa tam 20'de ne olacağı bir kenar durumdur. Kenar durumlar, test setinin en değerli parçasıdır.

### Aracı aç
**Eval tablosu** aracında test edilen sistem bu kez bir robotun engel kararıdır. Girdi "mesafe=<cm> hız=<cm/sn>" biçiminde; çıktı "dur", "yavaşla" veya "devam".
1. En az altı vaka yaz.
2. Eşiklerin hemen iki yanını dene: mesafe 19 ve 20, 49 ve 50.
3. Aynı vakayı tekrarlama.
4. Sistemin yanıldığı bir vaka bul. İpucu: mesafe orta, hız çok yüksekse ne olmalı?

### Nasıl çalışıyor?
- Kural, mesafeye bakar; hızı hesaba katmaz. Bu **bilinçli bir eksik**: testle bulacaksın.
- Beklenen etiketi sen belirlersin: "mesafe=40 hız=100 için sence sistem ne yapmalı?" Test bu beklentiyi sistemle karşılaştırır.
- Test setini sistemi ayarlarken de kullanırsan (aynı vakalara göre kuralı düzeltirsen) ölçüm iyimser çıkar. Bu **veri sızıntısı**dır. Ayar için bir set, son ölçüm için ayrı bir set tutmak iyi uygulamadır.

### Kendini sına
1. Eşik 20 ve "20'den küçükse dur" ise mesafe=20 için sistem ne yapar?
2. Veri sızıntısı neden sonucu olduğundan iyi gösterir?

## Konuşalım
Gerçek bir robotta bu kuralı yazan kişi hızı unutmuş olsaydı hangi testi yazmak onu önceden yakalardı? Sen test setine başka hangi değişkenleri eklerdin?
