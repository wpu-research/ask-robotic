// Drone dersi üniteleri 1–5: uçuş fiziği, itki zinciri, güç, sensörler ve füzyon, irtifa PID'i. HTML iki dilde aynı etiket dizisinde.
import type { Unit } from './course'
import { batteryPy, compCpp, flightPy, hoverPy, mixerCpp, pidCpp, pidPy } from './code'

export const UNITS_A: Unit[] = [
  {
    n: 1, pillars: ['parca', 'sim', 'yazilim'], sims: ['mixer'], parts: ['frame', 'prop', 'motor'],
    tr: {
      title: 'Multirotor nasıl uçar: kuvvetler, gövde ve karıştırıcı',
      summary: 'Dört pervaneden dört komuta: gaz, yuvarlanma, yunuslama, sapma. X ve H gövde, boyut sınıfları.',
      goals: ['Askıdaki bir quadrotorun kuvvet dengesini kurmak', 'Dört motorun hızından gaz, yuvarlanma, yunuslama ve sapmanın nasıl çıktığını açıklamak', 'X ve H gövdeyi, boyut sınıflarını karşılaştırmak', 'Karıştırıcının doyumda neyi feda ettiğini simülasyonda göstermek'],
      notes: `<p>Bir quadrotorun dört sabit hatveli pervanesi vardır; her biri yaklaşık <i>T = k<sub>f</sub> ω²</i> itkisi ve <i>Q = k<sub>m</sub> ω²</i> reaksiyon torku üretir. İkisi saat yönünde (CW), ikisi tersine (CCW) döner: reaksiyon torkları birbirini sıfırlar, drone kendi ekseninde dönmez.</p>
<h3>Dört motordan dört komut</h3>
<ul><li><b>Gaz</b>: dört motor birlikte hızlanır; toplam itki ağırlığı aşarsa drone yükselir.</li><li><b>Yuvarlanma (roll)</b>: sol motorlar sağdakilerden hızlı döner, drone sağa yatar.</li><li><b>Yunuslama (pitch)</b>: öndekiler hızlanınca burun kalkar.</li><li><b>Sapma (yaw)</b>: CCW çift CW çiftten hızlı dönünce net reaksiyon torku gövdeyi saat yönünde çevirir. Toplam itki değişmez.</li></ul>
<div class="eq">askıda: 4 T = m g &nbsp;→&nbsp; T = m g / 4</div>
<p>Drone <b>eksik eyleyicilidir</b>: altı serbestlik derecesine karşı dört giriş. Yana gitmek için önce eğilmesi gerekir; itkinin yatay bileşeni ivmeyi verir. Bu yüzden konum denetimi her zaman yönelim denetiminin üstünden geçer (5–7. üniteler).</p>
<h3>Gövde geometrisi</h3>
<p>X gövdede motorlar merkeze simetriktir; H gövde daha çok iç hacim verir ama yuvarlanma ve yunuslama eylemsizliği farklıdır. Boyut sınıfı pervaneyle anılır: 5 inç FPV yaklaşık 220 mm, X500 sınıfı 500 mm dingil açıklığındadır. Kol ne kadar uzunsa aynı itki farkı o kadar büyük tork üretir ama gövde o kadar ağır ve esnek olur.</p>`,
      code: [mixerCpp('tr')],
      lab: 'Karıştırıcıda gazı 0,5\'te tut, yuvarlanmayı +0,3 yap: hangi motorlar hızlandı? Sonra gazı 0,95\'e çıkar: karıştırıcı gazı ne kadar kaydırdı? Yuvarlanmayı 0,5, sapmayı 0,3 yap ve sapmanın neden kısıldığını açıkla. Son olarak gazı 0\'a indirip airmode\'u kapat.',
      pitfalls: ['Motor numaralandırmasını ve dönüş yönünü firmware belgesinden kontrol etmemek: PX4 ve Betaflight farklı numaralandırır.', 'Pervaneyi ters takmak: drone kalkışta takla atar. Her motorda CW/CCW pervane kontrol edilmeli.', 'Sapmanın toplam itkiyi değiştirdiğini sanmak: CW ve CCW çiftleri zıt yönde değişir, toplam sabittir.', 'Doyumda tüm komutların korunacağını varsaymak: motor %100\'e dayanınca bir şey feda edilir, PX4\'te önce sapma.'],
      se: `<p>Karıştırıcı saf bir fonksiyondur: aynı girdi, aynı çıktı. Bu, onu <b>birim testi</b> için ideal yapar.</p>
<ul><li>Özellik testleri yaz: "doyum yoksa motorların toplamı 4 × gazdır", "çıkış her zaman 0..1 aralığındadır", "yuvarlanma işareti değişince sol ve sağ yer değiştirir".</li><li>Geometriyi koddan ayır: motor konumları ve dönüş yönleri bir tablo (PX4\'te CA_ROTOR* parametreleri) olsun, kod tabloyu okusun.</li></ul>`,
      quiz: [
        { q: '1,5 kg\'lık bir quadrotor askıda duruyor. Motor başına itki yaklaşık kaç gram-kuvvet?', options: ['150 gf', '375 gf', '750 gf', '1500 gf'], answer: 1, why: 'Toplam itki ağırlığa eşit: 1500 gf. Dört motora bölünür: 375 gf (≈ 3,7 N).' },
        { q: 'PX4 Quad X\'te drone\'u yukarıdan bakınca saat yönünde çevirmek (yaw +) için hangi motorlar hızlanır?', options: ['M3 ve M4 (CW olanlar)', 'M1 ve M3 (öndekiler)', 'M1 ve M2 (CCW olanlar)', 'Dördü birlikte'], answer: 2, why: 'CCW dönen pervanelerin reaksiyon torku gövdeyi CW çevirir; bu yüzden CCW çift (M1, M2) hızlanır, CW çift yavaşlar.' },
        { q: 'Quadrotor neden eksik eyleyicili (underactuated) sayılır?', options: ['Altı serbestlik derecesi var ama yalnız dört girişi var', 'Motorları yalnız tek yönde döner', 'Sensörü yoktur', 'Pervaneleri sabit hatvelidir ve bu yüzden kalkamaz'], answer: 0, why: 'Üç öteleme ve üç dönme serbestliğine karşı dört motor hızı vardır; yana gitmek için önce eğilmek gerekir.' },
        { q: 'Sağa yatmak (roll +) için hangi motorlar hızlanır?', options: ['Öndekiler', 'Sağdakiler', 'Arkadakiler', 'Soldakiler (M2, M3)'], answer: 3, why: 'Sol taraf daha çok itki üretince sol kalkar, drone sağa yatar.' },
      ],
    },
    en: {
      title: 'How a multirotor flies: forces, frame and mixer',
      summary: 'Four commands from four propellers: throttle, roll, pitch, yaw. X and H frames, size classes.',
      goals: ['Write the force balance of a hovering quadrotor', 'Explain how throttle, roll, pitch and yaw come from the speeds of four motors', 'Compare X and H frames and size classes', 'Show in simulation what the mixer gives up when saturated'],
      notes: `<p>A quadrotor has four fixed-pitch propellers; each produces thrust of about <i>T = k<sub>f</sub> ω²</i> and a reaction torque <i>Q = k<sub>m</sub> ω²</i>. Two spin clockwise (CW) and two counter-clockwise (CCW): the reaction torques cancel and the drone does not spin about its axis.</p>
<h3>Four commands from four motors</h3>
<ul><li><b>Throttle</b>: all four motors speed up together; if total thrust exceeds weight the drone climbs.</li><li><b>Roll</b>: the left motors spin faster than the right ones and the drone rolls right.</li><li><b>Pitch</b>: speeding up the front motors raises the nose.</li><li><b>Yaw</b>: when the CCW pair spins faster than the CW pair, the net reaction torque turns the body clockwise. Total thrust does not change.</li></ul>
<div class="eq">hover: 4 T = m g &nbsp;→&nbsp; T = m g / 4</div>
<p>A drone is <b>underactuated</b>: four inputs for six degrees of freedom. To move sideways it must tilt first; the horizontal component of thrust gives the acceleration. That is why position control always goes through attitude control (units 5–7).</p>
<h3>Frame geometry</h3>
<p>On an X frame the motors are symmetric about the centre; an H frame gives more internal space but different roll and pitch inertia. Size classes are named after the propeller: a 5 inch FPV is about 220 mm, the X500 class has a 500 mm wheelbase. A longer arm turns the same thrust difference into more torque but makes the frame heavier and more flexible.</p>`,
      code: [mixerCpp('en')],
      lab: 'In the mixer keep throttle at 0.5 and set roll to +0.3: which motors sped up? Then raise throttle to 0.95: how much did the mixer shift the throttle? Set roll to 0.5 and yaw to 0.3 and explain why yaw is cut. Finally bring throttle to 0 and turn airmode off.',
      pitfalls: ['Not checking motor numbering and spin direction in the firmware docs: PX4 and Betaflight number motors differently.', 'Mounting a propeller the wrong way: the drone flips on take-off. Check CW/CCW props on every motor.', 'Thinking yaw changes total thrust: the CW and CCW pairs change in opposite directions, the total stays the same.', 'Assuming all commands survive saturation: when a motor hits 100% something is given up, in PX4 yaw first.'],
      se: `<p>The mixer is a pure function: same input, same output. That makes it ideal for <b>unit testing</b>.</p>
<ul><li>Write property tests: "without saturation the motor sum is 4 × throttle", "outputs are always in 0..1", "flipping the roll sign swaps left and right".</li><li>Separate geometry from code: motor positions and spin directions belong in a table (the CA_ROTOR* parameters in PX4) that the code reads.</li></ul>`,
      quiz: [
        { q: 'A 1.5 kg quadrotor is hovering. About how much thrust does each motor produce, in gram-force?', options: ['150 gf', '375 gf', '750 gf', '1500 gf'], answer: 1, why: 'Total thrust equals weight: 1500 gf. Split over four motors: 375 gf (≈ 3.7 N).' },
        { q: 'On a PX4 Quad X, which motors speed up to turn the drone clockwise seen from above (yaw +)?', options: ['M3 and M4 (the CW ones)', 'M1 and M3 (the front ones)', 'M1 and M2 (the CCW ones)', 'All four together'], answer: 2, why: 'The reaction torque of CCW propellers turns the body CW, so the CCW pair (M1, M2) speeds up and the CW pair slows down.' },
        { q: 'Why is a quadrotor called underactuated?', options: ['It has six degrees of freedom but only four inputs', 'Its motors only spin one way', 'It has no sensors', 'Its propellers have fixed pitch so it cannot take off'], answer: 0, why: 'Four motor speeds for three translational and three rotational degrees of freedom; to move sideways it must tilt first.' },
        { q: 'Which motors speed up to roll right (roll +)?', options: ['The front ones', 'The right ones', 'The rear ones', 'The left ones (M2, M3)'], answer: 3, why: 'When the left side makes more thrust it rises and the drone rolls right.' },
      ],
    },
  },
  {
    n: 2, pillars: ['parca', 'sim', 'yazilim'], sims: ['twr'], parts: ['motor', 'esc', 'prop'],
    tr: {
      title: 'İtki zinciri: fırçasız motor, ESC ve pervane',
      summary: 'KV, stator, DShot ve pervane çap/hatvesi; itki/ağırlık oranı ve askıda kalma gazı.',
      goals: ['Motor adındaki stator ölçüsünü ve KV\'yi yorumlamak', 'ESC\'nin üç fazlı köprüsünü ve DShot protokolünü açıklamak', 'İtki tablosundan itki/ağırlık oranını ve askıda kalma gazını hesaplamak', 'Pervane çapı ve hatvesinin itki ve güce etkisini anlatmak'],
      notes: `<p>İtki zinciri batarya → ESC → motor → pervane sırasıyla akar. Her halkada kayıp vardır ve zincirin en zayıf halkası uçuşu sınırlar.</p>
<h3>Motor ve ESC</h3>
<p>Fırçasız motorda sargılar sabittir, mıknatıslı çan döner. <b>2207</b> stator çapı 22 mm, yüksekliği 7 mm demektir. <b>KV</b> volt başına yüksüz devirdir: 1950 KV × 22,2 V ≈ 43 000 rpm. ESC altı MOSFET\'le fazları sırayla anahtarlar; komut eskiden 1000–2000 µs PWM idi, bugün sayısal <b>DShot</b> (değer 48–2047, CRC korumalı) kullanılır. Çift yönlü DShot motor devrini geri yollar ve devir tabanlı süzgeçlere girdi olur (6. ünite).</p>
<h3>Pervane ve itki/ağırlık</h3>
<div class="eq">T ∝ ρ n² D⁴ &nbsp;&nbsp; P ∝ ρ n³ D⁵ &nbsp;&nbsp; İ/A = Σ T<sub>azami</sub> / (m g)</div>
<ul><li><b>İ/A ≈ 2</b>: yük ve kamera drone\'u; askıda kalma yaklaşık yarı itkide, manevra ve rüzgâr için pay kalır.</li><li><b>İ/A 4–10</b>: FPV ve akrobasi.</li><li><b>İ/A &lt; 1,5</b>: rüzgârda ya da bataryanın sonunda denetim kaybı riski.</li></ul>
<p>Askıda kalma gazı itki eğrisine bağlıdır. İtki devrin karesiyle büyür ama ESC + motor zinciri bunu kısmen doğrusallaştırır; PX4 bu eğriyi <code>THR_MDL_FAC</code> ile modeller (0 doğrusal, 1 karesel). Yanlış model, irtifa denetiminin gaz aralığının bir ucunda sert, öbür ucunda gevşek olmasına yol açar.</p>`,
      code: [hoverPy('tr')],
      lab: 'İtki/ağırlık simülasyonunda üç hazır ayarı karşılaştır. "Ağır ve zayıf" ayarda itki/ağırlığı 2\'ye çıkarmak için motor başına itkiyi ne kadar artırmalısın? THR_MDL_FAC\'ı 0\'dan 1\'e çek: askıda kalma gazı nasıl değişti ve neden?',
      pitfalls: ['Motoru yalnız KV\'ye bakarak seçmek: aynı KV\'de stator ve sargı farkı itki tablosunu değiştirir.', 'Pervaneyi büyütüp motor akımını kontrol etmemek: güç D⁵ ile büyür, ESC ve motor yanar.', 'Tam gaz itkisini askıda kalma verimiyle karıştırmak: uçuş süresini askıda kalma noktasındaki gf/W belirler.', 'PWM ESC\'yi kalibre etmeden uçurmak; DShot\'ta ise kalibrasyon gerekmez ama motor yönü yazılımdan ayarlanır.'],
      se: `<p>Parça seçimi bir <b>gereksinim izlenebilirliği</b> problemidir: "8 m/s rüzgârda konum tutmalı" gereksinimi bir İ/A alt sınırına, o da motor ve pervane seçimine iner.</p>
<ul><li>Her tasarım kararını hangi gereksinimden çıktığıyla birlikte kaydet (karar kaydı, ADR).</li><li>Hesapları bir betikte tut ve sürüm denetimine koy: parça değişince sonuçlar yeniden üretilebilsin.</li></ul>`,
      quiz: [
        { q: '1950 KV bir motor 6S bataryada (22,2 V) yüksüz yaklaşık kaç rpm döner?', options: ['≈ 8 800 rpm', '≈ 19 500 rpm', '≈ 43 000 rpm', '≈ 86 000 rpm'], answer: 2, why: 'KV × gerilim: 1950 × 22,2 ≈ 43 300 rpm. Yük altında daha düşüktür.' },
        { q: 'İ/A = 2 ve itki modeli doğrusal (THR_MDL_FAC = 0) ise askıda kalma gazı nedir?', options: ['%50', '%25', '%71', '%100'], answer: 0, why: 'Doğrusal modelde gaz itkiyle orantılıdır; askıda azami itkinin yarısı gerekir.' },
        { q: 'İtki devrin karesiyle büyüyorsa itkiyi iki katına çıkarmak için devir kaç kat artmalı?', options: ['2', '4', '1,41', '1,19'], answer: 2, why: 'T ∝ n² ise n ∝ √T: √2 ≈ 1,41.' },
        { q: 'DShot\'un analog PWM\'e göre en önemli üstünlüğü hangisidir?', options: ['Daha yüksek gerilim taşır', 'Sayısaldır, CRC ile korunur ve kalibrasyon gerektirmez', 'Motoru daha güçlü yapar', 'Yalnız 8 bit ESC\'lerde çalışır'], answer: 1, why: 'DShot değeri sayısal paket olarak gider; bozulursa CRC yakalar, ESC\'ye göre uç değer ayarı gerekmez.' },
      ],
    },
    en: {
      title: 'The propulsion chain: brushless motor, ESC and propeller',
      summary: 'KV, stator, DShot and propeller diameter/pitch; thrust-to-weight and hover throttle.',
      goals: ['Read the stator size and KV in a motor name', 'Explain the ESC\'s three-phase bridge and the DShot protocol', 'Compute thrust-to-weight and hover throttle from a thrust table', 'Describe how propeller diameter and pitch affect thrust and power'],
      notes: `<p>The propulsion chain runs battery → ESC → motor → propeller. Every link has losses, and the weakest link limits the flight.</p>
<h3>Motor and ESC</h3>
<p>In a brushless motor the windings are fixed and the magnet bell spins. <b>2207</b> means a 22 mm stator diameter and 7 mm height. <b>KV</b> is the no-load speed per volt: 1950 KV × 22.2 V ≈ 43,000 rpm. The ESC switches the phases in sequence with six MOSFETs; commands used to be 1000–2000 µs PWM, today digital <b>DShot</b> (values 48–2047, CRC-protected) is used. Bidirectional DShot sends motor RPM back and feeds RPM-based filters (unit 6).</p>
<h3>Propeller and thrust-to-weight</h3>
<div class="eq">T ∝ ρ n² D⁴ &nbsp;&nbsp; P ∝ ρ n³ D⁵ &nbsp;&nbsp; T/W = Σ T<sub>max</sub> / (m g)</div>
<ul><li><b>T/W ≈ 2</b>: payload and camera drones; hover at about half thrust, leaving margin for manoeuvres and wind.</li><li><b>T/W 4–10</b>: FPV and acrobatics.</li><li><b>T/W &lt; 1.5</b>: risk of losing control in wind or at the end of the battery.</li></ul>
<p>Hover throttle depends on the thrust curve. Thrust grows with the square of RPM but the ESC + motor chain partly linearises it; PX4 models this curve with <code>THR_MDL_FAC</code> (0 linear, 1 quadratic). A wrong model makes altitude control stiff at one end of the throttle range and sloppy at the other.</p>`,
      code: [hoverPy('en')],
      lab: 'Compare the three presets in the thrust-to-weight simulation. With "Heavy and weak", how much must you raise thrust per motor to reach a T/W of 2? Move THR_MDL_FAC from 0 to 1: how did hover throttle change, and why?',
      pitfalls: ['Choosing a motor by KV alone: at the same KV, stator and winding differences change the thrust table.', 'Fitting a larger propeller without checking motor current: power grows with D⁵ and the ESC and motor burn.', 'Confusing full-throttle thrust with hover efficiency: flight time is set by gf/W at the hover point.', 'Flying a PWM ESC without calibration; with DShot no calibration is needed but motor direction is set in software.'],
      se: `<p>Choosing parts is a <b>requirements traceability</b> problem: "must hold position in 8 m/s wind" turns into a lower bound on T/W, and that into a motor and propeller choice.</p>
<ul><li>Record every design decision with the requirement it came from (decision record, ADR).</li><li>Keep the calculations in a script under version control, so results can be reproduced when a part changes.</li></ul>`,
      quiz: [
        { q: 'About how fast does a 1950 KV motor spin unloaded on a 6S battery (22.2 V)?', options: ['≈ 8,800 rpm', '≈ 19,500 rpm', '≈ 43,000 rpm', '≈ 86,000 rpm'], answer: 2, why: 'KV × voltage: 1950 × 22.2 ≈ 43,300 rpm. Under load it is lower.' },
        { q: 'With T/W = 2 and a linear thrust model (THR_MDL_FAC = 0), what is the hover throttle?', options: ['50%', '25%', '71%', '100%'], answer: 0, why: 'In the linear model throttle is proportional to thrust; hover needs half of maximum thrust.' },
        { q: 'If thrust grows with the square of RPM, by what factor must RPM rise to double thrust?', options: ['2', '4', '1.41', '1.19'], answer: 2, why: 'If T ∝ n² then n ∝ √T: √2 ≈ 1.41.' },
        { q: 'What is the most important advantage of DShot over analog PWM?', options: ['It carries a higher voltage', 'It is digital, CRC-protected and needs no calibration', 'It makes the motor stronger', 'It only works on 8-bit ESCs'], answer: 1, why: 'The DShot value travels as a digital packet; corruption is caught by the CRC and no end-point calibration per ESC is needed.' },
      ],
    },
  },
  {
    n: 3, pillars: ['parca', 'sim', 'yazilim'], sims: ['flight'], parts: ['lipo', 'pdb'],
    tr: {
      title: 'Güç: LiPo, PDB/BEC ve uçuş süresi',
      summary: 'Hücre sayısı, C oranı, kapasite; momentum teorisiyle askıda kalma gücü ve uçuş süresi.',
      goals: ['LiPo etiketini (S, mAh, C) okumak ve güvenli kullanım sınırlarını söylemek', 'Momentum teorisiyle askıda kalma gücünü hesaplamak', 'Batarya kütlesini hesaba katarak uçuş süresini tahmin etmek', 'PDB, BEC ve güç modülünün görevlerini ayırt etmek'],
      notes: `<p>Bir pervane havayı aşağı iterek itki üretir. Momentum teorisine göre ideal güç itkinin 1,5. kuvvetiyle büyür ve disk alanı büyüdükçe azalır:</p>
<div class="eq">P<sub>ideal</sub> = T<sup>1,5</sup> / √(2 ρ A) &nbsp;&nbsp; P<sub>elektrik</sub> = n · P<sub>ideal</sub> / (FM · η<sub>motor+ESC</sub>)</div>
<p>Gerçek pervane idealin ancak %50–75\'ini verir (başarım katsayısı FM); motor ve ESC\'de de %10–30 kayıp vardır. Örnek: 1,0 kg, dört adet 5 inç pervane, FM 0,65, η 0,8 için askıda ≈ 168 W, 4S\'te ≈ 11 A çekilir. 1500 mAh\'lık paketin %80\'i ≈ 6,4 dakika uçuş eder.</p>
<h3>Kapasitenin tuzağı</h3>
<p>Daha büyük batarya daha ağırdır; güç kütlenin 1,5. kuvvetiyle büyüdüğü için kapasiteyi ikiye katlamak uçuş süresini ikiye katlamaz. Simülasyondaki eğri bir noktadan sonra düzleşir: oradan sonra eklenen her gram, kendini taşımaya gider.</p>
<h3>LiPo kuralları</h3>
<ul><li>Hücre 3,7 V anma, 4,2 V dolu, 3,8 V depolama; yük altında 3,3–3,5 V altına inme.</li><li>C × Ah kuramsal sürekli akımdır; üretici C değerine temkinle yaklaş.</li><li>Dengeli şarj, 1C, gözetim altında; şişmiş paketi kullanma.</li><li>PDB akımı dağıtır, BEC elektroniğe 5–12 V üretir, güç modülü gerilim ve akımı uçuş kontrolcüsüne ölçtürür.</li></ul>`,
      code: [flightPy('tr'), batteryPy('tr')],
      lab: 'Uçuş süresi simülasyonunda X500 benzeri drone\'la kapasiteyi 3000\'den 12 000 mAh\'a çıkar: süre kaç kat arttı? Pervaneyi 10\'dan 13 inçe büyüt (motor itkisi aynı): askıda güç ne oldu? Sonra 5" FPV gibi ayarla (0,5 kg, 6S, 1300 mAh, 5 inç) ve C oranını 30\'a düşürünce uyarının çıktığını gör.',
      pitfalls: ['Kapasiteyi artırınca uçuş süresinin orantılı artacağını sanmak.', 'Yük altındaki gerilim düşüşünü (sag) batarya bitti sanmak ya da tersine, dinlenme gerilimine bakıp aşırı boşaltmak.', 'Uçuş kontrolcüsünde akım sensörü ölçeğini ayarlamamak: kalan kapasite yanlış hesaplanır, failsafe geç tetiklenir.', 'Dijital VTX\'i 5 V BEC\'ten beslemeye çalışmak; 9–12 V ister.'],
      se: `<p>Uçuş süresi tahmini bir <b>model</b>dir; modelin varsayımlarını yazılı tut ve gerçek veriyle <b>doğrula</b>.</p>
<ul><li>Varsayımlar: FM, verim, özgül enerji, kullanılabilir kapasite. Her biri bir parametre, kodda sabit sayı değil.</li><li>SITL ya da gerçek uçuş kayıtlarından (PX4 ULog, battery_status) ölçülen akımla modeli karşılaştır, hatayı rapora yaz.</li></ul>`,
      quiz: [
        { q: '6S 1300 mAh 100C bir paketin kuramsal sürekli akımı nedir?', options: ['13 A', '100 A', '130 A', '1300 A'], answer: 2, why: 'C × Ah = 100 × 1,3 = 130 A. Gerçekte üretici değerleri çoğu zaman iyimserdir.' },
        { q: 'Askıda 12 A çeken bir drone 5000 mAh paketin %80\'ini kullanırsa kaç dakika uçar?', options: ['20 dakika', '25 dakika', '33 dakika', '12 dakika'], answer: 0, why: '0,8 × 5 Ah = 4 Ah; 4 / 12 = 0,333 saat = 20 dakika.' },
        { q: 'Kapasiteyi iki katına çıkarmak uçuş süresini neden iki katına çıkarmaz?', options: ['LiPo\'nun gerilimi düşer', 'Batarya ağırlaşır ve askıda güç kütlenin 1,5. kuvvetiyle büyür', 'ESC daha çok akım veremez', 'Pervane verimi kapasiteye bağlıdır'], answer: 1, why: 'P ∝ T^1,5 ve T = m g: daha ağır paket daha çok güç ister, kazanç azalır.' },
        { q: 'LiPo hücresinin depolama gerilimi kaç volttur?', options: ['3,3 V', '3,7 V', '4,2 V', '3,8 V'], answer: 3, why: 'Uzun süre saklarken hücre başına ≈ 3,8 V; dolu (4,2 V) ya da boş saklamak ömrü kısaltır.' },
      ],
    },
    en: {
      title: 'Power: LiPo, PDB/BEC and flight time',
      summary: 'Cell count, C rating, capacity; hover power from momentum theory and flight time.',
      goals: ['Read a LiPo label (S, mAh, C) and state the safe operating limits', 'Compute hover power from momentum theory', 'Estimate flight time including the battery\'s own mass', 'Tell apart the roles of the PDB, BEC and power module'],
      notes: `<p>A propeller makes thrust by pushing air down. By momentum theory the ideal power grows with thrust to the power 1.5 and falls as disk area grows:</p>
<div class="eq">P<sub>ideal</sub> = T<sup>1.5</sup> / √(2 ρ A) &nbsp;&nbsp; P<sub>electric</sub> = n · P<sub>ideal</sub> / (FM · η<sub>motor+ESC</sub>)</div>
<p>A real propeller achieves only 50–75% of the ideal (figure of merit FM), and the motor and ESC lose another 10–30%. Example: 1.0 kg, four 5 inch props, FM 0.65, η 0.8 gives ≈ 168 W in hover, ≈ 11 A on 4S. Using 80% of a 1500 mAh pack gives ≈ 6.4 minutes of flight.</p>
<h3>The capacity trap</h3>
<p>A bigger battery is heavier; because power grows with mass to the power 1.5, doubling capacity does not double flight time. The curve in the simulation flattens out: past that point every added gram is spent carrying itself.</p>
<h3>LiPo rules</h3>
<ul><li>Cell 3.7 V nominal, 4.2 V full, 3.8 V storage; do not go below 3.3–3.5 V under load.</li><li>C × Ah is the theoretical continuous current; treat manufacturer C ratings with caution.</li><li>Balance charge at 1C, supervised; never use a swollen pack.</li><li>The PDB distributes current, the BEC makes 5–12 V for the electronics, the power module lets the flight controller measure voltage and current.</li></ul>`,
      code: [flightPy('en'), batteryPy('en')],
      lab: 'In the flight-time simulation, with the X500-like drone raise capacity from 3000 to 12,000 mAh: by what factor did the time grow? Increase the propeller from 10 to 13 inch (same motor thrust): what happened to hover power? Then set it up like a 5" FPV (0.5 kg, 6S, 1300 mAh, 5 inch) and watch the warning appear when you drop the C rating to 30.',
      pitfalls: ['Expecting flight time to grow in proportion to capacity.', 'Mistaking voltage sag under load for an empty battery, or the opposite: reading the resting voltage and over-discharging.', 'Not setting the current sensor scale in the flight controller: remaining capacity is computed wrongly and the failsafe triggers late.', 'Trying to power a digital VTX from a 5 V BEC; it needs 9–12 V.'],
      se: `<p>A flight-time estimate is a <b>model</b>; write its assumptions down and <b>validate</b> it against real data.</p>
<ul><li>Assumptions: FM, efficiency, specific energy, usable capacity. Each is a parameter, not a magic number in the code.</li><li>Compare the model with current measured in SITL or real flight logs (PX4 ULog, battery_status) and report the error.</li></ul>`,
      quiz: [
        { q: 'What is the theoretical continuous current of a 6S 1300 mAh 100C pack?', options: ['13 A', '100 A', '130 A', '1300 A'], answer: 2, why: 'C × Ah = 100 × 1.3 = 130 A. In practice manufacturer figures are often optimistic.' },
        { q: 'A drone draws 12 A in hover and uses 80% of a 5000 mAh pack. How long does it fly?', options: ['20 minutes', '25 minutes', '33 minutes', '12 minutes'], answer: 0, why: '0.8 × 5 Ah = 4 Ah; 4 / 12 = 0.333 h = 20 minutes.' },
        { q: 'Why does doubling capacity not double flight time?', options: ['The LiPo voltage drops', 'The battery gets heavier and hover power grows with mass to the power 1.5', 'The ESC cannot supply more current', 'Propeller efficiency depends on capacity'], answer: 1, why: 'P ∝ T^1.5 and T = m g: a heavier pack needs more power, so the gain shrinks.' },
        { q: 'What is the storage voltage of a LiPo cell?', options: ['3.3 V', '3.7 V', '4.2 V', '3.8 V'], answer: 3, why: 'For long-term storage ≈ 3.8 V per cell; storing full (4.2 V) or empty shortens life.' },
      ],
    },
  },
  {
    n: 4, pillars: ['parca', 'sim', 'yazilim'], sims: ['fusion'], parts: ['fc', 'imu', 'baro', 'mag'],
    tr: {
      title: 'Uçuş kontrolcüsü, sensörler ve sensör füzyonu',
      summary: 'STM32 F4/F7/H7, IMU, barometre, pusula; tamamlayıcı süzgeç ve EKF\'ye giriş.',
      goals: ['F4, F7 ve H7 uçuş kontrolcülerini görev ihtiyacına göre seçmek', 'Jiroskop sapmasının ve ivmeölçer gürültüsünün açı kestirimini nasıl bozduğunu göstermek', 'Tamamlayıcı süzgeci yazmak ve τ\'yu seçmek', 'EKF\'nin hangi sensörleri neden birleştirdiğini açıklamak'],
      notes: `<p>Uçuş kontrolcüsü bir STM32 mikrodenetleyici, bir IMU, bir barometre ve çoğu zaman SD kart taşır. Betaflight F4\'te rahat çalışır; PX4 ve ArduPilot\'un EKF\'si ve çok sensörlü sistemler için H7 (480 MHz, çift duyarlıklı FPU) önerilir.</p>
<h3>Hiçbir sensör tek başına yetmez</h3>
<ul><li><b>Jiroskop</b>: açısal hız, kısa vadede temiz. Ama küçük bir sapma (bias) entegre edilince büyür: 2 °/s sapma 20 saniyede 40° hata.</li><li><b>İvmeölçer</b>: yerçekimi yönünden eğim verir, uzun vadede doğru. Ama motor titreşimi ve manevra ivmesi onu bozar.</li><li><b>Barometre</b>: bağıl irtifa, pervane rüzgârına duyarlı. <b>Pusula</b>: mutlak yön, güç kablolarına duyarlı.</li></ul>
<h3>Tamamlayıcı süzgeç</h3>
<div class="eq">θ ← α (θ + ω dt) + (1 − α) θ<sub>ivme</sub>, &nbsp; α = τ / (τ + dt)</div>
<p>Jiroskop yüksek, ivmeölçer alçak frekansta kullanılır; τ ikisinin el değiştirdiği zaman ölçeğidir. Sabit bir jiroskop sapması b kalıcı hata olarak <i>b · τ</i> bırakır: τ küçülürse sapma hatası azalır ama ivmeölçer gürültüsü içeri sızar. PX4 bunun yerine durumu (yönelim, hız, konum, sensör sapmaları) birlikte kestiren bir <b>genişletilmiş Kalman süzgeci (EKF2)</b> kullanır; mantık aynıdır: her sensöre gürültüsü oranında güven.</p>
<p>Not: askıdaki bir multirotorda ivmeölçer büyük ölçüde itki yönünü ölçer; bu yüzden gerçek kestiriciler ivme büyüklüğü 1 g\'den saptığında ivmeölçere güveni azaltır.</p>`,
      code: [compCpp('tr')],
      lab: 'Füzyon simülasyonunda "Yerde sabit" hareketini seç, gürültüleri 0 yap: jiroskop çizgisi 20 s\'de kaç dereceye kaydı? Tamamlayıcı süzgecin kalıcı hatası sapma × τ\'ya eşit mi? Sonra yatış manevralarına dön ve RMSE\'yi en aza indiren τ\'yu bul. İvmeölçer gürültüsünü 12°\'ye çıkarınca en iyi τ nasıl değişti?',
      pitfalls: ['IMU\'yu I²C ile bağlayıp 1 kHz hız döngüsü beklemek.', 'Uçuş kontrolcüsünü titreşim sönümleyicisiz sabitlemek: ivmeölçer kırpılır (clipping), kestirim bozulur.', 'Pusulayı güç kablolarının yanına koymak ve kalibrasyonu atlamak: drone daire çizerek uçar (toilet bowl).', 'Barometreyi süngerle örtmemek: pervane rüzgârı irtifayı zıplatır.'],
      se: `<p>Sensör füzyonu, <b>kayıt ve yeniden oynatma</b> ile test edilir: aynı kayıt, aynı kestirim.</p>
<ul><li>SITL\'de ya da uçuşta sensör verisini kaydet (PX4 ULog), süzgeci çevrimdışı yeniden çalıştırıp çıktısını karşılaştır.</li><li>Rastgele gürültüyü tohumla: bu dersin simülasyonları gibi testler deterministik olmalı, yoksa kırılgan (flaky) olur.</li></ul>`,
      quiz: [
        { q: 'Tamamlayıcı süzgeçte τ = 0,5 s ve jiroskop sapması 2 °/s ise kalıcı açı hatası yaklaşık nedir?', options: ['0,25°', '1°', '4°', 'Sıfır, süzgeç sapmayı tamamen giderir'], answer: 1, why: 'Kalıcı hata ≈ b · τ = 2 °/s × 0,5 s = 1°.' },
        { q: '250 Hz\'de (dt = 4 ms) τ = 0,5 s için α yaklaşık kaçtır?', options: ['0,5', '0,92', '0,992', '0,9999'], answer: 2, why: 'α = 0,5 / (0,5 + 0,004) ≈ 0,992.' },
        { q: 'IMU uçuş kartlarında neden SPI ile bağlanır?', options: ['SPI daha az pin kullanır', 'Hız döngüsü 1–8 kHz örnek ister; I²C bu hızda yetersiz kalır', 'I²C 3,3 V\'ta çalışmaz', 'SPI kablosuzdur'], answer: 1, why: 'Yüksek örnekleme ve düşük gecikme için SPI (MHz düzeyinde saat) gerekir.' },
        { q: 'Askıdaki bir quadrotorda ivmeölçer neden tek başına güvenilir eğim vermez?', options: ['Yerçekimini ölçemez', 'Sıcaklıkla bozulur', 'Yalnız z eksenini ölçer', 'Titreşim ve manevra ivmesi ölçümü bozar; ölçtüğü büyük ölçüde itki yönüdür'], answer: 3, why: 'İvmeölçer özgül kuvveti ölçer; hızlanma ve titreşim yerçekimi yönünü maskeler.' },
      ],
    },
    en: {
      title: 'Flight controller, sensors and sensor fusion',
      summary: 'STM32 F4/F7/H7, IMU, barometer, compass; the complementary filter and an introduction to the EKF.',
      goals: ['Choose F4, F7 and H7 flight controllers for the mission\'s needs', 'Show how gyro bias and accelerometer noise corrupt the angle estimate', 'Write a complementary filter and choose τ', 'Explain which sensors the EKF fuses and why'],
      notes: `<p>A flight controller carries an STM32 microcontroller, an IMU, a barometer and often an SD card. Betaflight runs comfortably on an F4; for the EKF of PX4 and ArduPilot and for multi-sensor systems an H7 (480 MHz, double-precision FPU) is recommended.</p>
<h3>No sensor is enough on its own</h3>
<ul><li><b>Gyro</b>: angular rate, clean in the short term. But a small bias grows when integrated: 2 °/s of bias is 40° of error in 20 seconds.</li><li><b>Accelerometer</b>: tilt from the direction of gravity, right in the long term. But motor vibration and manoeuvre acceleration corrupt it.</li><li><b>Barometer</b>: relative altitude, sensitive to prop wash. <b>Compass</b>: absolute heading, sensitive to power wires.</li></ul>
<h3>The complementary filter</h3>
<div class="eq">θ ← α (θ + ω dt) + (1 − α) θ<sub>acc</sub>, &nbsp; α = τ / (τ + dt)</div>
<p>The gyro is used at high and the accelerometer at low frequencies; τ is the time scale where they hand over. A constant gyro bias b leaves a steady error of <i>b · τ</i>: a smaller τ reduces the bias error but lets accelerometer noise in. PX4 instead uses an <b>extended Kalman filter (EKF2)</b> that estimates the state (attitude, velocity, position, sensor biases) jointly; the logic is the same: trust each sensor in proportion to its noise.</p>
<p>Note: on a hovering multirotor the accelerometer largely measures the thrust direction, so real estimators reduce their trust in it when the acceleration magnitude departs from 1 g.</p>`,
      code: [compCpp('en')],
      lab: 'In the fusion simulation choose "Still on the ground" and set the noises to 0: how many degrees did the gyro line drift in 20 s? Is the complementary filter\'s steady error equal to bias × τ? Then go back to roll manoeuvres and find the τ that minimises the RMSE. How did the best τ change when you raised accelerometer noise to 12°?',
      pitfalls: ['Wiring the IMU over I²C and expecting a 1 kHz rate loop.', 'Hard-mounting the flight controller without damping: the accelerometer clips and the estimate breaks.', 'Placing the compass next to power wires and skipping calibration: the drone circles (toilet bowl).', 'Not covering the barometer with foam: prop wash makes the altitude jump.'],
      se: `<p>Sensor fusion is tested with <b>record and replay</b>: same log, same estimate.</p>
<ul><li>Log sensor data in SITL or in flight (PX4 ULog), re-run the filter offline and compare its output.</li><li>Seed random noise: like the simulations in this course, tests must be deterministic or they become flaky.</li></ul>`,
      quiz: [
        { q: 'In a complementary filter with τ = 0.5 s and a gyro bias of 2 °/s, what is the steady angle error, roughly?', options: ['0.25°', '1°', '4°', 'Zero, the filter removes the bias entirely'], answer: 1, why: 'Steady error ≈ b · τ = 2 °/s × 0.5 s = 1°.' },
        { q: 'At 250 Hz (dt = 4 ms) and τ = 0.5 s, what is α, roughly?', options: ['0.5', '0.92', '0.992', '0.9999'], answer: 2, why: 'α = 0.5 / (0.5 + 0.004) ≈ 0.992.' },
        { q: 'Why is the IMU wired over SPI on flight boards?', options: ['SPI uses fewer pins', 'The rate loop needs 1–8 kHz samples; I²C is too slow for that', 'I²C does not work at 3.3 V', 'SPI is wireless'], answer: 1, why: 'High sampling rates and low latency need SPI (clocked at MHz rates).' },
        { q: 'Why does the accelerometer alone not give a reliable tilt on a hovering quadrotor?', options: ['It cannot measure gravity', 'It is corrupted by temperature', 'It only measures the z axis', 'Vibration and manoeuvre acceleration corrupt it; it largely measures the thrust direction'], answer: 3, why: 'An accelerometer measures specific force; acceleration and vibration mask the direction of gravity.' },
      ],
    },
  },
  {
    n: 5, pillars: ['sim', 'yazilim'], sims: ['alt'], parts: ['baro', 'range'],
    tr: {
      title: 'PID I: irtifa tutma',
      summary: 'P, I, D terimlerinin fiziksel anlamı; aşım, oturma süresi, kalıcı hata, anti-windup.',
      goals: ['P, I ve D terimlerinin her birinin yanıta etkisini simülasyonda göstermek', 'Aşım, yükselme ve oturma süresini okumak', 'İleri beslemenin ve I teriminin kalıcı hatayı nasıl kapattığını açıklamak', 'Anti-windup ve ölçüm üzerinden türevi uygulamak'],
      notes: `<p>İrtifa denetiminde kontrolcü itkiyi belirler. İyi bir başlangıç noktası <b>ileri beslemedir</b>: askıda kalmak için gereken itkiyi (m g) baştan ver, PID yalnız farkı düzeltsin.</p>
<div class="eq">T = m̂ g + K<sub>p</sub> e + K<sub>i</sub> ∫ e dt − K<sub>d</sub> ż, &nbsp; e = z<sub>hedef</sub> − z</div>
<ul><li><b>P</b> yay gibidir: hata büyüdükçe daha çok iter. Tek başına salınım üretir ve kontrolcünün bilmediği bir yük varsa <i>Δm g / K<sub>p</sub></i> kadar kalıcı hata bırakır.</li><li><b>D</b> sönümleyicidir: hıza karşı koyar, aşımı azaltır. Türev hedeften değil ölçümden alınır; yoksa hedef sıçradığında itki de sıçrar ("türev tekmesi").</li><li><b>I</b> belleğe sahiptir: süren hatayı toplar ve kalıcı hatayı sıfırlar. Ama tırmanışta biriken integral aşım yaptırır; itki doymuşken integrali durdurmak <b>anti-windup</b>tur.</li></ul>
<h3>Yanıtı okumak</h3>
<p>Aşım (%), yükselme süresi (%10 → %90) ve oturma süresi (±%2 bandına son giriş) birbiriyle çekişir. Kp\'yi artırmak yanıtı hızlandırır ama aşımı büyütür; Kd bunu dengeler; Ki kalıcı hatayı kapatır. Sıra hep aynıdır: önce P, sonra D, en son I.</p>
<p>PX4 gerçekte irtifayı kaskad yapar: konum hatası → dikey hız hedefi (MPC_Z_P) → hız PID\'i (MPC_Z_VEL_P/I/D) → itki. Simülasyondaki tek döngü bu yapının sadeleştirilmiş halidir.</p>`,
      code: [pidCpp('tr'), pidPy('tr')],
      lab: 'İrtifa simülasyonunda: (1) Ki = 0, Kd = 0 yap, Kp\'yi 6 bırak: yanıt ne yapıyor? (2) Kd\'yi 3\'e çıkar: aşım kaç oldu? (3) 0,3 kg ek yük ver: kalıcı hata Δm g / Kp = 0,49 m mi? (4) Ki\'yi artırarak hatayı kapat. Hem aşımı %10\'un altında hem oturmayı 3 s\'nin altında tutan bir ayar bul (ipucu: Kp 8, Ki 2, Kd 5 civarı).',
      pitfalls: ['Önce Ki\'yi artırmak: kalıcı hatayı I kapatır ama salınımı P ve D yönetir.', 'Türevi hata üzerinden almak: hedef değişince motorlara sıçrama gider.', 'Anti-windup koymamak: itki doyumdayken integral büyür, hedefe gelince uzun bir aşım yapar.', 'Barometre gürültüsünü süzmeden D terimine vermek.'],
      se: `<p>Ayar (tuning) bir <b>deney</b>dir; sonuçlarını tekrarlanabilir kıl.</p>
<ul><li>Kazançları kodda değil parametre dosyasında tut ve sürümle.</li><li>Basamak yanıtı ölçütlerini (aşım, oturma) otomatik hesaplayan bir test yaz; kazanç değişikliği bir eşiği bozarsa CI kırmızı olsun. Bu dersteki <code>stepMetrics</code> tam olarak budur.</li></ul>`,
      quiz: [
        { q: 'Yalnız P (Kp = 6 N/m) ile kontrolcünün bilmediği 0,3 kg yük kalıcı hata olarak yaklaşık ne bırakır?', options: ['0,05 m', '0,49 m', '1,8 m', 'Hata kalmaz'], answer: 1, why: 'Dengede Kp · e = Δm g: e = 0,3 × 9,81 / 6 ≈ 0,49 m.' },
        { q: 'Türev terimi neden hedeften değil ölçümden alınır?', options: ['Hedef sıçradığında itkinin de sıçramasını ("türev tekmesi") önlemek için', 'Ölçüm daha az gürültülü olduğu için', 'Matematiksel olarak farklı sonuç verdiği için hiç kullanılmaz', 'İntegrali sıfırlamak için'], answer: 0, why: 'Sabit hedefte ikisi aynıdır; hedef basamakla değişince hata türevi sonsuz büyür, ölçüm türevi büyümez.' },
        { q: 'Anti-windup ne işe yarar?', options: ['Motorları soğutur', 'Rüzgârı ölçer', 'Çıkış doymuşken integralin büyümesini durdurarak uzun aşımı önler', 'Türevi süzer'], answer: 2, why: 'Doyumda kontrolcü daha fazla itki veremez; integral büyümeye devam ederse hedefe gelince boşalması uzun sürer.' },
        { q: 'Diğer kazançlar sabitken Kd artırılırsa aşım genellikle ne olur?', options: ['Artar', 'Değişmez', 'Kalıcı hataya dönüşür', 'Azalır'], answer: 3, why: 'D terimi hıza karşı koyan sönümdür; makul aralıkta aşımı azaltır (çok büyürse gürültü ve yavaşlama getirir).' },
      ],
    },
    en: {
      title: 'PID I: altitude hold',
      summary: 'The physical meaning of P, I and D; overshoot, settling time, steady-state error, anti-windup.',
      goals: ['Show in simulation how each of P, I and D shapes the response', 'Read overshoot, rise time and settling time', 'Explain how feedforward and the I term close the steady-state error', 'Apply anti-windup and derivative on measurement'],
      notes: `<p>In altitude control the controller sets the thrust. A good starting point is <b>feedforward</b>: give the thrust needed to hover (m g) up front and let the PID correct only the difference.</p>
<div class="eq">T = m̂ g + K<sub>p</sub> e + K<sub>i</sub> ∫ e dt − K<sub>d</sub> ż, &nbsp; e = z<sub>sp</sub> − z</div>
<ul><li><b>P</b> acts like a spring: the bigger the error, the harder it pushes. Alone it oscillates, and a payload the controller does not know leaves a steady error of <i>Δm g / K<sub>p</sub></i>.</li><li><b>D</b> is a damper: it opposes velocity and reduces overshoot. The derivative is taken on the measurement, not the setpoint; otherwise thrust jumps when the setpoint jumps ("derivative kick").</li><li><b>I</b> has memory: it accumulates persistent error and drives the steady-state error to zero. But integral built up during the climb causes overshoot; stopping the integral while thrust is saturated is <b>anti-windup</b>.</li></ul>
<h3>Reading the response</h3>
<p>Overshoot (%), rise time (10 → 90%) and settling time (last entry into the ±2% band) pull against each other. Raising Kp speeds up the response but increases overshoot; Kd balances it; Ki closes the steady-state error. The order is always the same: P first, then D, I last.</p>
<p>PX4 actually controls altitude in a cascade: position error → vertical velocity setpoint (MPC_Z_P) → velocity PID (MPC_Z_VEL_P/I/D) → thrust. The single loop in the simulation is a simplified version of that structure.</p>`,
      code: [pidCpp('en'), pidPy('en')],
      lab: 'In the altitude simulation: (1) set Ki = 0, Kd = 0 and leave Kp at 6: what does the response do? (2) raise Kd to 3: what is the overshoot now? (3) add a 0.3 kg payload: is the steady error Δm g / Kp = 0.49 m? (4) close the error by raising Ki. Find a tune with overshoot under 10% and settling under 3 s (hint: around Kp 8, Ki 2, Kd 5).',
      pitfalls: ['Raising Ki first: I closes the steady error, but P and D manage oscillation.', 'Taking the derivative of the error: a setpoint change sends a jump to the motors.', 'Leaving out anti-windup: the integral grows while thrust is saturated and causes a long overshoot on arrival.', 'Feeding unfiltered barometer noise into the D term.'],
      se: `<p>Tuning is an <b>experiment</b>; make its results reproducible.</p>
<ul><li>Keep gains in a parameter file, not in code, and version it.</li><li>Write a test that computes step-response metrics (overshoot, settling) automatically; if a gain change breaks a threshold, CI turns red. The <code>stepMetrics</code> in this course is exactly that.</li></ul>`,
      quiz: [
        { q: 'With P only (Kp = 6 N/m), what steady error does a 0.3 kg payload unknown to the controller leave, roughly?', options: ['0.05 m', '0.49 m', '1.8 m', 'No error'], answer: 1, why: 'At equilibrium Kp · e = Δm g: e = 0.3 × 9.81 / 6 ≈ 0.49 m.' },
        { q: 'Why is the derivative term taken on the measurement rather than the setpoint?', options: ['To stop thrust from jumping when the setpoint jumps ("derivative kick")', 'Because the measurement is less noisy', 'It gives a different result so it is never used', 'To reset the integral'], answer: 0, why: 'With a constant setpoint both are the same; when the setpoint steps, the derivative of the error becomes huge, the derivative of the measurement does not.' },
        { q: 'What does anti-windup do?', options: ['Cools the motors', 'Measures the wind', 'Stops the integral from growing while the output is saturated, preventing a long overshoot', 'Filters the derivative'], answer: 2, why: 'In saturation the controller cannot give more thrust; if the integral keeps growing it takes a long time to unwind on arrival.' },
        { q: 'With the other gains fixed, what usually happens to overshoot when Kd is increased?', options: ['It grows', 'It does not change', 'It turns into steady-state error', 'It shrinks'], answer: 3, why: 'D is damping that opposes velocity; within a sensible range it reduces overshoot (too much brings noise and sluggishness).' },
      ],
    },
  },
]
