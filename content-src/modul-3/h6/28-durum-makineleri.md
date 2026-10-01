# Durum makineleri (FSM)
süre: 25

## Merak
Asansör "kapı açık", "yukarı çıkıyor", "bekliyor" gibi belirli hâllerden yalnızca birinde olur. Bir hâlden ötekine ancak belli olaylarla geçer. Programlarını da böyle düzenlersen karışık `if` yığınları yerine okunaklı bir yapı elde edersin. Buna **durum makinesi** (FSM, finite state machine) denir.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| LED 1 (kırmızı) + 330 Ω | **D13** |
| LED 2 (sarı) + 330 Ω | **D12** |
| LED 3 (yeşil) + 330 Ω | **D11** |
| Buton | **D2** ile GND arası (`INPUT_PULLUP`) |

Her LED'in katodu GND'ye gider.

### Program 1: Butonla mod değiştiren LED
Üç mod var: **KAPALI**, **YAVAS** (1000 ms'de bir değişir), **HIZLI** (250 ms'de bir değişir). Butona her basışta bir sonraki moda geçilir. `enum`, sayılara isim verir: KAPALI = 0, YAVAS = 1, HIZLI = 2.

```cpp
// sketch: fsm_mod
enum Mod { KAPALI, YAVAS, HIZLI };
Mod mod = KAPALI;

unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;

void yanipSon(unsigned long aralik) {
  unsigned long simdi = millis();
  if (simdi - sonDegisim >= aralik) {
    sonDegisim = simdi;
    ledYanik = !ledYanik;
    digitalWrite(13, ledYanik);
  }
}

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  bool basili = (digitalRead(2) == LOW);
  if (basili && !oncekiBasili) {              // yeni basış: sonraki moda geç
    mod = (Mod)((mod + 1) % 3);
    sonDegisim = millis();
    ledYanik = false;
    digitalWrite(13, LOW);
  }
  oncekiBasili = basili;

  switch (mod) {
    case KAPALI:
      digitalWrite(13, LOW);
      break;
    case YAVAS:
      yanipSon(1000);
      break;
    case HIZLI:
      yanipSon(250);
      break;
  }
}
```

### Program 2: Zamanlı trafik ışığı
Burada durumlar butonla değil **zamanla** değişir. Her durumun bir süresi vardır: KIRMIZI 3 sn, YESIL 3 sn, SARI 1 sn, sonra tekrar KIRMIZI.

```cpp
// sketch: fsm_trafik
enum Durum { KIRMIZI, YESIL, SARI };
Durum durum = KIRMIZI;
unsigned long durumBasi = 0;

void setup() {
  pinMode(13, OUTPUT);   // kırmızı
  pinMode(12, OUTPUT);   // sarı
  pinMode(11, OUTPUT);   // yeşil
}

void loop() {
  unsigned long simdi = millis();

  switch (durum) {
    case KIRMIZI:
      digitalWrite(13, HIGH); digitalWrite(12, LOW); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }
      break;
    case YESIL:
      digitalWrite(13, LOW); digitalWrite(12, LOW); digitalWrite(11, HIGH);
      if (simdi - durumBasi >= 3000) { durum = SARI; durumBasi = simdi; }
      break;
    case SARI:
      digitalWrite(13, LOW); digitalWrite(12, HIGH); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 1000) { durum = KIRMIZI; durumBasi = simdi; }
      break;
  }
}
```

### Nasıl çalışıyor?
1. Bir değişken (`mod`, `durum`) programın **şu an hangi hâlde** olduğunu tutar.
2. `switch`, `loop()` her döndüğünde yalnızca o hâlin kodunu çalıştırır.
3. Hâl değişimi, o hâlin içinde yazılır: bir olay (buton) ya da süre dolması.
4. Hâl değişirken zaman sayacını (`durumBasi`) yeniden başlatmayı unutma.
5. Hiçbir yerde `delay` yok; bu yüzden program butona ve zamana aynı anda bakabilir.

Bir FSM çizerken önce hâlleri daire, geçişleri ok olarak kâğıda çiz. Sonra kodu çizime bakarak yaz.

### Dene
- `fsm_mod` programına dördüncü bir mod ekle: KAPALI → YAVAS → HIZLI → SABIT (LED sürekli yanık). `% 3` ifadesini de güncellemeyi unutma.
- `fsm_trafik` programına "yaya düğmesi" ekle: D2'ye basılınca YESIL durumu hemen SARI'ya geçsin.
- Kırmızıdan önce kırmızı+sarı birlikte yansın (gerçek trafik ışığı gibi). Bunun için yeni bir durum gerekir mi?

### Sık yapılan hatalar
- `case` sonuna `break;` koymamak: program bir sonraki durumun kodunu da çalıştırır.
- Durum değişince `durumBasi = simdi;` yazmamak: yeni durum hemen biter.
- Butonun "basılı" olduğu her turda geçiş yapmak: basış bir kez sayılsın diye kenar algılama (`basili && !oncekiBasili`) kullan.
- `enum` isimlerini ve sayı kullanımını karıştırmak: durumlara hep isimle başvur.

## Konuşalım
Ev aletlerinden (çamaşır makinesi, mikrodalga fırın) birini seç. Hangi hâllerde olabilir, hâller arasında hangi olaylar geçiş yaptırır? Bunu kâğıda çizebilir misin?
