# Keypad 4x4
slug: keypad
parça: keypad
kategori: Girdi
özet: 16 tuşu 8 pinle okuyan matris tuş takımı. Satırlar ve sütunlar doğrudan Uno pinlerine bağlanır.

## Pinler
- R1: Birinci satır. Uno'da bir giriş pinine (bu sitede D9) bağlanır.
- R2: İkinci satır (bu sitede D8).
- R3: Üçüncü satır (bu sitede D7).
- R4: Dördüncü satır (bu sitede D6).
- C1: Birinci sütun (bu sitede D5).
- C2: İkinci sütun (bu sitede D4).
- C3: Üçüncü sütun (bu sitede D3).
- C4: Dördüncü sütun (bu sitede D2).

## Nasıl çalışır
Tuş takımında her tuş bir satırla bir sütunu basıldığında birleştirir. 16 tuş için 16 tel yerine 4 satır ve 4 sütun, yani 8 tel yeter. Arduino satırları `INPUT_PULLUP` ile HIGH'ta bekletir, sütunları sırayla LOW yapar. Basılı tuşun sütunu LOW iken o tuşun satırı da LOW okunur; kesişen satır ve sütun tuşu ele verir.

`Keypad` kitaplığı bu taramayı ve sıçrama önlemeyi yapar. `getKey()` yeni basılan tuşu `char` olarak bir kez döndürür; basış yoksa `'\0'` döndürür.

**İleri düzey:** Diyotsuz bir matriste aynı anda üç tuşa basılırsa bir "hayalet" tuş algılanabilir, çünkü akım yanlış bir yoldan döner. Bu yüzden şifre girişi gibi tek tuşla çalışan işler matrisin en güvenli kullanımıdır. Laboratuvardaki parça aynı anda yalnız bir tuşu basılı sayar.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Keypad **R1, R2, R3, R4** | Uno **D9, D8, D7, D6** |
| Keypad **C1, C2, C3, C4** | Uno **D5, D4, D3, D2** |

Sağ paneldeki **Basılı tuş** listesinden bir tuş seçersin; seçilen tuş basılı sayılır, **Yok** dersen bırakılır. Bir tuşu listede seçili bırakmak onu basılı tutmaktır. Tuş haritası satır satır `1 2 3 A`, `4 5 6 B`, `7 8 9 C`, `* 0 # D` biçimindedir.

## Tipik değerler
- Tuş sayısı | 16 | 4 satır × 4 sütun
- Gereken pin sayısı | 8 | 4 satır + 4 sütun
- Satır pinleri modu | INPUT_PULLUP | Kitaplık kendisi ayarlar
- Tuşa basılıyken satır | LOW | Sütun LOW verilirken
- Boşta `getKey()` | '\0' | Basış yoksa

## Sık hatalar
- **Satır ve sütun pinlerini ters yazmak.** Tuşlar yanlış harf verir ya da hiç algılanmaz. Her tuşu sırayla seçip seri monitörde ne yazdığına bak.
- **`getKey()` değerini denetlemeden kullanmak.** Basış yokken `'\0'` döner; `if (tus)` ile süz.
- **Keypad pinlerini başka parçalara da vermek.** D2-D9 bu hafta tuş takımına aittir; servo gibi parçalar başka pine taşınmalıdır.
- **`delay()` ile beklemek.** Beklerken basılan tuşlar kaçabilir; `millis()` kullan.
- **Tuşu basılı bırakmayı unutmak.** Laboratuvarda her basıştan sonra listeyi **Yok**'a al.

## İlgili dersler
- sensorler-ve-projeler:6:2
- sensorler-ve-projeler:6:5
