# Takip: hayalet seni kovalıyor
süre: 20

## Merak
En korkutucu düşman, seni gören ve peşine takılandır. Ama bir hayalet bütün haritada seni kovalarsa oyun çok zorlaşır. İyi oyunlarda hayalet ancak yeterince yaklaşırsan uyanır. Bu derste hem kovalayan hem de kendi kendine "yakın mı, uzak mı?" diye soran bir hayalet yapacaksın.

## Etkinlik
Sahnede bir kedi ve köşede bir hayalet var. Kediyi ok tuşlarıyla yürütebilirsin; hayalet henüz hiçbir şey yapmıyor. Başlangıç projesi hazır gelir; `her karede` olayı da boş olarak bekliyor.

### İki yeni fikir
- **Takip:** `[hayalet], [kedi] sprite'ını [25] hızıyla takip etsin` bloğu hayaleti sürekli kedinin yönüne doğru yürütür. Hızı sen seçersin (saniyede piksel).
- **Mesafe:** `[hayalet] ile [kedi] arası mesafe` bloğu iki sprite'ın merkezleri arasındaki uzaklığı piksel olarak söyler.

### Blokları kur
1. Önce basit takip: **Sprite** kategorisinden `[bu sprite], [bu sprite] sprite'ını [30] hızıyla takip etsin` bloğunu al. İlk yere `hayalet`, ikinci yere `kedi` değişkenini koy; hızı 25 yap. Bloğu `her karede` olayının içine tak.
2. ↺ bas ve kediyi kaçır. Hayalet nereye gitsen peşinde. Kedi çok hızlı değilse yakalanırsın.
3. Şimdi hayaleti uyanık tut ama sınırlı: **Mantık** kategorisinde iki `eğer` bloğu var; "değilse" kolu olanını al ve `her karede` bloğunun içine tak. Takip bloğunu `ise` koluna sürükle.
4. Koşul olarak **Mantık** kategorisinden bir karşılaştırma bloğu (`[ ] = [ ]`) al ve işaretini `<` yap. Sol tarafına **Sprite** kategorisinden `[hayalet] ile [kedi] arası mesafe`, sağ tarafına 70 yaz.
5. `değilse` koluna **Hareket** kategorisinden `[hayalet] dursun` bloğunu koy. (`dursun` hızı sıfırlar ve takibi de bırakır.)
6. ↺ bas. Kediyi hayalete 70 pikselden fazla yaklaştırma: hayalet yerinde kalıyor. Biraz yaklaş: hayalet uyanıp kovalıyor. Uzaklaşınca yine duruyor.

Beklenen sonuç: Kedi yakındayken hayalet ona doğru gidiyor, uzaktayken hiç kıpırdamıyor. Üç hedef ✓.

### Nasıl çalışıyor?
- `her karede` bloğu saniyede 60 kez çalışır, yani hayalet saniyede 60 kez "kedi yakın mı?" diye bakar.
- Takip hızı sabittir (burada 25). Kedi 60 hızla yürüyorsa hayalet onu hiç yakalayamaz; hızları oyunu zorlaştırmak ya da kolaylaştırmak için ayarlarsın.
- Hayalet kediye 1 pikselden yakın olunca durur; üstüne binmez.
- Takibi bırakmak için `[hayalet] takibi bıraksın` bloğu da var, ama bu blok hızı sıfırlamaz: hayalet son hızıyla devam eder. Bu yüzden biz `dursun` kullandık.

### Dene
1. Uyanma mesafesini 40 yap, sonra 100 yap. Hangisi daha adil geliyor?
2. Hayaleti yavaşlat (15) ve kediyi hızlandır (100). Kediyle hayaleti birbirine değdir: ne oluyor? (Çarpışma kuralını sonra yazacağız; şimdilik sadece görüyorsun.)
3. İkinci bir hayalet ekle: `yeni [hayalet] sprite'ı, türü [Düşman]` bloğuyla yeni bir sprite yap, ona başka bir değişken adı ver ve aynı kuralı onun için de kur.

### Sık yapılan hatalar
- Takip bloğunun iki kutusuna da aynı değişkeni koymak: sprite kendini takip etmeye çalışır ve hiçbir şey olmaz.
- Takip bloğunu yalnız `oyun başlayınca` içine koyup uzaklık kuralını `her karede` içine yazmamak: hayalet sonsuza dek kovalar ya da hiç uyanmaz.
- `dursun` yerine `takibi bıraksın` kullanmak: hayalet son hızıyla kaymaya devam eder.

## Konuşalım
Gerçek hayatta bir köpek de sana yaklaşınca havlar, uzaktaysa umursamaz. Bu "algılama mesafesi" fikrini hangi başka oyun düşmanlarında gördün? Hayaletin algılama mesafesini oyuncu görebilsin mi, görmesin mi?
