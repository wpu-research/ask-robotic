# Diferansiyel sürüş: v, ω ve tekerlek hızları
süre: 25

## Merak
Robot süpürgenin direksiyonu yok. Tek yaptığı, sol ve sağ tekerleğe farklı hız vermek. İki tekerlek aynı hızda dönerse düz gider, biri hızlıysa kavis çizer, ikisi zıt yönde dönerse olduğu yerde döner. Peki robotun 20 cm/s ile ilerlemesini ve saniyede 1 radyan (yaklaşık 57°) dönmesini istersen iki tekerleğe tam olarak hangi hızları vermelisin?

## Etkinlik
Bu modülde robot iki motorlu tekerleğin farkıyla yönlenir. Buna **diferansiyel sürüş** denir. Robotun ölçüleri (benzetimdeki robot da bunları kullanır):

- Tekerlek yarıçapı: r = 3,3 cm = 0,033 m
- Aks aralığı (iki tekerleğin yere değdiği noktalar arası): L = 12 cm = 0,12 m

### Formüller
Sol tekerleğin yerdeki hızı vL, sağınki vR olsun (m/s, ileri +). Robotun hareketini iki sayı anlatır:

- **v**: robotun ortasının ileri hızı (m/s)
- **ω** (omega): robotun dönme hızı (rad/s). Sola dönüş **+**, sağa dönüş **−**.

```
v = (vR + vL) / 2
ω = (vR − vL) / L
R = v / ω = (L / 2) · (vR + vL) / (vR − vL)      (dönme yarıçapı, m)
```

Bir tekerleğin yerdeki hızı, dönme hızıyla bağlantılıdır: vT = r · φ, burada φ tekerleğin rad/s cinsinden dönme hızıdır. Tekerlek saniyede 12 rad dönerse hızı 0,033 · 12 = 0,396 m/s olur.

Özel durumlar:

| Durum | v | ω | R | Robot |
|---|---|---|---|---|
| vR = vL | vR | 0 | sonsuz | düz gider |
| vR = −vL | 0 | 2·vR / L | 0 | yerinde döner |
| vL = 0, vR > 0 | vR / 2 | vR / L | L / 2 = 6 cm | duran tekerleğin etrafında döner |
| vR > vL > 0 | ortada | + | büyük | sola kavis |
| vL > vR > 0 | ortada | − | büyük | sağa kavis |

### Elle hesap
1. **Düz:** vL = vR = 0,30 m/s. v = 0,30 m/s, ω = 0.
2. **Kavis:** vL = 0,20, vR = 0,30. v = 0,25 m/s. ω = 0,10 / 0,12 = 0,83 rad/s (yaklaşık 48°/s). R = 0,06 · 0,50 / 0,10 = 0,30 m.
3. **Yerinde dönüş:** vL = −0,30, vR = 0,30. v = 0. ω = 0,60 / 0,12 = 5 rad/s (yaklaşık 286°/s). Tam tur 2π / 5 = 1,26 s sürer.

**Ters problem:** v ve ω'yi istiyorsan tekerlek hızları şöyle çıkar:

```
vR = v + ω · L / 2
vL = v − ω · L / 2
```

v = 0,20 m/s ve ω = 1 rad/s için: vR = 0,20 + 0,06 = 0,26 m/s, vL = 0,20 − 0,06 = 0,14 m/s. Ama Arduino hızı değil PWM değeri verir. Bunun için de bir eşleme gerekir.

### Devre
Standart Modül 5 bağlantıları (tüm haftalarda aynıdır):

| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor sürücüsü (L298N veya TB6612) | Motor gücü ayrı bir pil kutusundan; sürücünün GND'si Arduino GND'sine bağlı (ortak GND) |

**Güvenlik:** Motorları Arduino'nun 5 V pininden besleme; ayrı bir pil kutusu kullan ve GND'leri birleştir. Pili ters bağlama, uçlarını birbirine değdirme (kısa devre). Robotu ilk denemede tekerlekler havada olacak şekilde kaldır. Bu derste motor sürücüsünü ayrıntılı tanımıyoruz, 77. derste anlatacağız.

### Program
Aşağıdaki sketch seri porttan "sol sağ" biçiminde iki PWM değeri alır (−255 ile 255 arası, eksi = geri). Motorları sürer ve aynı değerlerle formüllerin sonucunu yazar.

`pwmdenHiz` fonksiyonu, PWM değerinden tekerlek hızını (m/s) veren bir model: PWM 51'in altında tekerlek dönmez (**ölü bölge**), PWM 255'te tekerlek 0,396 m/s hızla döner, arası doğrusaldır. Bu değerleri 78. derste kendin ölçeceksin; şimdilik hazır kabul et.

```cpp
// sketch: diferansiyel_hesap
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const float L = 0.12;       // aks aralığı (m)
const float V_MAX = 0.396;  // PWM 255'te tekerlek hızı (m/s)
const int OLU_PWM = 51;     // bu değerin altında tekerlek dönmez

float pwmdenHiz(int pwm) {
  int a = abs(pwm);
  if (a <= OLU_PWM) return 0;
  float h = (a - OLU_PWM) / (255.0 - OLU_PWM) * V_MAX;
  return pwm > 0 ? h : -h;
}

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Hazir: sol_pwm sag_pwm");
}

void loop() {
  if (Serial.available() == 0) return;
  String satir = Serial.readStringUntil('\n');
  int bosluk = satir.indexOf(' ');
  if (bosluk < 0) return;
  int pwmL = constrain(satir.substring(0, bosluk).toInt(), -255, 255);
  int pwmR = constrain(satir.substring(bosluk + 1).toInt(), -255, 255);
  motor(SOL_EN, SOL_IN1, SOL_IN2, pwmL);
  motor(SAG_EN, SAG_IN1, SAG_IN2, pwmR);

  float vL = pwmdenHiz(pwmL);
  float vR = pwmdenHiz(pwmR);
  float v = (vR + vL) / 2;
  float w = (vR - vL) / L;
  Serial.print("vL="); Serial.print(vL, 3);
  Serial.print(" vR="); Serial.print(vR, 3);
  Serial.print(" v="); Serial.print(v, 3);
  Serial.print(" w="); Serial.print(w, 3);
  if (fabs(vR - vL) < 0.0005) {
    Serial.println(" R=duz");
  } else {
    Serial.print(" R="); Serial.println((L / 2) * (vR + vL) / (vR - vL), 3);
  }
}
```

Serial Monitor'de satır sonunu "Yeni satır (Newline)" yap ve `204 204`, `-204 204`, `153 204` gibi çiftler gönder.

### Nasıl çalışıyor?
1. `motor()` işaretli PWM alır: pozitifse IN1 yüksek, negatifse IN2 yüksek olur. Hız `analogWrite` ile EN pinine gider. Yön ve PWM ayrıntısı 77. derstedir.
2. `pwmdenHiz()` PWM'i m/s'ye çevirir. Ölü bölge içinde sıfır döner.
3. Sonra `v` ve `ω` yukarıdaki iki formülle hesaplanır. `R` yalnızca tekerlek hızları farklıysa hesaplanır; aynıysa payda sıfır olur, o yüzden "duz" yazılır.
4. Hesap ile gerçek hareketi karşılaştırmak için aynı sketch'i benzetimdeki robotta çalıştırıp 2 saniye boyunca robotun aldığı yolu ve yön değişimini ölçtük.

### Ölçüm
Benzetimdeki robotta ölçülen değerler (her satırda hareket oturduktan sonraki 2 saniyelik ortalama):

| Gönderilen (sol sağ) | Hesaplanan v, ω, R | Ölçülen v, ω, R |
|---|---|---|
| `204 204` | 0,297 m/s, 0, düz | 0,295 m/s, 0, düz |
| `-204 204` | 0, 4,95 rad/s, 0 | 0, 4,92 rad/s (yaklaşık 282°/s), 0 |
| `153 204` | 0,248 m/s, 0,825 rad/s, 0,30 m | 0,246 m/s, 0,822 rad/s, 0,30 m |
| `0 204` | 0,148 m/s, 2,475 rad/s, 0,06 m | 0,148 m/s, 2,46 rad/s, 0,06 m |

Hesap ile ölçüm birbirine çok yakın. Zıt hızla robot gerçekten olduğu yerde döndü, `0 204` ile duran tekerleğin etrafında 6 cm yarıçaplı daire çizdi. Ters problemin cevabı da tuttu: `123 185` gönderdiğinde robot v = 0,20 m/s ve ω = 1,0 rad/s ile gitti (PWM 123 ve 185 değerlerini `pwmdenHiz` fonksiyonunun tersiyle bulduk: PWM = 51 + 204 · v / 0,396).

Gerçek robotta farklı olabilecekler: tekerlekler yerde kayar, iki motor tıpatıp aynı hızda dönmez, yarıçap ve aks aralığı cetvelle ölçülmelidir. Formüller aynı kalır, ölçülen sonuçlar benzetimdeki kadar temiz çıkmaz.

### Dene
- `100 -100` gönder. Robot hangi yöne döner? Formülle ω'nın işaretini önceden tahmin et.
- Yarıçapı 15 cm olan bir kavis için vL ve vR ne olmalı? (İpucu: v = 0,2 m/s seç, ω = v / R'yi hesapla, sonra ters problem formülünü kullan.)
- Aynı hızı iki tekerleğe de ver ama `OLU_PWM` altında bir değer yaz (`40 40`). Neden hiçbir şey olmuyor?

### Sık yapılan hatalar
- Santimetre ile metreyi karıştırmak: L = 12 değil, 0,12 m.
- L yerine tekerlek yarıçapını (0,033) yazmak.
- ω'yı derece sanmak: formül radyan/saniye verir. Dereceye çevirmek için 180/π ≈ 57,3 ile çarp.
- Dönüş yönünü karıştırmak: sağ tekerlek hızlıysa robot **sola** döner (ω pozitif).
- vR = vL iken R formülünü hesaplamaya çalışmak: sıfıra bölme olur.

## Konuşalım
Gerçek bir robotun iki motoru aynı PWM'de bile tam aynı hızda dönmeyebilir. Bu durumda "düz git" dediğinde robot ne yapar ve bunu nasıl fark edersin?
