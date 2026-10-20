// Robot kolu dersi üniteleri 1–5: hücre ve eksenler, ileri kinematik, ters kinematik, eklem uzayı ve kartezyen hareket, tutucu ve al-bırak.
// HTML iki dilde aynı etiket dizisinde. Metindeki sayılar kodla doğrulanır (facts.test.ts).
import { armscriptBlock, fkPy, planarIkPy, trapezoidPy } from './code'
import type { Unit } from './course'

export const UNITS_A: Unit[] = [
  {
    n: 1, sims: ['workspace'],
    related: [
      { href: '/muhendislik/robotik/hafta/7', tr: 'ESOF 323, 7. hafta: mobil robot ve manipülatör kinematiği (ön koşul)', en: 'ESOF 323, week 7: mobile robot and manipulator kinematics (prerequisite)' },
      { href: '/muhendislik/robotik/proje/robot-kol', tr: 'ESOF 323 dönem projesi: robot kol', en: 'ESOF 323 term project: robot arm' },
      { href: '/muhendislik/parca/mg996r', tr: 'Hyvex: MG996R servo (küçük kolların eklem motoru)', en: 'Hyvex: MG996R servo (a joint motor for small arms)' },
    ],
    tr: {
      title: 'Robot kolu hücresi: eksenler, uzuvlar ve çalışma alanı',
      summary: 'Altı eksen neden gerekir, bu dersin sanal kolu neyden yapılı, TCP nedir ve kol nereye erişebilir.',
      goals: ['Seri bir kolun eklem, uzuv ve serbestlik derecesi kavramlarını açıklamak', 'Altı eksenin üç konum ve üç yönelim için gerektiğini gerekçelendirmek', 'Küresel bilek ve bilek merkezini tanımlamak', 'Aşağı bakan tutucunun belirli bir yükseklikteki yatay erişimini hesaplamak'],
      notes: `<p>Endüstriyel bir robot kolu, <b>döner eklemlerle</b> birbirine bağlanmış rijit <b>uzuvlardan</b> oluşan seri bir zincirdir. Her eklem bir motorla sürülür ve tek bir açıyla tanımlanır. Bağımsız eklem sayısı <b>serbestlik derecesidir</b> (DOF). Üç boyutta bir cismin konumu üç, yönelimi üç sayıyla anlatılır; tutucuyu <i>keyfi</i> bir konuma ve yönelime götürebilmek için en az altı eklem gerekir. Bu yüzden bu dersin kolu altı eksenlidir.</p>
<h3>Bu dersin sanal kolu</h3>
<p>Kol tamamen bu dersin modelidir; ölçüleri <code>lib/robot-kolu/kinematics.ts</code> içinde tanımlıdır ve hiçbir üreticinin ürünü değildir. Eklemlere q1 ... q6 diyoruz.</p>
<ul><li><b>q1</b>: taban, dikey eksen etrafında dönüş (sınır ±170°).</li><li><b>q2</b> ve <b>q3</b>: omuz ve dirsek, yatay eksen etrafında eğilme (−100° ... 120° ve ±150°). Uzuv uzunlukları 0,45 m ve 0,45 m; omuz tabandan 0,4 m yukarıda.</li><li><b>q4, q5, q6</b>: bilek, sırasıyla roll, pitch, roll (±180°, ±120°, ±180°). Üç eksen tek bir noktada kesişir: <b>bilek merkezi</b>. Buna <b>küresel bilek</b> denir; ters kinematiği çözülebilir kılan da budur (3. ünite).</li><li><b>TCP</b> (tool centre point): tutucunun parmak ucu merkezi. Bilek merkezinden 0,22 m ilerdedir (0,1 m flanş + 0,12 m tutucu).</li></ul>
<h3>Çerçeveler ve çalışma alanı</h3>
<p>Üç koordinat çerçevesi vardır: dünya (masa üzerinde, Z yukarı), taban ve TCP. Programdaki bütün konumlar dünya çerçevesinde metre cinsindendir; kol dururken sıfır duruşu dikey, yukarı bakar.</p>
<p>Bilek merkezi, omuzdan en çok <code>a2 + a3</code> = 0,9 m uzaklıkta olabilir; yani erişim bir küre kabuğudur. Tutucu aşağı bakıyorsa bilek merkezi TCP'nin 0,22 m üstündedir ve yatay erişim şuna iner:</p>
<div class="eq">r<sub>max</sub> = √(0,9² − (z + 0,22 − 0,4)²)</div>
<p>Parça alma yüksekliğinde (z = 0,03 m) bu yaklaşık 0,887 m eder; en uzağa 0,18 m yükseklikte erişilir (tam 0,9 m). Eklem sınırları bu kabuğu ayrıca daraltır. Hücrede alma bölgesi A ile yerleştirme bölgesi B, tabandan 0,55 m ileride ve y = ∓0,32 m'dedir; ikisi de rahatça erişim içindedir.</p>`,
      code: [fkPy('tr'), armscriptBlock('ilk', 'tr', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target')],
      lab: 'Çalışma alanı simülasyonunda TCP yüksekliğini 0,03 m\'den 0,6 m\'ye kadar değiştir ve yatay erişim halkasının dış yarıçapını izle. En geniş yarıçapı hangi yükseklikte okuyorsun? Sonra parça alma yüksekliğine (0,03 m) dön ve alma bölgesi A ile yerleştirme bölgesi B\'nin halkanın içinde kaldığını doğrula. Son olarak hedefi 0,9 m\'nin ötesine çek ve neden hiçbir yüksekliğin yetmediğini yaz.',
      pitfalls: ['"Altı eksen" ile "altı motor"u karıştırmak: eksen sayısı bağımsız eklem sayısıdır, tutucunun açılıp kapanması ayrı bir eksen olarak sayılmaz.', 'TCP\'yi flanşın merkezi sanmak: tutucu takılınca TCP flanştan 0,12 m ileri kayar ve bütün hedefler değişir.', 'Erişimi yalnızca uzuv uzunluğuna bakarak hesaplamak: eklem sınırları ve çarpışmalar gerçek erişimi küçültür.', 'Dünya çerçevesindeki yüksekliği tabana göre vermek: masa z = 0 kabul edilir, omuz 0,4 m yukarıdadır.'],
      se: `<p>Ölçüleri, eklem sınırlarını ve hız değerlerini koda gömme; tek bir <b>yapılandırma</b> dosyasında tut. Bu dersin kodunda uzuv ölçüleri tek yerde (<code>ARM</code>, <code>LIMITS</code>) tanımlıdır ve bütün testler onlara bağlıdır.</p><ul><li>Birimi adın parçası yap (metre, radyan) ve sınırda dönüştür: dışarıya derece, içeride radyan.</li><li>Bir ölçü değişince hangi testlerin kırılacağını önceden bil: erişim ve ileri kinematik testleri bu yüzden sayılarla yazılır.</li></ul>`,
      quiz: [
        { q: 'Tutucuyu uzayda istediğin konuma ve yönelime götürebilmek için en az kaç bağımsız eklem gerekir?', options: ['6: üç konum ve üç yönelim', '3: yalnız konum yeter', '4: dört boyutlu uzay için', '12: her eksen için iki'], answer: 0, why: 'Konum için üç (x, y, z), yönelim için üç (roll, pitch, yaw) serbestlik gerekir; toplam altı.' },
        { q: 'Bilek merkezi nedir?', options: ['Flanşın alt yüzeyi', 'Tabanın orta noktası', 'q4, q5 ve q6 eksenlerinin kesiştiği nokta', 'Tutucunun parmak ucu'], answer: 2, why: 'Küresel bilekte üç bilek ekseni tek noktada kesişir; ters kinematik bu noktayı konum için kullanır.' },
        { q: 'Tutucu aşağı bakarken z = 0,03 m yükseklikte TCP\'nin yatay erişimi yaklaşık kaçtır?', options: ['0,45 m', '0,89 m', '1,2 m', '1,12 m'], answer: 1, why: 'r = √(0,9² − (0,03 + 0,22 − 0,4)²) ≈ 0,887 m; bilek merkezi omuzdan en çok 0,9 m uzakta olabilir.' },
        { q: 'TCP neden önemlidir?', options: ['Motor sıcaklığını gösterir', 'Taban dönüşünü ölçer', 'Eklem sınırlarını belirler', 'Programdaki hedef konumların bağlandığı nokta: tutucu takılınca kayar'], answer: 3, why: 'Hedefler TCP için verilir; araç değişince TCP değişir ve aynı hedef için eklem açıları değişir.' },
      ],
    },
    en: {
      title: 'The robot arm cell: axes, links and workspace',
      summary: 'Why six axes, what this course\'s virtual arm is made of, what the TCP is and where the arm can reach.',
      goals: ['Explain joints, links and degrees of freedom of a serial arm', 'Justify why six axes are needed for three positions and three orientations', 'Define the spherical wrist and the wrist centre', 'Compute the horizontal reach of a downward-pointing gripper at a given height'],
      notes: `<p>An industrial robot arm is a serial chain of rigid <b>links</b> connected by <b>revolute joints</b>. Each joint is driven by a motor and described by one angle. The number of independent joints is the <b>degrees of freedom</b> (DOF). In three dimensions a body's position takes three numbers and its orientation three more; to bring the gripper to an <i>arbitrary</i> position and orientation you need at least six joints. That is why this course's arm has six axes.</p>
<h3>This course's virtual arm</h3>
<p>The arm is entirely this course's own model; its dimensions are defined in <code>lib/robot-kolu/kinematics.ts</code> and it is no manufacturer's product. We call the joints q1 ... q6.</p>
<ul><li><b>q1</b>: base, rotation about the vertical axis (limit ±170°).</li><li><b>q2</b> and <b>q3</b>: shoulder and elbow, tilting about a horizontal axis (−100° ... 120° and ±150°). The links are 0.45 m and 0.45 m long; the shoulder is 0.4 m above the base.</li><li><b>q4, q5, q6</b>: the wrist, roll, pitch, roll (±180°, ±120°, ±180°). The three axes meet at one point: the <b>wrist centre</b>. This is called a <b>spherical wrist</b>, and it is what makes inverse kinematics solvable in closed form (unit 3).</li><li><b>TCP</b> (tool centre point): the centre of the gripper's fingertips. It sits 0.22 m beyond the wrist centre (0.1 m flange + 0.12 m gripper).</li></ul>
<h3>Frames and workspace</h3>
<p>There are three coordinate frames: world (on the table, Z up), base and TCP. Every position in a program is in the world frame in metres; the arm's zero pose is vertical, pointing up.</p>
<p>The wrist centre can be at most <code>a2 + a3</code> = 0.9 m from the shoulder, so the reach is a spherical shell. With the gripper pointing down the wrist centre is 0.22 m above the TCP, and the horizontal reach becomes:</p>
<div class="eq">r<sub>max</sub> = √(0.9² − (z + 0.22 − 0.4)²)</div>
<p>At picking height (z = 0.03 m) this is about 0.887 m; the farthest reach is at a height of 0.18 m (exactly 0.9 m). Joint limits shrink this shell further. In the cell, pick area A and place area B are 0.55 m in front of the base at y = ∓0.32 m; both are comfortably inside the reach.</p>`,
      code: [fkPy('en'), armscriptBlock('ilk', 'en', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target')],
      lab: 'In the workspace simulation vary the TCP height from 0.03 m to 0.6 m and watch the outer radius of the horizontal reach ring. At which height do you read the widest radius? Then go back to picking height (0.03 m) and confirm that pick area A and place area B stay inside the ring. Finally pull the target beyond 0.9 m and write down why no height is enough.',
      pitfalls: ['Confusing "six axes" with "six motors": the axis count is the number of independent joints; opening and closing the gripper is not counted as an axis.', 'Taking the TCP to be the centre of the flange: once a gripper is fitted the TCP moves 0.12 m forward and every target changes.', 'Computing reach from link lengths alone: joint limits and collisions make the real reach smaller.', 'Giving heights relative to the base: the table is taken as z = 0 and the shoulder is 0.4 m above it.'],
      se: `<p>Do not bury dimensions, joint limits and speed values in code; keep them in one <b>configuration</b>. In this course's code the link dimensions are defined in one place (<code>ARM</code>, <code>LIMITS</code>) and every test depends on them.</p><ul><li>Make the unit part of the name (metres, radians) and convert at the boundary: degrees outside, radians inside.</li><li>Know in advance which tests break when a dimension changes: that is why the reach and forward kinematics tests are written with numbers.</li></ul>`,
      quiz: [
        { q: 'How many independent joints do you need at minimum to bring the gripper to any position and orientation?', options: ['6: three for position and three for orientation', '3: position alone is enough', '4: for four-dimensional space', '12: two per axis'], answer: 0, why: 'Position needs three (x, y, z) and orientation three (roll, pitch, yaw); six in total.' },
        { q: 'What is the wrist centre?', options: ['The underside of the flange', 'The midpoint of the base', 'The point where the q4, q5 and q6 axes meet', 'The fingertip of the gripper'], answer: 2, why: 'In a spherical wrist the three wrist axes meet at one point; inverse kinematics uses this point for position.' },
        { q: 'With the gripper pointing down at z = 0.03 m, about how far can the TCP reach horizontally?', options: ['0.45 m', '0.89 m', '1.2 m', '1.12 m'], answer: 1, why: 'r = √(0.9² − (0.03 + 0.22 − 0.4)²) ≈ 0.887 m; the wrist centre can be at most 0.9 m from the shoulder.' },
        { q: 'Why does the TCP matter?', options: ['It shows motor temperature', 'It measures base rotation', 'It sets the joint limits', 'It is the point program targets refer to: it moves when a gripper is fitted'], answer: 3, why: 'Targets are given for the TCP; when the tool changes the TCP changes and the joint angles for the same target change.' },
      ],
    },
  },
  {
    n: 2, sims: ['fk'], esofSims: ['arm'],
    related: [
      { href: '/muhendislik/robotik/hafta/7', tr: 'ESOF 323, 7. hafta: iki eklemli kolun ileri kinematiği', en: 'ESOF 323, week 7: forward kinematics of a two-link arm' },
    ],
    tr: {
      title: 'İleri kinematik: eklem açılarından TCP\'ye',
      summary: 'Dönüş matrisleri zinciri: altı eklem açısını bilerek tutucunun konumunu ve yönelimini hesapla; bir iki eklemli kolu altı eksene taşı.',
      goals: ['Z ve Y eksenleri etrafında dönüş matrislerini yazmak', 'Eklem dönüşlerini zincirleyerek TCP konumunu ve yönelimini bulmak', 'Sıfır duruşunun ve HOME duruşunun TCP konumunu elle doğrulamak', 'Bilekteki üç dönüşün tutucu yönünü nasıl belirlediğini açıklamak'],
      notes: `<p>İleri kinematik (FK) şu soruyu yanıtlar: eklem açılarını biliyorum, tutucu nerede ve nereye bakıyor? ESOF 323'te iki eklemli bir kol için <code>x = l1 cos θ1 + l2 cos(θ1 + θ2)</code> yazmıştın. Altı eksende aynı fikri, düzlem yerine <b>dönüş matrisleriyle</b> uygularız.</p>
<h3>Dönüş matrisleri</h3>
<div class="eq">R<sub>z</sub>(a) = [[cos a, −sin a, 0], [sin a, cos a, 0], [0, 0, 1]] &nbsp;&nbsp; R<sub>y</sub>(a) = [[cos a, 0, sin a], [0, 1, 0], [−sin a, 0, cos a]]</div>
<p>R<sub>y</sub>(a), Z eksenini (0, 0, 1) → (sin a, 0, cos a) noktasına götürür: pozitif q2 kolu +X yönüne yatırır. Her eklemin dönüşü, bir öncekinin çerçevesinde yapılır; bu yüzden matrisler soldan sağa çarpılır.</p>
<h3>Zincir</h3>
<div class="eq">R = R<sub>z</sub>(q1) · R<sub>y</sub>(q2) · R<sub>y</sub>(q3) · R<sub>z</sub>(q4) · R<sub>y</sub>(q5) · R<sub>z</sub>(q6)</div>
<p>Konum için uzuv vektörleri ilgili çerçevede toplanır: omuz (0, 0, 0,4); dirsek = omuz + R2·(0, 0, 0,45); bilek merkezi = dirsek + R3·(0, 0, 0,45); TCP = bilek merkezi + R6·(0, 0, 0,22). Bilekteki q4, q5, q6 <i>bilek merkezini oynatmaz</i> çünkü üç eksen ondan geçer; TCP ise bilek merkezinden R6 yönünde 0,22 m ilerdedir, yani bilek açıları aracı bilek merkezi etrafında çevirir ve yalnız q6 (araç ekseni etrafında roll) TCP'yi yerinde bırakır.</p>
<h3>Elle doğrulama</h3>
<p>Sıfır duruşunda (hepsi 0) kol dikey yukarıdır: TCP = (0, 0, 0,4 + 0,45 + 0,45 + 0,22) = (0, 0, 1,52). HOME duruşunda (q = 0°, 30°, 60°, 0°, 90°, 0°) üst kol dikeyden 30°, ön kol 90° (yatay) yatmıştır ve toplam eğim q2 + q3 + q5 = 180° olduğundan tutucu aşağı bakar: TCP = (0,675; 0; 0,570) m.</p>`,
      code: [fkPy('tr'), armscriptBlock('ilk', 'tr', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target')],
      lab: 'İleri kinematik simülasyonunda q1 ... q6 kaydırıcılarını tek tek oynat ve her birinin TCP\'yi nasıl taşıdığını yaz: hangi eklem konumu çok, hangisi yalnızca yönelimi değiştiriyor? Sonra HOME duruşuna dön ve TCP\'nin (0,675; 0; 0,570) olduğunu oku. q4, q5 ve q6\'yı sırayla oynat: okuma kutusundaki bilek merkezi yerinde kalıyor mu, TCP kalıyor mu? Yukarıdaki ESOF 323 iki eklemli kol simülasyonunda aynı mantığı düzlemde dene.',
      pitfalls: ['Matrisleri ters sırada çarpmak: her dönüş bir öncekinin çerçevesinde olduğundan sıra soldan sağadır, değişirse TCP yanlış yere gider.', 'Derece ile radyanı karıştırmak: kodda her şey radyan, kaydırıcılar derece gösterir; sınırda çevir.', 'Bilek açılarının konumu hiç etkilemediğini sanmak: bilek merkezi sabit kalır ama q4 ve q5 aracı onun etrafında çevirir, TCP 0,22 m yarıçapında oynar; yalnız q6 TCP\'yi yerinde bırakır.', 'Sıfır duruşunu "kol yatay" sanmak: bu dersin sıfır duruşu dikey, yukarıdır.'],
      se: `<p>İleri kinematik <b>saf bir işlevdir</b>: aynı girdi, aynı çıktı, yan etki yok. Bu yüzden en kolay test edilen parçadır ve sonraki her şey ona dayanır.</p><ul><li>Kapalı biçimli bilinen duruşlarla (sıfır, HOME) test et: sayıyı elle hesapla, koda güvenme.</li><li>Özellik testi ekle: uzuv uzunlukları hangi açıda olursa olsun sabit kalmalı; rastgele eklem açılarıyla bu test yazılır.</li></ul>`,
      quiz: [
        { q: 'Sıfır duruşunda (bütün eklemler 0) bu dersin kolunda TCP nerededir?', options: ['(1,52; 0; 0)', '(0; 0; 1,52)', '(0,675; 0; 0,57)', '(0; 0; 0,4)'], answer: 1, why: 'Kol dikey yukarıdır: yükseklik 0,4 + 0,45 + 0,45 + 0,22 = 1,52 m ve yatay konum 0.' },
        { q: 'Dönüş matrisleri neden zincir sırasıyla soldan sağa çarpılır?', options: ['Matris çarpımı değişmeli olduğu için fark etmez', 'Çarpım sırası hız içindir, sonucu değiştirmez', 'Bilgisayar soldan sağa okur', 'Her eklem dönüşü bir önceki eklemin çerçevesinde yapıldığı için'], answer: 3, why: 'Dönüşler değişmeli değildir; her eklem, kendinden öncekilerin oluşturduğu çerçevede döner.' },
        { q: 'Yalnız q6 değişirken TCP\'nin konumu neden değişmez?', options: ['q6 eklemi arka planda kilitlenir', 'q6 araç ekseni etrafında döndürür ve TCP bu eksenin üzerindedir', 'TCP her zaman tabanda tutulur', 'Yazılım q6\'yı yok sayar'], answer: 1, why: 'Konum = bilek merkezi + R6·(0, 0, 0,22); q6 R6\'nın üçüncü sütununu (araç eksenini) değiştirmez, bilek merkezini de oynatmaz. q4 ve q5 ise aracı bilek merkezi etrafında çevirir.' },
        { q: 'HOME duruşunda (0°, 30°, 60°, 0°, 90°, 0°) tutucu neden aşağı bakar?', options: ['q1 = 0 olduğu için', 'q4 ve q6 sıfır olduğu için', 'q2 + q3 + q5 = 180° olduğu için araç ekseni −Z\'yi gösterir', 'Tutucu hep aşağı bakar'], answer: 2, why: 'q4 = q6 = 0 iken araç ekseni (sin θ, 0, cos θ) ve θ = q2 + q3 + q5 = 180° olur; bu −Z yönüdür.' },
      ],
    },
    en: {
      title: 'Forward kinematics: from joint angles to the TCP',
      summary: 'A chain of rotation matrices: from six joint angles compute the gripper\'s position and orientation; carry a two-link arm over to six axes.',
      goals: ['Write rotation matrices about the Z and Y axes', 'Chain the joint rotations to find the TCP position and orientation', 'Check the TCP position of the zero pose and the HOME pose by hand', 'Explain how the three wrist rotations set the gripper direction'],
      notes: `<p>Forward kinematics (FK) answers: I know the joint angles, where is the gripper and where does it point? In ESOF 323 you wrote <code>x = l1 cos θ1 + l2 cos(θ1 + θ2)</code> for a two-link arm. With six axes we apply the same idea, but with <b>rotation matrices</b> instead of a plane.</p>
<h3>Rotation matrices</h3>
<div class="eq">R<sub>z</sub>(a) = [[cos a, −sin a, 0], [sin a, cos a, 0], [0, 0, 1]] &nbsp;&nbsp; R<sub>y</sub>(a) = [[cos a, 0, sin a], [0, 1, 0], [−sin a, 0, cos a]]</div>
<p>R<sub>y</sub>(a) takes the Z axis (0, 0, 1) to (sin a, 0, cos a): a positive q2 tilts the arm toward +X. Each joint's rotation happens in the frame of the previous one, which is why the matrices are multiplied from left to right.</p>
<h3>The chain</h3>
<div class="eq">R = R<sub>z</sub>(q1) · R<sub>y</sub>(q2) · R<sub>y</sub>(q3) · R<sub>z</sub>(q4) · R<sub>y</sub>(q5) · R<sub>z</sub>(q6)</div>
<p>For position the link vectors are added in the matching frame: shoulder (0, 0, 0.4); elbow = shoulder + R2·(0, 0, 0.45); wrist centre = elbow + R3·(0, 0, 0.45); TCP = wrist centre + R6·(0, 0, 0.22). The wrist angles q4, q5, q6 <i>do not move the wrist centre</i> because the three axes pass through it; the TCP is 0.22 m from the wrist centre in the direction of R6, so the wrist angles swing the tool around the wrist centre and only q6 (a roll about the tool axis) leaves the TCP where it is.</p>
<h3>Checking by hand</h3>
<p>In the zero pose (all 0) the arm points straight up: TCP = (0, 0, 0.4 + 0.45 + 0.45 + 0.22) = (0, 0, 1.52). In the HOME pose (q = 0°, 30°, 60°, 0°, 90°, 0°) the upper arm leans 30° from vertical, the forearm lies at 90° (horizontal), and because q2 + q3 + q5 = 180° the gripper points down: TCP = (0.675, 0, 0.570) m.</p>`,
      code: [fkPy('en'), armscriptBlock('ilk', 'en', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target')],
      lab: 'In the forward kinematics simulation move the q1 ... q6 sliders one at a time and write down how each moves the TCP: which joint moves the position a lot, which changes only the orientation? Then go back to the HOME pose and read that the TCP is (0.675, 0, 0.570). Move q4, q5 and q6 in turn: does the wrist centre in the readout stay put, and does the TCP? Try the same logic in a plane in the ESOF 323 two-link arm simulation above.',
      pitfalls: ['Multiplying the matrices in the wrong order: every rotation is in the previous frame, so the order is left to right, and changing it puts the TCP in the wrong place.', 'Mixing degrees and radians: the code uses radians throughout while sliders show degrees; convert at the boundary.', 'Thinking the wrist angles never affect position: the wrist centre stays put but q4 and q5 swing the tool around it, so the TCP moves on a 0.22 m radius; only q6 leaves the TCP where it is.', 'Taking the zero pose to be "arm horizontal": this course\'s zero pose is vertical, pointing up.'],
      se: `<p>Forward kinematics is a <b>pure function</b>: same input, same output, no side effects. That makes it the easiest part to test, and everything after it rests on it.</p><ul><li>Test with known poses that have closed forms (zero, HOME): compute the number by hand, do not trust the code.</li><li>Add a property test: link lengths must stay constant at any angle; this is written with random joint angles.</li></ul>`,
      quiz: [
        { q: 'In the zero pose (all joints 0) of this course\'s arm, where is the TCP?', options: ['(1.52, 0, 0)', '(0, 0, 1.52)', '(0.675, 0, 0.57)', '(0, 0, 0.4)'], answer: 1, why: 'The arm points straight up: height 0.4 + 0.45 + 0.45 + 0.22 = 1.52 m and horizontal position 0.' },
        { q: 'Why are the rotation matrices multiplied from left to right in chain order?', options: ['Matrix multiplication is commutative so it does not matter', 'The order is for speed and does not change the result', 'The computer reads left to right', 'Because each joint rotation happens in the frame of the previous joint'], answer: 3, why: 'Rotations do not commute; each joint rotates in the frame built by the ones before it.' },
        { q: 'Why does the TCP position not change when only q6 changes?', options: ['The q6 joint locks itself in the background', 'q6 rotates about the tool axis and the TCP lies on that axis', 'The TCP is always kept at the base', 'The software ignores q6'], answer: 1, why: 'Position = wrist centre + R6·(0, 0, 0.22); q6 does not change the third column of R6 (the tool axis) and does not move the wrist centre. q4 and q5, on the other hand, swing the tool around the wrist centre.' },
        { q: 'Why does the gripper point down in the HOME pose (0°, 30°, 60°, 0°, 90°, 0°)?', options: ['Because q1 = 0', 'Because q4 and q6 are zero', 'Because q2 + q3 + q5 = 180°, so the tool axis points along −Z', 'The gripper always points down'], answer: 2, why: 'With q4 = q6 = 0 the tool axis is (sin θ, 0, cos θ) with θ = q2 + q3 + q5 = 180°, which is the −Z direction.' },
      ],
    },
  },
  {
    n: 3, sims: ['ik'], esofSims: ['arm'],
    related: [
      { href: '/muhendislik/robotik/hafta/7', tr: 'ESOF 323, 7. hafta: iki eklemli kolun ters kinematiği ve çoklu çözüm', en: 'ESOF 323, week 7: inverse kinematics of a two-link arm and multiple solutions' },
    ],
    tr: {
      title: 'Ters kinematik: hedeften eklem açılarına',
      summary: 'Küresel bilekli kolda kapalı biçimli çözüm: bilek merkezi, omuz-dirsek düzlemi, bilek açıları, sekiz çözüm ve tekillikler.',
      goals: ['Konum ve yönelimi bilek merkezi ile bilek açılarına ayırmak', 'Kosinüs teoremiyle omuz ve dirsek açısını hesaplamak', 'Sekiz çözümün nereden geldiğini (omuz, dirsek, bilek) açıklamak', 'Eklem sınırları ve tekilliklerin çözümü nasıl etkilediğini yorumlamak'],
      notes: `<p>Ters kinematik (IK) ileri kinematiğin tersidir: tutucuyu şu konuma ve yönelime koymak istiyorum, eklemler kaç derece olmalı? Genel bir altı eksen için bu zordur; ama <b>küresel bilek</b> sorunu ikiye böler: önce konum (q1, q2, q3), sonra yönelim (q4, q5, q6).</p>
<h3>1. Bilek merkezi</h3>
<p>İstenen TCP konumu p ve araç ekseni (R'nin üçüncü sütunu) biliniyor. Bilek merkezi TCP'nin araç ekseni boyunca 0,22 m gerisindedir: <code>w = p − 0,22 · z<sub>araç</sub></code>. Bundan sonra yalnızca w'yi karşılayan üç eklem aranır.</p>
<h3>2. Taban, omuz ve dirsek</h3>
<p>q1 = atan2(w<sub>y</sub>, w<sub>x</sub>) kolu hedefin düzlemine çevirir. Bu düzlemde iki uzuvlu bir kol kalır; kosinüs teoremi (ESOF 323'teki gibi) dirsek açısını verir:</p>
<div class="eq">cos q3 = (r² + z² − a2² − a3²) / (2 · a2 · a3) &nbsp;&nbsp; q2 = atan2(r, z) − atan2(a3 sin q3, a2 + a3 cos q3)</div>
<p>r bilek merkezinin eksenden yatay uzaklığı, z omuza göre yüksekliğidir. |cos q3| > 1 ise hedef erişilemez. q3 için iki işaret vardır: <b>dirsek yukarı</b> (q3 &gt; 0) ve <b>dirsek aşağı</b>. Ayrıca kol hedefe sırtını dönüp q1 + 180° ile r'yi eksi alarak da ulaşabilir (<b>omuz arkada</b>).</p>
<h3>3. Bilek</h3>
<p>R03 = R<sub>z</sub>(q1)·R<sub>y</sub>(q2 + q3) bilinince bilek dönüşü R36 = R03<sup>T</sup>·R kalır. R36 = R<sub>z</sub>(q4)·R<sub>y</sub>(q5)·R<sub>z</sub>(q6) olduğundan q5 = atan2(√(R13² + R23²), R33), q4 = atan2(R23, R13), q6 = atan2(R32, −R31). Bilek de <b>ters</b> çözülebilir: (q4 + 180°, −q5, q6 + 180°) aynı yönelimi verir.</p>
<h3>Sekiz çözüm ve tekillik</h3>
<p>Omuz (2) × dirsek (2) × bilek (2) = en çok sekiz çözüm; eklem sınırları dışındakiler atılır. Genel bir duruşta bu derste sekiz çözümün hepsi sınırlar içinde kalabilir; masadaki bir alma noktasında genelde dört kalır. <b>Tekillikte</b> (q5 ≈ 0, kol tam açık ya da kapalı, bilek merkezi taban ekseninde) sonsuz çözüm vardır ya da bir eksen kaybolur: q4 ve q6 aynı dönüşü paylaşır. Kod bu durumda q4'ü bir önceki değerden alır.</p>`,
      code: [planarIkPy('tr'), fkPy('tr')],
      lab: 'Ters kinematik simülasyonunda hedefi alma bölgesine (0,55; −0,32; 0,03) koy ve çözüm sayısını oku. Çözümler arasında geçiş yap: hangileri kolu hedefin önünde, hangileri arkasında tutuyor? Hedefi tabana yaklaştır ve bir çözüm eklem sınırına çarpıp kaybolana kadar götür. Sonra hedefi 0,89 m ötesine al: kaç çözüm kalıyor? Son olarak "doğrulama" satırında FK(IK(hedef)) farkının neredeyse sıfır olduğunu gör.',
      pitfalls: ['Tek çözüm varsayıp ilkini seçmek: robot başka çözüme atlarsa eklemler büyük dönmek zorunda kalır; mevcut duruşa en yakın çözümü seç.', 'Eklem sınırlarını denetlemeden çözümü kullanmak: matematiksel olarak doğru çözüm kolun yapamayacağı bir açıda olabilir.', 'Tekilliğe yaklaşırken hızı düşünmemek: bilek tekilliğinde q4 ve q6 çok hızlı döner.', 'IK sonucunu doğrulamamak: her çözümü FK\'ya geri verip hedefle karşılaştır.'],
      se: `<p>Ters kinematik gibi türetilmiş bir algoritmayı <b>gidiş-dönüş testiyle</b> sına: rastgele sınır içi duruşlar için FK → IK → FK.</p><ul><li>Bu derste üç yüz rastgele duruş için çözümlerin hepsi aynı duruşu verir ve çözümler arasında orijinal açılar bulunur.</li><li>Sınır durumları ayrı test et: erişim dışı hedef boş liste dönmeli, tekil duruş da çözüm dönmeli.</li></ul>`,
      quiz: [
        { q: 'Küresel bilek ters kinematiği neden kolaylaştırır?', options: ['Motorlar daha güçlü olur', 'Bilek eksenlerinin kesişmesi konumu (q1–q3) ve yönelimi (q4–q6) ayırır', 'Sonsuz çözüm üretir', 'Eklem sınırlarını kaldırır'], answer: 1, why: 'Üç bilek ekseni bir noktada kesiştiği için bilek merkezi yalnızca ilk üç eklemden etkilenir; konum ve yönelim ayrı çözülür.' },
        { q: 'cos q3 > 1 çıkarsa ne anlama gelir?', options: ['Dirsek ters yöne döner', 'Hedef erişim alanının dışındadır', 'Tekilliktir', 'Bilek ters çevrilmelidir'], answer: 1, why: 'Bilek merkezi omuzdan 0,9 m\'den uzaktadır (ya da çok yakındır); iki uzuvla ulaşılamaz.' },
        { q: 'Genel bir duruş için en çok kaç ters kinematik çözümü vardır ve nereden gelir?', options: ['2: yalnız dirsek', '4: omuz ve dirsek', '8: omuz × dirsek × bilek', '16: her eklem için iki'], answer: 2, why: 'Omuz önde/arkada, dirsek yukarı/aşağı, bilek normal/ters: 2 × 2 × 2 = 8 (sınır dışındakiler elenir).' },
        { q: 'q5 ≈ 0 iken ne olur?', options: ['q4 ve q6 aynı ekseni döndürür: tekillik, q4 ayrı belirlenemez', 'Tutucu açılır', 'Çözüm sayısı ikiye katlanır', 'Kol durur'], answer: 0, why: 'Roll eksenleri aynı doğrultuya gelir; yalnız q4 + q6 belirlidir, bu yüzden kod q4\'ü bir önceki değerden alır.' },
      ],
    },
    en: {
      title: 'Inverse kinematics: from a target to joint angles',
      summary: 'The closed-form solution for an arm with a spherical wrist: wrist centre, shoulder-elbow plane, wrist angles, eight solutions and singularities.',
      goals: ['Split position and orientation into the wrist centre and the wrist angles', 'Compute the shoulder and elbow angles with the law of cosines', 'Explain where the eight solutions come from (shoulder, elbow, wrist)', 'Interpret how joint limits and singularities affect the solution'],
      notes: `<p>Inverse kinematics (IK) is the reverse of forward kinematics: I want the gripper at this position and orientation, what must the joint angles be? For a general six-axis arm this is hard; but a <b>spherical wrist</b> splits the problem in two: first position (q1, q2, q3), then orientation (q4, q5, q6).</p>
<h3>1. The wrist centre</h3>
<p>The wanted TCP position p and the tool axis (the third column of R) are known. The wrist centre lies 0.22 m behind the TCP along the tool axis: <code>w = p − 0.22 · z<sub>tool</sub></code>. From here on only the three joints that reach w are sought.</p>
<h3>2. Base, shoulder and elbow</h3>
<p>q1 = atan2(w<sub>y</sub>, w<sub>x</sub>) turns the arm into the target's plane. In that plane a two-link arm remains; the law of cosines (as in ESOF 323) gives the elbow angle:</p>
<div class="eq">cos q3 = (r² + z² − a2² − a3²) / (2 · a2 · a3) &nbsp;&nbsp; q2 = atan2(r, z) − atan2(a3 sin q3, a2 + a3 cos q3)</div>
<p>r is the horizontal distance of the wrist centre from the axis and z its height above the shoulder. If |cos q3| > 1 the target is unreachable. q3 has two signs: <b>elbow up</b> (q3 &gt; 0) and <b>elbow down</b>. The arm can also reach the target with its back turned, using q1 + 180° and a negative r (<b>shoulder behind</b>).</p>
<h3>3. The wrist</h3>
<p>Once R03 = R<sub>z</sub>(q1)·R<sub>y</sub>(q2 + q3) is known, the wrist rotation R36 = R03<sup>T</sup>·R remains. Because R36 = R<sub>z</sub>(q4)·R<sub>y</sub>(q5)·R<sub>z</sub>(q6), q5 = atan2(√(R13² + R23²), R33), q4 = atan2(R23, R13), q6 = atan2(R32, −R31). The wrist can also be <b>flipped</b>: (q4 + 180°, −q5, q6 + 180°) gives the same orientation.</p>
<h3>Eight solutions and singularities</h3>
<p>Shoulder (2) × elbow (2) × wrist (2) = at most eight solutions; those outside the joint limits are discarded. For a general pose in this course all eight can stay inside the limits; at a pick point on the table typically four remain. At a <b>singularity</b> (q5 ≈ 0, the arm fully stretched or folded, the wrist centre on the base axis) there are infinitely many solutions or an axis is lost: q4 and q6 share the same rotation. The code then takes q4 from the previous value.</p>`,
      code: [planarIkPy('en'), fkPy('en')],
      lab: 'In the inverse kinematics simulation put the target on the pick area (0.55, −0.32, 0.03) and read the number of solutions. Step through the solutions: which keep the arm in front of the target and which behind? Move the target toward the base until a solution hits a joint limit and disappears. Then move the target beyond 0.89 m: how many solutions remain? Finally see on the "verification" line that the FK(IK(target)) difference is almost zero.',
      pitfalls: ['Assuming one solution and taking the first: if the robot jumps to another solution the joints must turn a long way; pick the solution nearest to the current pose.', 'Using a solution without checking joint limits: a mathematically correct solution may need an angle the arm cannot reach.', 'Ignoring speed near a singularity: at a wrist singularity q4 and q6 turn very fast.', 'Not verifying the IK result: feed every solution back into FK and compare with the target.'],
      se: `<p>Test a derived algorithm such as inverse kinematics with a <b>round-trip test</b>: for random in-limit poses, FK → IK → FK.</p><ul><li>In this course, for three hundred random poses every solution gives the same pose and the original angles are among the solutions.</li><li>Test the edge cases separately: an unreachable target must return an empty list, and a singular pose must still return a solution.</li></ul>`,
      quiz: [
        { q: 'Why does a spherical wrist make inverse kinematics easier?', options: ['The motors are stronger', 'Because the wrist axes meet, position (q1–q3) and orientation (q4–q6) separate', 'It produces infinitely many solutions', 'It removes the joint limits'], answer: 1, why: 'Because the three wrist axes meet at one point, the wrist centre depends only on the first three joints; position and orientation are solved separately.' },
        { q: 'What does cos q3 > 1 mean?', options: ['The elbow turns the other way', 'The target is outside the workspace', 'It is a singularity', 'The wrist must be flipped'], answer: 1, why: 'The wrist centre is farther than 0.9 m from the shoulder (or too close); two links cannot reach it.' },
        { q: 'At most how many inverse kinematics solutions does a general pose have, and where do they come from?', options: ['2: the elbow only', '4: shoulder and elbow', '8: shoulder × elbow × wrist', '16: two per joint'], answer: 2, why: 'Shoulder in front/behind, elbow up/down, wrist normal/flipped: 2 × 2 × 2 = 8 (those outside the limits are dropped).' },
        { q: 'What happens when q5 ≈ 0?', options: ['q4 and q6 turn the same axis: a singularity, q4 cannot be fixed separately', 'The gripper opens', 'The number of solutions doubles', 'The arm stops'], answer: 0, why: 'The roll axes line up; only q4 + q6 is determined, which is why the code takes q4 from the previous value.' },
      ],
    },
  },
  {
    n: 4, sims: ['motion'],
    related: [
      { href: '/muhendislik/robotik/hafta/5', tr: 'ESOF 323, 5. hafta: eyleyiciler ve motor kontrolü', en: 'ESOF 323, week 5: actuators and motor control' },
    ],
    tr: {
      title: 'Eklem uzayı ve kartezyen hareket: PTP ve LIN',
      summary: 'İki nokta arasında iki yol: eklemleri eşzamanlı döndürmek (PTP) ya da TCP\'yi doğru çizgide götürmek (LIN). Yamuk hız profili, süre ve başarısızlık hâlleri.',
      goals: ['Yamuk hız profilinin süresini mesafe, hız ve ivmeden hesaplamak', 'PTP\'nin neden eşzamanlı olduğunu ve TCP izinin eğri olduğunu göstermek', 'LIN\'in neden düz çizgi verdiğini ve neden başarısız olabileceğini açıklamak', 'Bir görev için PTP ya da LIN seçmek'],
      notes: `<p>Kolu bir noktadan diğerine götürmenin iki temel yolu vardır.</p>
<h3>PTP: eklem uzayında hareket</h3>
<p>Eklemler başlangıç açılarından hedef açılara <b>eşzamanlı</b> döner: en yavaş kalan eklem süreyi belirler, hepsi aynı anda varır. Hesap ucuzdur, ters kinematik gerekmez ve eklem sınırları içinde kalmak garantidir. Bedeli: TCP'nin izi bir <b>eğridir</b>. Hücredeki A ve B noktalarının üstünde (z = 0,25 m, 0,64 m arayla) PTP, TCP'yi düz çizgiden en çok yaklaşık 8,6 cm saptırır ve yol 0,671 m olur; hareket yaklaşık 0,86 s sürer.</p>
<h3>LIN: kartezyen düz çizgi</h3>
<p>TCP, iki nokta arasında <b>düz çizgide</b> ve yönelimi düzgün dönerek gider. Her 40 ms'de çizgi üzerindeki ara duruş için ters kinematik çözülür. Aynı A–B hareketi 1,53 s sürer, çünkü kartezyen hız sınırı 0,5 m/s'dir. Bedeli: <b>başarısız olabilir</b>. Çizgi erişim alanının dışına çıkarsa ya da bilek merkezini taban ekseninden geçirirse kol yapılandırma değiştirmek zorunda kalır (iki örnek arasında 20°'den fazla sıçrama); kod bunu <code>lin-flip</code> ya da <code>unreachable</code> hatasıyla bildirir.</p>
<h3>Yamuk hız profili</h3>
<p>Hareket hızlan, sabit hızla ilerle, yavaşla biçimindedir. Mesafe d, en büyük hız v, ivme a ise: d ≥ v²/a için süre <code>T = d/v + v/a</code>; kısa mesafede tavana varılmaz ve süre <code>T = 2·√(d/a)</code> olur (üçgen profil). Bu dersin sınırları: eklem hızları 2,0; 2,0; 2,5; 3,5; 3,5; 5,0 rad/s, eklem ivmesi 6 rad/s²; TCP 0,5 m/s ve 2 m/s²; dönme 2 rad/s. <code>speed</code> komutu hepsini yüzde olarak ölçekler.</p>
<h3>Hangisini ne zaman?</h3>
<ul><li>Boşta serbest uçuş (engel yok): PTP, hızlı ve güvenli.</li><li>Parçaya dikey iniş, yapıştırma, kaynak, kesme: LIN, çünkü yol önemlidir.</li><li>Engelli hücrede serbest uçuş: ikisi de çarpışabilir; 8. ünitedeki planlayıcı.</li></ul>`,
      code: [trapezoidPy('tr'), armscriptBlock('al-birak', 'tr', 'al-bırak: serbest uçuş PTP, iniş LIN', 'pick-and-place: free flight PTP, descent LIN')],
      lab: 'Hareket simülasyonunda A ve B üstündeki iki duruşu seç. PTP ve LIN izlerini birlikte çiz; okuma kutusundaki süre, yol uzunluğu ve doğrudan sapmayı yaz. Hangisi daha hızlı, hangisi daha kısa? Sonra hızı %100\'den %25\'e düşür: süreler nasıl değişiyor? Son olarak bilek merkezinin taban ekseninden geçeceği iki nokta seç ve LIN\'in neden başarısız olduğunu oku.',
      pitfalls: ['PTP\'nin TCP\'yi düz götürdüğünü sanmak: iz bir eğridir; dar yerlerde bu çarpışma demektir.', 'Her harekete LIN kullanmak: yol önemli olmayan yerde LIN daha yavaştır ve tekilliğe takılabilir.', 'Hız yüzdesinin süreyi ters orantılı değiştirdiğini sanmak: ivme sınırı da ölçeklendiği için %25 hızda süre dört katına değil, örnekteki PTP hareketinde yaklaşık 2,8 katına çıkar; ölç.', 'Kısa hareketlerde tavan hıza çıkılacağını varsaymak: kısa mesafede profil üçgendir.'],
      se: `<p>Hareket planı bir <b>veri</b>dir: bir süre ve zamandan duruşa bir işlev. Onu hesaplayan kodla onu yürüten kodu ayır.</p><ul><li>Bu derste hareket (<code>motion.ts</code>) saf işlevdir; simülasyon yalnızca zamana göre okur. Böylece aynı hareket testte de çizimde de aynıdır.</li><li>Fiziksel sınırları (hız, ivme) testlerde doğrula: sonlu farkla hesaplanan hiçbir eklem hızı sınırı aşmamalı.</li></ul>`,
      quiz: [
        { q: 'PTP hareketinde TCP\'nin izi neden eğridir?', options: ['Motorlar düzgün çalışmaz', 'Hız sınırı yüzünden', 'Eklem açıları doğrusal değişir, TCP konumu açıların doğrusal olmayan bir işlevidir', 'Yazılım hatası'], answer: 2, why: 'Eklemler hedefe doğrudan ilerler; ileri kinematik doğrusal olmadığından TCP düz çizgiden sapar.' },
        { q: 'd = 2 m, v = 1 m/s, a = 4 m/s² için yamuk profilin süresi nedir?', options: ['2 s', '2,25 s', '3 s', '1,5 s'], answer: 1, why: 'd ≥ v²/a = 0,25 olduğundan T = d/v + v/a = 2 + 0,25 = 2,25 s.' },
        { q: 'LIN hareketi ne zaman başarısız olur?', options: ['Hız %100 iken', 'Parça tutulurken', 'Hedef çok yakınken', 'Çizgi erişim dışına çıkarsa ya da kol yapılandırma değiştirmek zorunda kalırsa'], answer: 3, why: 'Çizgi üzerindeki her noktada ters kinematik çözülür; çözüm yoksa ya da çözüm sıçrarsa hareket yapılamaz.' },
        { q: 'Parçanın üstüne dikey inerken hangi komut uygundur?', options: ['lin: yolun düz olması önemli', 'ptp: her zaman daha iyi', 'wait', 'speed'], answer: 0, why: 'Dikey inişte TCP\'nin yan sapmaması gerekir; LIN çizgiyi korur, PTP korumaz.' },
      ],
    },
    en: {
      title: 'Joint-space and Cartesian motion: PTP and LIN',
      summary: 'Two ways between two points: turning the joints together (PTP) or moving the TCP along a straight line (LIN). The trapezoidal speed profile, duration and failure cases.',
      goals: ['Compute the duration of a trapezoidal speed profile from distance, speed and acceleration', 'Show why PTP is synchronised and why the TCP path is a curve', 'Explain why LIN gives a straight line and why it can fail', 'Choose PTP or LIN for a task'],
      notes: `<p>There are two basic ways to take the arm from one point to another.</p>
<h3>PTP: motion in joint space</h3>
<p>The joints turn from their start angles to the target angles <b>together</b>: the slowest joint sets the time, and all arrive at once. The calculation is cheap, needs no inverse kinematics and is guaranteed to stay inside the joint limits. The price: the TCP path is a <b>curve</b>. Between above-A and above-B in the cell (z = 0.25 m, 0.64 m apart) PTP bends the TCP up to about 8.6 cm away from the straight line, the path is 0.671 m long, and the move takes about 0.86 s.</p>
<h3>LIN: a Cartesian straight line</h3>
<p>The TCP moves along a <b>straight line</b> between the two points while its orientation turns smoothly. Every 40 ms inverse kinematics is solved for the intermediate pose on the line. The same A to B move takes 1.53 s because the Cartesian speed limit is 0.5 m/s. The price: it <b>can fail</b>. If the line leaves the workspace or passes the wrist centre through the base axis, the arm would have to change configuration (a jump of more than 20° between two samples); the code reports this as <code>lin-flip</code> or <code>unreachable</code>.</p>
<h3>The trapezoidal speed profile</h3>
<p>Motion is: accelerate, cruise, decelerate. For distance d, top speed v and acceleration a: for d ≥ v²/a the duration is <code>T = d/v + v/a</code>; over a short distance the top speed is not reached and <code>T = 2·√(d/a)</code> (a triangular profile). This course's limits: joint speeds 2.0, 2.0, 2.5, 3.5, 3.5, 5.0 rad/s, joint acceleration 6 rad/s²; TCP 0.5 m/s and 2 m/s²; rotation 2 rad/s. The <code>speed</code> command scales them all as a percentage.</p>
<h3>Which one when?</h3>
<ul><li>Free flight with nothing in the way: PTP, fast and safe.</li><li>Vertical descent onto a part, gluing, welding, cutting: LIN, because the path matters.</li><li>Free flight in a cell with obstacles: both can collide; the planner of unit 8.</li></ul>`,
      code: [trapezoidPy('en'), armscriptBlock('al-birak', 'en', 'al-bırak: serbest uçuş PTP, iniş LIN', 'pick-and-place: free flight PTP, descent LIN')],
      lab: 'In the motion simulation choose the two poses above A and above B. Draw the PTP and LIN traces together; write down the time, path length and deviation from the line in the readout. Which is faster, which is shorter? Then lower the speed from 100% to 25%: how do the times change? Finally choose two points where the wrist centre would pass through the base axis and read why LIN fails.',
      pitfalls: ['Thinking PTP takes the TCP straight: the path is a curve; in tight places that means a collision.', 'Using LIN for every move: where the path does not matter LIN is slower and can get stuck at a singularity.', 'Thinking the speed percentage scales the time inversely: the acceleration limit scales too, so at 25% the time does not quadruple but rises about 2.8 times in the example PTP move; measure it.', 'Assuming short moves reach top speed: over a short distance the profile is triangular.'],
      se: `<p>A motion plan is <b>data</b>: a duration and a function from time to pose. Keep the code that computes it apart from the code that executes it.</p><ul><li>In this course motion (<code>motion.ts</code>) is a pure function; the simulation just reads it by time. So the same move is the same in a test and in the drawing.</li><li>Verify the physical limits in tests: no joint speed computed by finite differences may exceed the limit.</li></ul>`,
      quiz: [
        { q: 'Why is the TCP path curved in a PTP move?', options: ['The motors run unevenly', 'Because of the speed limit', 'The joint angles change linearly, and the TCP position is a non-linear function of the angles', 'A software bug'], answer: 2, why: 'The joints go straight to the target; forward kinematics is not linear, so the TCP strays from the straight line.' },
        { q: 'For d = 2 m, v = 1 m/s, a = 4 m/s², what is the duration of the trapezoidal profile?', options: ['2 s', '2.25 s', '3 s', '1.5 s'], answer: 1, why: 'Since d ≥ v²/a = 0.25, T = d/v + v/a = 2 + 0.25 = 2.25 s.' },
        { q: 'When does a LIN move fail?', options: ['At 100% speed', 'While holding a part', 'When the target is very close', 'When the line leaves the workspace or the arm would have to change configuration'], answer: 3, why: 'Inverse kinematics is solved at every point on the line; with no solution, or a jumping one, the move cannot be made.' },
        { q: 'Which command suits a vertical descent onto a part?', options: ['lin: the straight path matters', 'ptp: always better', 'wait', 'speed'], answer: 0, why: 'In a vertical descent the TCP must not drift sideways; LIN keeps the line, PTP does not.' },
      ],
    },
  },
  {
    n: 5, sims: ['pick'],
    simCfg: { pick: { size: '0.06' } },
    related: [
      { href: '/muhendislik/parca/mg996r', tr: 'Hyvex: MG996R servo', en: 'Hyvex: MG996R servo' },
      { href: '/muhendislik/robotik/proje/robot-kol', tr: 'ESOF 323 dönem projesi: robot kol', en: 'ESOF 323 term project: robot arm' },
    ],
    tr: {
      title: 'Tutucu ve al-bırak',
      summary: 'Tutucunun modeli, tutma kuralı (mesafe, açıklık, eğim), parçayı taşıma ve bırakma, al-bırak sırasının iskeleti.',
      goals: ['Tutucuyu açıklık, tutma yarıçapı ve eğim sınırıyla modellemek', 'Al-bırak sırasını (üstüne git, in, kapat, kalk, taşı, in, aç, kalk) yazmak', 'Parçanın bırakıldığı yüksekliğin neden önemli olduğunu açıklamak', 'Tutma başarısızlığını koddan okumak (holding)'],
      notes: `<p>Bir al-bırak programının en önemli kısmı hareket değil, <b>sıra</b>dır: tutucu açıkken parçanın üstüne git, dikey in, kapat, dikey kalk, taşı, dikey in, aç, dikey kalk. Dikey iniş ve kalkışlar LIN, aradaki serbest uçuş PTP (ya da engel varsa plan) olur.</p>
<h3>Tutucu modeli</h3>
<p>Bu derste tutucu üç sayıyla tanımlıdır (<code>GRIPPER</code>): en çok açıklık 0,08 m, tutma yarıçapı 0,03 m, araç ekseninin dikeyden en çok sapması 25°. <code>close</code> komutu, TCP'ye 0,03 m içinde, 0,08 m'den dar bir parça varsa ve araç aşağıya yakın bakıyorsa parçayı tutar; hiçbiri sağlanmazsa tutucu boş kapanır ve <code>holding()</code> false döner. Hata yoktur, çünkü gerçek tutucu da boş kapanabilir; program <code>holding()</code> ile kendini denetlemelidir.</p>
<h3>Taşıma ve bırakma</h3>
<p>Tutulan parça TCP'yi izler. <code>open</code> parçayı bırakır: parça TCP'nin altındaki yüzeye iner. Yüzey masa ya da altında bir parçadır; üstüne bırakılan parça altındakinin üstünde durur (0,06 m'lik üç parçayla merkez yükseklikleri 30, 90 ve 150 mm). Parça 0,03 m'den yüksekten bırakılırsa "düşürme" sayılır (<code>drops</code> istatistiği). Bu yüzden bırakma yüksekliği, parçanın merkez yüksekliğine eşit seçilir.</p>
<h3>Güvenli yaklaşma noktası</h3>
<p>Her alma ve bırakma noktasının 0,22 m kadar üstünde bir <b>yaklaşma noktası</b> tanımla. Serbest uçuş bu noktalar arasında yapılır; parçaya yalnızca dikey çizgiyle girilir ve çıkılır. Böylece kol parçaya yandan çarpmaz ve engellerin üstünden geçecek yolu planlamak kolaylaşır.</p>`,
      code: [armscriptBlock('al-birak', 'tr', 'al-bırak: serbest uçuş PTP, iniş LIN', 'pick-and-place: free flight PTP, descent LIN'), armscriptBlock('istif', 'tr', 'üç parçayı alıp üst üste dizmek', 'pick three parts and stack them')],
      lab: 'Al-bırak simülasyonunda parça boyutunu 0,06 m\'den 0,09 m\'ye çıkar: tutucu parçayı neden alamıyor? Sonra boyutu 0,06 m\'ye döndür, programı çalıştır ve okuma kutusunda tutma ve bırakma sayısını gör. Bırakma yüksekliğini koddan 0,2 m yap ve düşürme sayısının arttığını izle.',
      pitfalls: ['Parçaya yandan yaklaşmak: tutucu parçayı iter ya da çarpar; her zaman üstten dikey in.', 'holding() denetimini atlamak: boş kapanan tutucuyla taşıma sürer ve parça yerinde kalır.', 'Bırakma yüksekliğini fazla seçmek: parça düşer, konumu sapar ya da devrilir.', 'Parça boyutunu tutucu açıklığıyla karşılaştırmamak: 0,08 m\'den geniş parça tutulmaz.'],
      se: `<p>Al-bırak bir <b>durum makinesi</b>dir: açık, yaklaşıyor, iniyor, tutuyor, taşıyor, bırakıyor. Her durumda bir <b>ön koşul</b> ve bir <b>son koşul</b> vardır ("kapat" öncesi TCP parçanın yanında, sonrası <code>holding()</code> true).</p><ul><li>Son koşulu kodda denetle ve başarısızlıkta durup hata bildir; sessizce devam etme.</li><li>Parça sayısı, düşürme ve süre gibi ölçümleri her çalıştırmada kaydet: bu bitirme projesinin kabul ölçütleridir.</li></ul>`,
      quiz: [
        { q: 'Tutucu boş kapanırsa bu derste ne olur?', options: ['Yorumlayıcı hata verir', 'Kol durur', 'Hata yoktur; holding() false döner', 'Parça otomatik oluşur'], answer: 2, why: 'Gerçek tutucular da boş kapanabilir; programın holding() ile denetlemesi gerekir.' },
        { q: 'Üç parça (0,06 m) üst üste dizilirse üstteki parçanın merkez yüksekliği nedir?', options: ['30 mm', '90 mm', '120 mm', '150 mm'], answer: 3, why: 'Merkezler 30, 90, 150 mm: her parça altındakinin üstüne 60 mm çıkar.' },
        { q: 'Parçaya neden üstten dikey inilir?', options: ['Daha hızlı olduğu için', 'Yana çarpmayı ve parçayı itmeyi önlemek için', 'Eklem sınırı gerektirdiği için', 'Tutucu yalnız aşağı bakabildiği için'], answer: 1, why: 'Dikey çizgi, tutucunun parçaya yandan değmesini önler; yaklaşma ve çıkış yolu da net olur.' },
        { q: 'Bu derste tutucu hangi parçayı tutamaz?', options: ['0,05 m\'lik', '0,06 m\'lik', '0,08 m\'den geniş olan ya da tutma yarıçapının dışındaki', 'Masadaki parçaları'], answer: 2, why: 'Açıklık 0,08 m, tutma yarıçapı 0,03 m ve eğim sınırı 25°: üçü de sağlanmalı.' },
      ],
    },
    en: {
      title: 'The gripper and pick-and-place',
      summary: 'The gripper model, the grasp rule (distance, opening, tilt), carrying and releasing the part, and the skeleton of a pick-and-place sequence.',
      goals: ['Model the gripper with an opening, a grasp radius and a tilt limit', 'Write the pick-and-place sequence (go above, descend, close, lift, carry, descend, open, lift)', 'Explain why the height at which a part is released matters', 'Read a grasp failure from code (holding)'],
      notes: `<p>The most important part of a pick-and-place program is not the motion but the <b>sequence</b>: with the gripper open go above the part, descend vertically, close, lift vertically, carry, descend vertically, open, lift vertically. The vertical descents and lifts are LIN, and the free flight between them is PTP (or plan if there are obstacles).</p>
<h3>The gripper model</h3>
<p>In this course the gripper is defined by three numbers (<code>GRIPPER</code>): a maximum opening of 0.08 m, a grasp radius of 0.03 m, and a maximum tilt of the tool axis from vertical of 25°. The <code>close</code> command grasps a part if there is one within 0.03 m of the TCP that is narrower than 0.08 m and the tool points close to down; if none holds, the gripper closes empty and <code>holding()</code> returns false. There is no error, because a real gripper can close empty too; the program must check itself with <code>holding()</code>.</p>
<h3>Carrying and releasing</h3>
<p>A held part follows the TCP. <code>open</code> releases the part: it settles onto the surface below the TCP. The surface is the table or a part below; a part released on top rests on the one beneath (with three 0.06 m parts the centre heights are 30, 90 and 150 mm). If a part is released from higher than 0.03 m it counts as a "drop" (the <code>drops</code> statistic). So the release height is chosen equal to the part's centre height.</p>
<h3>A safe approach point</h3>
<p>Define an <b>approach point</b> about 0.22 m above every pick and place point. Free flight happens between these points; the part is entered and left only along a vertical line. That way the arm does not hit the part from the side and it is easier to plan a path over obstacles.</p>`,
      code: [armscriptBlock('al-birak', 'en', 'al-bırak: serbest uçuş PTP, iniş LIN', 'pick-and-place: free flight PTP, descent LIN'), armscriptBlock('istif', 'en', 'üç parçayı alıp üst üste dizmek', 'pick three parts and stack them')],
      lab: 'In the pick-and-place simulation raise the part size from 0.06 m to 0.09 m: why can the gripper not take the part? Then return the size to 0.06 m, run the program and see the grasp and release counts in the readout. Make the release height 0.2 m in the code and watch the drop count rise.',
      pitfalls: ['Approaching the part from the side: the gripper pushes or hits it; always descend from above.', 'Skipping the holding() check: with a gripper that closed empty the carry goes on and the part stays where it was.', 'Choosing too high a release height: the part drops, its position drifts or it tips over.', 'Not comparing the part size with the gripper opening: a part wider than 0.08 m cannot be gripped.'],
      se: `<p>Pick-and-place is a <b>state machine</b>: open, approaching, descending, gripping, carrying, releasing. Every state has a <b>precondition</b> and a <b>postcondition</b> (before "close" the TCP is at the part, after it <code>holding()</code> is true).</p><ul><li>Check the postcondition in code and, on failure, stop and report an error; do not carry on silently.</li><li>Record measurements such as part count, drops and time on every run: these are the acceptance criteria of the capstone.</li></ul>`,
      quiz: [
        { q: 'What happens in this course if the gripper closes empty?', options: ['The interpreter raises an error', 'The arm stops', 'No error; holding() returns false', 'A part appears automatically'], answer: 2, why: 'Real grippers can close empty too; the program has to check with holding().' },
        { q: 'If three 0.06 m parts are stacked, what is the centre height of the top part?', options: ['30 mm', '90 mm', '120 mm', '150 mm'], answer: 3, why: 'The centres are 30, 90, 150 mm: each part rises 60 mm above the one beneath.' },
        { q: 'Why is the part approached vertically from above?', options: ['It is faster', 'To avoid hitting or pushing the part sideways', 'A joint limit requires it', 'The gripper can only point down'], answer: 1, why: 'A vertical line stops the gripper touching the part from the side; the approach and exit paths are also clear.' },
        { q: 'Which part can this course\'s gripper not take?', options: ['A 0.05 m part', 'A 0.06 m part', 'One wider than 0.08 m or outside the grasp radius', 'Parts on the table'], answer: 2, why: 'Opening 0.08 m, grasp radius 0.03 m and a 25° tilt limit: all three must hold.' },
      ],
    },
  },
]
