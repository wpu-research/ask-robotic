# Seri komutlarla sürüş (uzaktan kumanda simülasyonu)
süre: 25

## Merak
Bilgisayar oyunlarında W, A, S, D tuşlarıyla karakteri yürütürsün. Robotu da aynı tuşlarla sürebilirsen ne güzel olur. Aslında bunun için ihtiyacın olan şey, seri porttan gelen harfi anlayıp motorlara çeviren küçük bir "ayrıştırıcı". Bir kablo ya da Bluetooth modülü, aynı harfleri robota taşıyabilir. Bu derste kablosuz bölümü atlayıp komutları Serial Monitor'den göndereceğiz.

## Etkinlik
### Komut dili
Önce robota ne söyleyeceğimizi belirleyelim. Her komut bir satırdır: bir harf ve isteğe bağlı bir sayı. Satır, yeni satır karakteriyle (`\n`) biter.

| Komut | Anlamı | Tekerlekler |
|---|---|---|
| `W` | İleri | sol +, sağ + |
| `S` | Geri | sol −, sağ − |
| `A` | Yerinde sola dön | sol −, sağ + |
| `D` | Yerinde sağa dön | sol +, sağ − |
| `X` | Dur | ikisi de 0 |

Harften sonra yazılan sayı hızdır (PWM, 0-255). Sayı yazılmazsa 150 kullanılır. Örnekler: `W200`, `S`, `A100`, `X`. Küçük harf de kabul edilir. Tanınmayan harfe robot `?` ile cevap verir.

Serial Monitor'de satır sonu ayarını "Yeni satır (Newline)" yap; yoksa komut hiç tamamlanmaz.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor gücü | Ayrı pil kutusu; sürücü GND'si Arduino GND'siyle ortak |

**Güvenlik:** İlk denemeyi tekerlekler havadayken yap. Bir komut ya da bağlantı hatasında robotun kaçabileceğini hesaba kat. Pil kutusunu ters bağlama ve kısa devre etme.

### Program
Ayrıştırıcının üç parçası var:

1. **Okuma:** `loop()` seri porttan gelen karakterleri tek tek `tampon` adlı diziye ekler. Yeni satır gelince tampon bir komuttur ve `satirIsle()` çağrılır.
2. **Çözme:** Dizinin ilk karakteri komut harfidir (`toupper` ile büyütülür). Kalanı `atoi` ile sayıya çevrilir. `atoi` "ASCII to integer" demektir, yazıyı tam sayıya çevirir ("200" → 200). `constrain` hızı 0-255'e sınırlar.
3. **Uygulama:** `switch` harfe göre tekerlek hızlarını `surus(sol, sag)` ile ayarlar.

```cpp
// sketch: seri_komut
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const int VARSAYILAN_HIZ = 150;   // hız yazılmazsa kullanılan PWM
char tampon[12];
int uzunluk = 0;

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

void komutIsle(char komut, int hiz) {
  switch (komut) {
    case 'W': surus(hiz, hiz); break;       // ileri
    case 'S': surus(-hiz, -hiz); break;     // geri
    case 'A': surus(-hiz, hiz); break;      // yerinde sola dön
    case 'D': surus(hiz, -hiz); break;      // yerinde sağa dön
    case 'X': surus(0, 0); hiz = 0; break;  // dur
    default:
      Serial.println("?");
      return;
  }
  Serial.print("OK ");
  Serial.print(komut);
  Serial.print(' ');
  Serial.println(hiz);
}

void satirIsle() {
  tampon[uzunluk] = '\0';
  char komut = toupper(tampon[0]);
  int hiz = VARSAYILAN_HIZ;
  if (uzunluk > 1) hiz = constrain(atoi(tampon + 1), 0, 255);
  komutIsle(komut, hiz);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.println("Hazir: W S A D X + hiz (0-255)");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (uzunluk > 0) satirIsle();
      uzunluk = 0;
    } else if (uzunluk < (int)sizeof(tampon) - 1) {
      tampon[uzunluk++] = c;
    }
  }
}
```

### Nasıl çalışıyor?
1. `loop()` hiç beklemez (`delay` yok, 26. ders). Okuma sırasında gelen her karakter tampona gider, böylece uzun bir komut da yarım kalmaz.
2. Hem `\n` hem `\r` satır sonu sayılır. Serial Monitor'ün "Satır sonu" ayarı hangisini gönderirse göndersin çalışır. "Both NL & CR" seçersen iki karakter gelir, ikincisinde tampon boştur ve hiçbir şey olmaz.
3. Tampon 12 karakterlik; uzun satırın fazlası atılır, program taşmaz.
4. `X` komutunda hız 0 olarak yazdırılır.
5. Şu an sürülen yön ve hız bir değişkende değil, doğrudan motor pinlerindedir. Komut gelene kadar pinler aynı kalır. Bu önemli bir sonuç doğuracak, aşağıda göreceksin.

### Ölçüm
Benzetimdeki robota şu komutları gönderdik (komutlar arasında hareketin oturması beklendi):

| Gönderilen | Beklenen | Ölçülen |
|---|---|---|
| `W200` | 0,289 m/s ileri (76. dersteki modelden) | +x yönünde 0,29 m/s, sapma yok |
| `X` | durur | 0,5 sn sonra hız sıfır, seriye `OK X 0` |
| `S` (hız yok, CRLF ile) | 150 ile geri: 0,19 m/s | −x yönünde 0,19 m/s, seriye `OK S 150` |
| `A150` 0,5 sn, sonra `X` | sola yaklaşık 90° | yaklaşık +91°, konum kaymadı |
| `d150` 0,5 sn, sonra `X` | küçük harf kabul, sağa yaklaşık 90° | başlangıç yönüne geri döndü (±6° içinde) |
| `Q` | `?` yazar, robot etkilenmez | seriye `?`, robot hareketsiz |
| `W10` | PWM 10 ölü bölgede (78. ders) | `OK W 10` yazdı ama robot kıpırdamadı |
| `W999` | 255'e sınırlanır | `OK W 255`, 0,396 m/s |

Yerinde dönüşün açısı, süreye bağlıdır: 150 PWM ile robot saniyede yaklaşık 183° döner. 90° için yaklaşık 0,5 sn gerekir. Bu süre pile ve zemine göre değişir; hassas dönüş için ileride enkoder ve IMU kullanacaksın.

### Kumandanın kopması
Son satırdaki bir deneme daha: tek bir `W150` gönder ve başka hiçbir şey gönderme. Benzetimde robot 3 saniye sonra hâlâ 0,19 m/s ile ilerliyordu ve yarım metreden fazla yol aldı. Bunun nedeni açık: robot bir komutu **yeni komut gelene kadar** uygular. Kablo çıkar, Bluetooth kopar ya da bilgisayar donarsa robot son komutla gitmeye devam eder. Gerçek bir robot için bu tehlikeli bir davranış. 80. dersteki projede bu açığı kapatacaksın.

Gerçek robotta farklı olabilecekler: kablosuz bağlantılarda karakter kaybolabilir ya da gecikebilir. Benzetimde seri hat kusursuz ve gecikmesizdir.

### Dene
- `VARSAYILAN_HIZ`'ı 100 yap. `W` komutuyla robot ne kadar hızlı gidiyor? 51 altına inerse ne olur?
- `E` harfini "yavaş ileri" olarak ekle (hız 80 sabit). `switch` içine tek bir `case` yeterli mi?
- Komutu `W 200` (boşluklu) yazınca ne oluyor? `atoi` boşluğu nasıl karşılıyor? Dene.

### Sık yapılan hatalar
- Serial Monitor'ün satır sonu ayarını "Satır sonu yok" bırakmak: komut tamamlanmaz, robot hiç tepki vermez.
- Tamponu `String` ile birleştirip her karakterde yeni bellek ayırmak. Küçük bellekli Uno'da `char` dizisi daha güvenli.
- Hızı sınırlamamak: `W9999` gibi saçma bir sayı `analogWrite`'a taşar. `constrain` bunu önler.
- Bilinmeyen komutta hiçbir şey yapmamak: kullanıcı ne olduğunu anlamaz. Bir `?` yeterlidir.
- Robotu hiçbir zaman otomatik durmayacak şekilde bırakmak. Sonraki derste göreceğiz.

## Konuşalım
Komut protokolünü "ilk karakter komut, kalanı sayı" olarak tasarladık. Daha çok komut eklemek gerekirse (örneğin `+` ve `-` ile hız artırmak) bu tasarım yeter mi? Yeni komutlar eklerken en çok neye dikkat etmek lazım?
