# Tampon (dokunma) sensörleriyle tepki
süre: 20

## Merak
Evdeki süpürge robotu sandalyeye çarpınca durur, biraz geri gelir ve başka yöne döner. Gözü yok, kamerası yok. Önündeki tampon içinde küçük bir anahtar var: tampon sıkışınca anahtar kapanır. Bu derste robotuna aynı refleksi vereceksin: çarp, geri çekil, dön. Üstelik hangi tamponun bastığına bakıp engelin tersine döneceksin.

## Etkinlik
### Devre
Bu hafta robotun standart bağlantılarını kullanıyoruz (76-80. derslerdeki sürücü bağlantısı aynen geçerli).

| Parça | Bağlantı |
|---|---|
| Sol tampon anahtarı | **D2** ile GND arası (`INPUT_PULLUP`) |
| Sağ tampon anahtarı | **D3** ile GND arası (`INPUT_PULLUP`) |
| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Güç uyarısı:** Motorları Arduino'nun 5 V pininden besleme. Motor sürücüsüne ayrı bir pil bağla ve pilin eksisini Arduino GND'sine de bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama.

D2 ve D3 enkoder pinleridir. 91. derste enkoder gelince bu pinler enkoder için kullanılacak; tamponlar ile enkoder aynı anda bağlanmaz.

Tampon anahtarı robotun ön sol ve ön sağ köşesindedir. Sol tampon basılıysa engel robotun solundadır; sağ tampon basılıysa sağındadır. İkisi birden basılıysa engel tam karşıdadır.

### Program
**Önce tamponu okuyalım.** Tampon bir butondan farksızdır (6. ders): `INPUT_PULLUP` ile bağlanır ve **basılıyken LOW** okunur. Önce yalnızca tamponları izleyelim. 8. dersteki kenar algılamayla her basışı bir kez yazdıralım.

```cpp
// sketch: tampon_oku
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

bool oncekiSol = false;
bool oncekiSag = false;

void setup() {
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW
  bool sag = (digitalRead(TAMPON_SAG) == LOW);

  if (sol != oncekiSol) {
    Serial.println(sol ? "Sol tampon: BASILDI" : "Sol tampon: BIRAKILDI");
    oncekiSol = sol;
  }
  if (sag != oncekiSag) {
    Serial.println(sag ? "Sag tampon: BASILDI" : "Sag tampon: BIRAKILDI");
    oncekiSag = sag;
  }
}
```

**Şimdi çarp, geri çekil, dön.** Motorları ekleyelim. Robot normalde düz ilerler. Bir tampon basılınca sırayla: dur, geri çekil, engelin tersine dön, tekrar ilerle.

```cpp
// sketch: tampon_kacis
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde
const int GERI_MS = 400;
const int DONUS_MS = 450;

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW
  bool sag = (digitalRead(TAMPON_SAG) == LOW);

  if (!sol && !sag) {                  // temas yok: düz ilerle
    surus(HIZ, HIZ);
    return;
  }

  surus(0, 0);                         // 1) dur
  Serial.println(sol && sag ? "CARPMA ON" : sol ? "CARPMA SOL" : "CARPMA SAG");

  surus(-HIZ, -HIZ);                   // 2) geri çekil
  delay(GERI_MS);

  if (sol) surus(HIZ, -HIZ);           // 3) engelin tersine dön:
  else surus(-HIZ, HIZ);               //    sol bastıysa sağa, değilse sola
  delay(DONUS_MS);

  surus(0, 0);
}
```

### Nasıl çalışıyor?
1. `surus(sol, sag)` iki motoru birden sürer (77. ders). Pozitif ileri, negatif geri demektir. `HIZ = 160` PWM değeri motorların ölü bölgesinin (ilk %20) üstündedir (78. ders).
2. Temas yoksa `loop()` her turda `surus(HIZ, HIZ)` der ve geri döner.
3. Tampon basılınca motorlar durur, mesaj yazılır, robot `GERI_MS` kadar geri gider, sonra `DONUS_MS` kadar yerinde döner.
4. Dönüş yönü tampona bağlıdır. Sol tampon basıldıysa engel soldadır, robot **sağa** döner: `surus(HIZ, -HIZ)` ile sol tekerlek ileri, sağ tekerlek geri gider. Kod `if (sol)` diye sorar. Cepheden çarpınca sol tampon da basılıdır, bu yüzden ikisi birden basılınca da robot sağa döner. Yalnız sağ tampon basılıysa sola döner.
5. Döngü bitince `loop()` yeniden başlar ve robot tekrar ilerler.

**Ölçtüklerimiz (benzetim, 2 × 2 m boş arena):**
- Robot duvara hafif sola yatık yaklaşınca önce sol tampon bastı (`CARPMA SOL`), sağa yatık yaklaşınca sağ tampon (`CARPMA SAG`), tam dik yaklaşınca ikisi birden (`CARPMA ON`).
- Tampon basıldığında robotun merkezi duvara yaklaşık 10 cm uzaktaydı. Robotun yarıçapı 7,5 cm olduğundan duvara gömülmeden durdu. Motor gecikmesi yüzünden dur komutundan sonra bile 1-2 cm kayar; bu pay ölçümde yetti.
- 400 ms geri gitmek robotu yaklaşık 5,5 cm geri götürdü. Robot yaklaşık 0,2 m/s ile gidiyor; ama motorlar hızı bir anda değiştirmez (motor gecikmesi), bu yüzden 0,2 m/s × 0,4 s = 8 cm değil, daha az.
- 450 ms'lik dönüş robotu yaklaşık 90° çevirdi. Sol tamponda sağa (−90°), sağ tamponda sola (+90°).
- Boş arenada 15 saniye bırakınca robot yaklaşık 3 metre yol aldı, 2 kez tamponla kaçtı, hiç duvara gömülmedi.

### Dene
- `GERI_MS` değerini 400'den 800'e çıkar. Robot ne kadar geri gidiyor? Dönüş sırasında duvara yaklaşıyor mu?
- `DONUS_MS` değerini 225 yap. Dönüş açısı kaça düşüyor? Dönüş süresi ile açı arasında nasıl bir ilişki var?
- Tamponların pinlerini birbirinin yerine yaz (`TAMPON_SOL` ↔ `TAMPON_SAG`). Robot engele doğru mu dönüyor, engelden uzağa mı?

### Sık yapılan hatalar
- `INPUT_PULLUP` yazmamak: pin havada kalır, tampon basılı olmasa da rastgele okunur.
- Basılı tamponu HIGH sanmak: `INPUT_PULLUP` ile basılı = LOW.
- Dönüş yönünü ters seçmek: robot engele doğru dönüp tekrar çarpar.
- Geri çekilmeyi atlayıp doğrudan dönmek: robot hâlâ engele yapışıkken dönerken sürtünür.
- `delay` bekleyen robot o sırada hiçbir şeye bakamaz. Bu derste sorun değil ama 84. derste `millis()` ile değiştireceğiz.

### Gerçek robotta farklı olabilecekler
- Gerçek tampon anahtarları basılırken ve bırakılırken sıçrar (8. dersteki debounce). Basışı sayarken ya da yön seçerken bu yüzden birkaç milisaniye bekle.
- Tamponlar yalnızca robotun önündeki dar bölgeyi korur. Yandan ya da bir köşeyle sürtünen robot tampona basmayabilir.
- Gerçek robotta hız, tekerlek tutunması ve zemin farklıdır; geri çekilme ve dönüş sürelerini kendi robotunda yeniden ölç.
- Alçak ya da yumuşak engeller (halı kenarı, kablo) tamponu hiç basmayabilir.

## Konuşalım
Tampon "dokunarak" algılar, yani engele çarptıktan sonra haberi alırsın. Bu ne zaman sorun olur? Çarpmadan önce haber veren bir sensöre neden ihtiyaç duyarız?
