// Robot kolu dersi üniteleri 6–10: ArmScript I ve II, çarpışmasız yörünge, hücre güvenliği, bitirme (paletleme).
// HTML iki dilde aynı etiket dizisinde. Metindeki sayılar kodla doğrulanır (facts.test.ts).
import { armscriptBlock, hostTs, rrtPy, safetyPy, segBoxPy } from './code'
import type { Unit } from './course'

export const UNITS_B: Unit[] = [
  {
    n: 6, sims: ['script'],
    simCfg: { script: { sample: 'ilk' } },
    related: [
      { href: '/muhendislik/robotik/hafta/2', tr: 'ESOF 323, 2. hafta: Arduino ile gömülü programlama (durum makinesi)', en: 'ESOF 323, week 2: embedded programming with Arduino (state machine)' },
    ],
    tr: {
      title: 'ArmScript I: kolu programlamanın temelleri',
      summary: 'Platformun kendi küçük robot dili: değişken, hedef (joints, pose), hareket komutları, döngü ve koşul. Çalıştır, 3B sahnede izle, hatayı satır numarasından oku.',
      goals: ['ArmScript\'in veri türlerini ve hedef biçimlerini (joints, pose) ayırt etmek', 'ptp, lin, open, close, wait ve speed komutlarıyla bir hareket dizisi yazmak', 'repeat, while, for ve if ile akışı denetlemek', 'Yorumlayıcının satır numaralı hata iletisini okuyup düzeltmek'],
      notes: `<p><b>ArmScript</b> bu platformun kendi robot kolu dilidir. Sözdizimi ve komutları bu ders için tasarlanmıştır; hiçbir üreticinin robot dilinden alınmadı ve onlarla uyumlu değildir. Gerçek hücrelerde de programlar çoğunlukla bir üretici diliyle yazılır; kavramlar (hedef, hareket türü, hız, tutucu, akış denetimi) aynıdır, bu yüzden buradan öğrendiğin düşünme biçimi taşınır.</p>
<h3>Program ve değerler</h3>
<p>Program satır satır okunur; <code>#</code> ile başlayan kısım yorumdur. Değerler dört türdendir: sayı, metin ("..."), doğru/yanlış ve <b>hedef</b>. İki hedef biçimi vardır:</p>
<ul><li><code>joints(q1, q2, q3, q4, q5, q6)</code>: eklem uzayında hedef, açılar <b>derece</b>.</li><li><code>pose(x, y, z)</code> ya da <code>pose(x, y, z, yaw)</code>: kartezyen hedef, metre ve derece; tutucu her zaman aşağı bakar, yaw dikey eksen etrafındaki dönüştür.</li></ul>
<p><code>var a = 3</code> değişken tanımlar; <code>a = a + 1</code> atar. Atamadan önce <code>var</code> şarttır, yoksa hata alırsın.</p>
<h3>Komutlar</h3>
<ul><li><code>ptp hedef</code> eklem uzayında, <code>lin hedef</code> kartezyen doğruyla (4. ünite), <code>plan hedef</code> çarpışmasız yolla (8. ünite) gider.</li><li><code>open</code>, <code>close</code>: tutucu (0,4 s). <code>wait s</code>: s saniye bekle. <code>speed y</code>: hız yüzdesi (1 ile 100). <code>print a, b</code>: çıktı. <code>halt</code>: programı bitir.</li></ul>
<h3>Akış denetimi</h3>
<ul><li><code>repeat n ... end</code>, <code>while koşul ... end</code>, <code>for i = 1 to 5 [step 2] ... end</code></li><li><code>if koşul ... else ... end</code>; koşullar doğru/yanlış olmak zorundadır (<code>and</code>, <code>or</code>, <code>not</code>, karşılaştırmalar). Bir sayıyı koşul olarak kullanırsan "tür hatası" alırsın; sessizce doğru sayılmaz.</li></ul>
<h3>Hata iletileri</h3>
<p>Yorumlayıcı hatayı <b>satır numarasıyla</b> verir: <code>Satır 3: hedef erişilemiyor</code>, <code>Satır 2: çarpışma</code>. Hata anına kadar yürüyen hareket sahnede kalır; böylece kolun nerede durduğunu görebilirsin.</p>`,
      code: [armscriptBlock('ilk', 'tr', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target'), armscriptBlock('hata-erisim', 'tr', 'hata: erişim dışı hedef', 'error: out-of-reach target')],
      lab: 'ArmScript simülasyonunda "ilk program"ı çalıştır ve konsoldaki iki satırı oku. Sonra programın sonuna "lin pose(0.5, -0.2, 0.3)" ekle ve çalıştır. Ardından "hata: erişim dışı hedef" örneğini seç, hatayı oku ve hedefi erişilebilir bir değere çek. Son olarak bir "repeat 3" döngüsüyle iki nokta arasında üç kez git-gel yazıp toplam süreyi konsoldan oku.',
      pitfalls: ['Eklem açısını radyan yazmak: joints() derece alır, 90 yerine 1,57 yazarsan kol neredeyse hiç dönmez.', 'var yazmadan değişkene atamak: "tanımlı değil" hatası alırsın; bu yazım yanlışlarını yakalamak için bilinçli bir kuraldır.', 'Koşul yerine sayı yazmak: "while 1" geçersizdir, "while true" ya da bir karşılaştırma yaz.', 'pose() hedefinde tutucunun hep aşağı baktığını unutmak: yatay bir tutuş için bu dil yetmez, bunun sınırını bil.'],
      se: `<p>Küçük bir dil bile <b>üç şey</b> ister: açık bir dilbilgisi, anlaşılır hata iletileri ve sınırlar. ArmScript'te dilbilgisi sözcükleme ve ayrıştırma adımlarına ayrılmıştır; hata iletisi hep satır numarası taşır.</p><ul><li>Dilin her hata kodu için bir test yazıldı: satır numarası ve iki dilde ileti.</li><li>Dil küçük tutuldu: her yeni özellik, yalıtım ve test yükünü artırır.</li></ul>`,
      quiz: [
        { q: 'joints(0, 90, 0, 0, 0, 0) hedefindeki açılar hangi birimdedir?', options: ['Radyan', 'Derece', 'Metre', 'Yüzde'], answer: 1, why: 'joints() derece alır; içeride radyana çevrilir.' },
        { q: 'pose(0.5, 0.2, 0.3) hedefinde tutucu nasıl yönelir?', options: ['Yatay, ileri', 'Yukarı', 'Aşağı bakar, yaw 0°', 'Rastgele'], answer: 2, why: 'pose() her zaman aşağı bakan bir tutucu tanımlar; dördüncü sayı yaw\'dır.' },
        { q: '"var" yazmadan x = 5 yazarsan ne olur?', options: ['"x tanımlı değil" hatası, satır numarasıyla', 'x otomatik tanımlanır', 'Program sessizce durur', 'x sıfır olur'], answer: 0, why: 'Atama yalnızca tanımlı değişkene yapılır; yazım yanlışları böyle yakalanır.' },
        { q: 'while 1 koşulu neden hata verir?', options: ['Sonsuz döngü olduğu için', 'while yasak olduğu için', 'Sayı yetmez', 'Koşul doğru/yanlış olmak zorunda: tür hatası'], answer: 3, why: 'Koşullar doğru/yanlış olmalıdır; bir sayı sessizce doğru sayılmaz.' },
      ],
    },
    en: {
      title: 'ArmScript I: the basics of programming the arm',
      summary: 'The platform\'s own small robot language: variables, targets (joints, pose), motion commands, loops and conditions. Run it, watch it in the 3D scene, read the error from its line number.',
      goals: ['Tell ArmScript\'s data types and target forms (joints, pose) apart', 'Write a motion sequence with ptp, lin, open, close, wait and speed', 'Control flow with repeat, while, for and if', 'Read and fix the interpreter\'s error message with a line number'],
      notes: `<p><b>ArmScript</b> is this platform's own robot arm language. Its syntax and commands were designed for this course; none is taken from any manufacturer's robot language and it is not compatible with them. Real cells are usually programmed in a manufacturer's language too; the concepts (target, motion type, speed, gripper, flow control) are the same, so the way of thinking you learn here carries over.</p>
<h3>Program and values</h3>
<p>The program is read line by line; anything after <code>#</code> is a comment. Values are of four kinds: number, text ("..."), true/false and <b>target</b>. There are two target forms:</p>
<ul><li><code>joints(q1, q2, q3, q4, q5, q6)</code>: a joint-space target, angles in <b>degrees</b>.</li><li><code>pose(x, y, z)</code> or <code>pose(x, y, z, yaw)</code>: a Cartesian target in metres and degrees; the gripper always points down, and yaw is the rotation about the vertical axis.</li></ul>
<p><code>var a = 3</code> declares a variable; <code>a = a + 1</code> assigns. <code>var</code> is required before assigning, otherwise you get an error.</p>
<h3>Commands</h3>
<ul><li><code>ptp target</code> moves in joint space, <code>lin target</code> along a Cartesian line (unit 4), <code>plan target</code> along a collision-free path (unit 8).</li><li><code>open</code>, <code>close</code>: the gripper (0.4 s). <code>wait s</code>: wait s seconds. <code>speed p</code>: speed percentage (1 to 100). <code>print a, b</code>: output. <code>halt</code>: end the program.</li></ul>
<h3>Flow control</h3>
<ul><li><code>repeat n ... end</code>, <code>while condition ... end</code>, <code>for i = 1 to 5 [step 2] ... end</code></li><li><code>if condition ... else ... end</code>; conditions must be true/false (<code>and</code>, <code>or</code>, <code>not</code>, comparisons). If you use a number as a condition you get a "type error"; it is not silently counted as true.</li></ul>
<h3>Error messages</h3>
<p>The interpreter gives the error with a <b>line number</b>: <code>Line 3: target is out of reach</code>, <code>Line 2: collision</code>. The motion that ran up to the moment of the error stays in the scene, so you can see where the arm stopped.</p>`,
      code: [armscriptBlock('ilk', 'en', 'ilk program: eklem ve kartezyen hedef', 'first program: joint and Cartesian target'), armscriptBlock('hata-erisim', 'en', 'hata: erişim dışı hedef', 'error: out-of-reach target')],
      lab: 'In the ArmScript simulation run the "first program" and read the two lines in the console. Then add "lin pose(0.5, -0.2, 0.3)" at the end of the program and run it. Next choose the "error: out-of-reach target" example, read the error and pull the target to a reachable value. Finally write a go-and-return between two points three times with a "repeat 3" loop and read the total time from the console.',
      pitfalls: ['Writing a joint angle in radians: joints() takes degrees, so if you write 1.57 instead of 90 the arm hardly turns.', 'Assigning to a variable without var: you get a "not defined" error; this is a deliberate rule to catch typos.', 'Writing a number instead of a condition: "while 1" is invalid, write "while true" or a comparison.', 'Forgetting that a pose() target always has the gripper pointing down: this language cannot do a horizontal grasp, so know that limit.'],
      se: `<p>Even a small language needs <b>three things</b>: a clear grammar, understandable error messages and limits. In ArmScript the grammar is split into lexing and parsing steps; the error message always carries a line number.</p><ul><li>A test was written for every error code of the language: the line number and the message in both languages.</li><li>The language was kept small: every new feature increases the isolation and testing burden.</li></ul>`,
      quiz: [
        { q: 'In which unit are the angles of the target joints(0, 90, 0, 0, 0, 0)?', options: ['Radians', 'Degrees', 'Metres', 'Percent'], answer: 1, why: 'joints() takes degrees and converts them to radians internally.' },
        { q: 'How does the gripper point at the target pose(0.5, 0.2, 0.3)?', options: ['Horizontal, forward', 'Up', 'Down, yaw 0°', 'Random'], answer: 2, why: 'pose() always describes a downward-pointing gripper; the fourth number is the yaw.' },
        { q: 'What happens if you write x = 5 without var?', options: ['A "x is not defined" error with a line number', 'x is declared automatically', 'The program stops silently', 'x becomes zero'], answer: 0, why: 'Assignment is only to a declared variable; this is how typos are caught.' },
        { q: 'Why does the condition while 1 raise an error?', options: ['It is an infinite loop', 'while is forbidden', 'A number is not enough', 'A condition must be true/false: a type error'], answer: 3, why: 'Conditions must be true/false; a number is not silently counted as true.' },
      ],
    },
  },
  {
    n: 7, sims: ['script'],
    simCfg: { script: { sample: 'istif' } },
    related: [
      { href: '/muhendislik/robotik/hafta/12', tr: 'ESOF 323, 12. hafta: ROS 2 ve simülasyon', en: 'ESOF 323, week 12: ROS 2 and simulation' },
    ],
    tr: {
      title: 'ArmScript II: yordam, sensör, hata ayıklama ve yalıtım',
      summary: 'Yordamlarla yeniden kullanım, parçaları sayan ve konumunu okuyan sensör işlevleri, print ile hata ayıklama ve programın neden tarayıcıda, sınırlı çalıştığı.',
      goals: ['proc ve call ile parametreli yordam yazmak ve yerel kapsamı kullanmak', 'items(), item_x(i), here() ve holding() ile sensör verisini okumak', 'Hata ayıklamayı print ve satır numaralı hatalarla yapmak', 'Yorumlayıcının sınırlarını ve kullanıcı kodunun sunucuda neden çalışmadığını açıklamak'],
      notes: `<h3>Yordamlar</h3>
<p>Tekrarlanan işi bir <b>yordam</b> yap: <code>proc al(x, y) ... end</code> ve <code>call al(0.55, -0.32)</code>. Yordamlar programın en üst düzeyinde tanımlanır, çağrıdan sonra da yazılabilir ve parametre alır. Yordamın <code>var</code> ile tanımladığı değişkenler <b>yereldir</b>; genel bir değişkeni yordam içinde değiştirebilirsin, ama aynı adlı parametre onu gölgeler. Yordam değer döndürmez; sonucu genel bir değişkene yazar.</p>
<h3>Sensör işlevleri</h3>
<ul><li><code>holding()</code>: tutucuda parça var mı.</li><li><code>items()</code>: hücredeki parça sayısı; <code>item_x(i)</code>, <code>item_y(i)</code>, <code>item_z(i)</code>: i. parçanın konumu (1'den başlar; tutulan parçada TCP konumu).</li><li><code>here()</code>: TCP'nin şu anki duruşu. <code>x_of(p)</code>, <code>y_of(p)</code>, <code>z_of(p)</code>, <code>offset(p, dx, dy, dz)</code>, <code>dist(a, b)</code>: hedef işlevleri.</li></ul>
<p>İstif örneği bunları birleştirir: <code>for i = 1 to items()</code> döngüsü her parçanın konumunu okur, <code>al</code> yordamıyla alır, <code>koy</code> yordamıyla üst üste dizer ve üç parçanın merkezi 30, 90, 150 mm'ye oturur.</p>
<h3>Hata ayıklama</h3>
<p>Üç araç: <code>print</code> ile ara değerleri yaz; hata iletisindeki satır numarasına git; programı küçük parçalara bölüp tek tek çalıştır. Hata anına kadar süren hareket sahnede kaldığından kolun nerede durduğu görülür.</p>
<h3>Sınırlar ve yalıtım</h3>
<p>Yorumlayıcı saf TypeScript'tir ve <b>tarayıcıda</b>, bu sayfanın içinde çalışır. Dilde dosya, ağ ya da JavaScript'e çıkış yoktur: programın çağırabileceği işlevler sabit bir listedir ve kaynak kodda <code>eval</code> ya da <code>Function</code> yoktur (bu bir testle denetlenir). Kullanıcı kodu sunucuda <b>çalışmaz</b>. Sonsuz döngüye karşı sınırlar vardır: en çok 20000 adım, 12 çağrı derinliği, 200 çıktı satırı, 600 saniye benzetim süresi, 6000 karakter ve 300 satır. Bir sınır aşılınca program hata ile durur.</p>`,
      code: [armscriptBlock('istif', 'tr', 'üç parçayı alıp üst üste dizmek', 'pick three parts and stack them'), hostTs('tr'), armscriptBlock('hata-sonsuz', 'tr', 'hata: sonsuz döngü', 'error: infinite loop')],
      lab: 'ArmScript simülasyonunda "istif" örneğini çalıştır; konsoldaki üç satırı ve sahnede üç parçanın üst üste oturduğunu gör. Sonra "hata: sonsuz döngü" örneğini çalıştır: kaç adımda durdu ve süre neden kısa? Son olarak istif örneğinde koy yordamının z hesabını 0,06\'dan 0,05\'e çevir ve parçaların nasıl yerleştiğine, düşürme sayısına bak.',
      pitfalls: ['Yordamda genel değişken yerine aynı adlı parametre kullanıp değişikliğin dışarı çıkmasını beklemek: parametre yereldir.', 'Parça sırasını sabit varsaymak: i. parçanın konumunu her seferinde item_x(i) ile oku, bir parça alındığında konumu değişir.', 'Sonsuz döngüyü "program donmuş" sanmak: sınır yalnızca hata verir, bu yüzden sınırı tasarımın bir parçası say.', 'Yalıtımı gizlilik sanmak: programlar yalnızca tarayıcıda çalışır, ama kullanıcı kendi programını görür; sır koyma.'],
      se: `<p>Kullanıcının yazdığı kodu çalıştırmak <b>güvenlik riski</b>dir. Bu ders üç önlem alır: dil JavaScript'e açılmaz, çalışma sınırlıdır ve her şey kullanıcının kendi sekmesinde olur.</p><ul><li>Kaynak koda "yasak çağrı yok" testi eklendi: <code>eval</code>, <code>Function</code>, <code>fetch</code>, <code>window</code> geçmez.</li><li>Adım, derinlik, çıktı ve süre sınırları testle sınanır; sonsuz döngü iki saniyeden kısa sürede biter.</li></ul>`,
      quiz: [
        { q: 'Yordam içinde "var y = 1" ile tanımlanan değişken nerede görünür?', options: ['Her yerde', 'Yalnızca yordamın içinde (yerel)', 'Sonraki yordamlarda', 'Hiçbir yerde'], answer: 1, why: 'var yerel kapsamda tanımlar; yordam bitince değişken yok olur.' },
        { q: 'item_x(2) neyi okur?', options: ['İkinci parçanın x konumu (tutuluyorsa TCP\'nin x\'i)', 'x ekseninin ikinci değerini', 'İkinci eklemi', 'İki parçanın uzaklığını'], answer: 0, why: 'Parça numaraları 1\'den başlar; tutulan parçada konum TCP\'yi izler.' },
        { q: 'Kullanıcı programı neden sunucuda çalıştırılmaz?', options: ['Sunucu yavaş olduğu için', 'Tarayıcı daha hızlı olduğu için', 'JavaScript yasak olduğu için', 'Güvenlik ve kaynak riskini önlemek için: tarayıcıda, sınırlı yorumlayıcıda koşar'], answer: 3, why: 'Yabancı kodu sunucuda çalıştırmak risktir; dil kapalı ve sınırlıdır, çalışma kullanıcının sekmesindedir.' },
        { q: 'Adım sınırı (20000) neden vardır?', options: ['Çok hızlı çalışmasın diye', 'Hata mesajı uzamasın diye', 'Sonsuz döngü tarayıcıyı kilitlemesin: sınır aşılınca hata verilir', 'Parça sayısını sınırlamak için'], answer: 2, why: 'Bitmeyen bir döngü hata ile durur, sekmeyi dondurmaz.' },
      ],
    },
    en: {
      title: 'ArmScript II: procedures, sensors, debugging and isolation',
      summary: 'Reuse with procedures, sensor functions that count parts and read their position, debugging with print, and why the program runs in the browser with limits.',
      goals: ['Write procedures with parameters using proc and call, and use local scope', 'Read sensor data with items(), item_x(i), here() and holding()', 'Debug with print and line-numbered errors', 'Explain the interpreter\'s limits and why user code does not run on a server'],
      notes: `<h3>Procedures</h3>
<p>Make repeated work a <b>procedure</b>: <code>proc pick(x, y) ... end</code> and <code>call pick(0.55, -0.32)</code>. Procedures are defined at the top level of the program, may be written after the call, and take parameters. Variables a procedure declares with <code>var</code> are <b>local</b>; you can change a global variable inside a procedure, but a parameter of the same name shadows it. A procedure returns no value; it writes the result to a global variable.</p>
<h3>Sensor functions</h3>
<ul><li><code>holding()</code>: is there a part in the gripper.</li><li><code>items()</code>: the number of parts in the cell; <code>item_x(i)</code>, <code>item_y(i)</code>, <code>item_z(i)</code>: the position of part i (counting from 1; for a held part, the TCP position).</li><li><code>here()</code>: the TCP's current pose. <code>x_of(p)</code>, <code>y_of(p)</code>, <code>z_of(p)</code>, <code>offset(p, dx, dy, dz)</code>, <code>dist(a, b)</code>: target functions.</li></ul>
<p>The stacking example combines these: the <code>for i = 1 to items()</code> loop reads each part's position, picks it with the <code>pick</code> procedure, stacks it with the <code>put</code> procedure, and the three parts' centres settle at 30, 90, 150 mm.</p>
<h3>Debugging</h3>
<p>Three tools: write intermediate values with <code>print</code>; go to the line number in the error message; split the program into small pieces and run them one by one. Because the motion up to the error stays in the scene, you can see where the arm stopped.</p>
<h3>Limits and isolation</h3>
<p>The interpreter is plain TypeScript and runs <b>in the browser</b>, inside this page. The language has no way out to files, the network or JavaScript: the functions a program can call are a fixed list, and the source code has no <code>eval</code> or <code>Function</code> (a test checks this). User code <b>does not run</b> on a server. There are limits against infinite loops: at most 20000 steps, a call depth of 12, 200 output lines, 600 seconds of simulated time, 6000 characters and 300 lines. When a limit is exceeded the program stops with an error.</p>`,
      code: [armscriptBlock('istif', 'en', 'üç parçayı alıp üst üste dizmek', 'pick three parts and stack them'), hostTs('en'), armscriptBlock('hata-sonsuz', 'en', 'hata: sonsuz döngü', 'error: infinite loop')],
      lab: 'In the ArmScript simulation run the "stack" example; see the three console lines and the three parts sitting on top of each other in the scene. Then run the "error: infinite loop" example: after how many steps did it stop and why is the time short? Finally change the z calculation in the put procedure of the stack example from 0.06 to 0.05 and look at how the parts settle and at the drop count.',
      pitfalls: ['Using a parameter with the same name as a global inside a procedure and expecting the change to leave it: a parameter is local.', 'Assuming a fixed part order: read the position of part i with item_x(i) each time; it changes when a part is picked.', 'Taking an infinite loop to mean "the program froze": the limit only raises an error, so treat the limit as part of the design.', 'Taking isolation to be secrecy: programs only run in the browser, but the user sees their own program; put no secrets in it.'],
      se: `<p>Running code a user wrote is a <b>security risk</b>. This course takes three measures: the language does not open onto JavaScript, execution is bounded, and everything happens in the user's own tab.</p><ul><li>A "no forbidden calls" test was added for the source: <code>eval</code>, <code>Function</code>, <code>fetch</code>, <code>window</code> do not appear.</li><li>The step, depth, output and time limits are tested; an infinite loop ends in under two seconds.</li></ul>`,
      quiz: [
        { q: 'Where is a variable declared inside a procedure with "var y = 1" visible?', options: ['Everywhere', 'Only inside the procedure (local)', 'In later procedures', 'Nowhere'], answer: 1, why: 'var declares in the local scope; the variable disappears when the procedure ends.' },
        { q: 'What does item_x(2) read?', options: ['The x position of the second part (the TCP x if it is held)', 'The second value on the x axis', 'The second joint', 'The distance between two parts'], answer: 0, why: 'Part numbers start at 1; for a held part the position follows the TCP.' },
        { q: 'Why is the user program not run on a server?', options: ['The server is slow', 'The browser is faster', 'JavaScript is forbidden', 'To avoid security and resource risk: it runs in the browser in a bounded interpreter'], answer: 3, why: 'Running foreign code on a server is risky; the language is closed and bounded and runs in the user\'s tab.' },
        { q: 'Why is there a step limit (20000)?', options: ['So it does not run too fast', 'So the error message stays short', 'So an infinite loop cannot lock the browser: exceeding it raises an error', 'To limit the part count'], answer: 2, why: 'An endless loop stops with an error and does not freeze the tab.' },
      ],
    },
  },
  {
    n: 8, sims: ['plan'],
    related: [
      { href: '/muhendislik/robotik/hafta/9', tr: 'ESOF 323, 9. hafta: ızgarada yol planlama (burada eklem uzayında RRT)', en: 'ESOF 323, week 9: grid path planning (here RRT in joint space)' },
    ],
    tr: {
      title: 'Çarpışmasız yörünge: çarpışma denetimi ve RRT ile planlama',
      summary: 'Kolu ve engelleri basit geometriyle modelle, bir duruşun çarpışıp çarpışmadığını sına ve eklem uzayında RRT-Connect ile engelin etrafından yol bul.',
      goals: ['Uzuvları kapsül, engelleri kutu olarak modelleyip çarpışmayı denetlemek', 'Konfigürasyon uzayı fikrini ve doğrudan hareketin neden çarpışabildiğini açıklamak', 'RRT-Connect algoritmasının adımlarını izlemek', 'plan komutunun sonucunu (yol, düğüm, yineleme) yorumlamak'],
      notes: `<h3>Çarpışma modeli</h3>
<p>Gerçek şekiller yerine basit geometri kullanırız. Her uzuv bir <b>kapsül</b>dür (doğru parçası + yarıçap: 0,08; 0,065; 0,055; 0,025 m), engeller <b>eksen hizalı kutulardır</b>. Kapsül–kutu testi kutuyu yarıçap kadar şişirip doğru parçasını kesiştirir (slab yöntemi). Masa ve engeller her uzuv için denetlenir, yasak bölgeler de. Hızlıdır, hafif tutucudur (kutu köşeleri yuvarlanmaz) ve gerçek bir hücrede yerini üreticinin hücre modeline bırakır.</p>
<h3>Konfigürasyon uzayı</h3>
<p>Kolun bütün durumu altı eklem açısıdır; her duruş altı boyutlu bir uzayda bir noktadır. Çarpışan duruşlar bu uzayda <b>yasak bölgeler</b> oluşturur. PTP, iki nokta arasındaki <i>doğru çizgiyi</i> bu uzayda izler; çizgi yasak bir bölgeden geçebilir. Duvarlı hücrede A'nın üstünden B'nin üstüne PTP, hareketin yaklaşık %41'inde ön koluna duvarla çarpışır; iki uç nokta ayrı ayrı çarpışmasız olduğu halde. Uç noktaları denetlemek yetmez, yolu da denetlemelisin.</p>
<h3>RRT-Connect</h3>
<p>Eklem uzayında iki ağaç büyütülür: biri başlangıçtan, biri hedeften. Her yinelemede rastgele bir duruş seçilir (yüzde 15'i doğrudan hedeftir); bir ağaç ona doğru 0,35 radyanlık bir adım atar (kenar çarpışmasızsa). Sonra öbür ağaç, yeni düğüme ulaşana ya da bir engele çarpana kadar ona doğru uzar. Ulaşırsa iki ağaç birleşmiş ve yol bulunmuştur. Ardından <b>kısayol düzleştirme</b>: iki düğüm arasındaki doğrudan kenar çarpışmasızsa aradaki düğümler atılır.</p>
<ul><li>Sonuç <b>tohumlanır</b>: aynı tohum aynı yolu verir, bu yüzden test edilebilir ve tekrar edilebilir.</li><li>Duvarlı hücrede (tohum 1) çözüm 6 yinelemede bulunur; ham yol 7, düzleştirilmiş yol 3 düğümdür.</li><li>Yol bulunamazsa <code>plan-failed</code>: bu "yol yok" demek değildir, "bütçe içinde bulunamadı" demektir (algoritma olasılıksal tamdır).</li></ul>
<p>Yol eklem uzayında bir dizi duruştur; <code>plan</code> komutu onu tek bir yamuk profille zamanlar ve sahnede oynatır. Planlanan yolda çarpışma olmadığı kare kare doğrulanır (testte).</p>`,
      code: [segBoxPy('tr'), rrtPy('tr'), armscriptBlock('duvar', 'tr', 'duvarın üstünden taşımak için plan', 'plan to carry over a wall')],
      lab: 'Planlama simülasyonunda duvar yüksekliğini 0,42 m\'de bırakıp "doğrudan PTP"yi dene: hareketin hangi oranında, hangi uzuvla çarptığını oku. Sonra "Planla"ya bas ve düğüm, yineleme, ham ve düzleştirilmiş yol sayısını yaz. Tohumu değiştir: yol farklı mı, hâlâ çarpışmasız mı? Son olarak yineleme bütçesini 2\'ye indir ve plan-failed iletisini gör.',
      pitfalls: ['Yalnızca uç noktaları denetlemek: doğrudan yol bir engelin içinden geçebilir.', 'Çarpışma modelini sonsuz hassas sanmak: kapsül ve kutu bir yaklaşıktır, gerçek hücrede güvenlik payı bırak.', 'plan-failed\'i "çözüm yok" saymak: bütçeyi artır ya da tohumu değiştir, sonra karar ver.', 'Planlı yolu zamanlamayı unutmak: eklem uzayı yolu hız ve ivme sınırlarıyla yürütülmelidir.'],
      se: `<p>Rastgele bir algoritmayı <b>tohumlayarak</b> belirlenimli yap ve özellik testleriyle sına: "yol bulunursa bütün kenarlar çarpışmasızdır", "aynı tohum aynı yol", "düzleştirme yolu uzatmaz".</p><ul><li>Bütçe bitince nedenle birlikte başarısız ol (<code>no-path</code>, <code>start-invalid</code>, <code>goal-invalid</code>); çağıran taraf farkı bilsin.</li><li>Süreyi ve düğüm sayısını raporla: planlayıcı performansı bir gereksinimdir.</li></ul>`,
      quiz: [
        { q: 'Bu derste uzuvlar çarpışma için nasıl modellenir?', options: ['Kapsül (doğru parçası + yarıçap)', 'Küre ağı', 'Üçgen ağı', 'Tek nokta'], answer: 0, why: 'Her uzuv bir doğru parçası ve yarıçaptır; engeller kutudur.' },
        { q: 'İki uç nokta çarpışmasızken PTP neden yine de çarpışabilir?', options: ['Motor hatası', 'Hız çok yüksek olduğu için', 'Tutucu açık olduğu için', 'Eklem uzayındaki doğru yol yasak bir bölgeden geçebilir'], answer: 3, why: 'Çarpışma yalnız uçlarda değil yolun her noktasında denetlenmelidir.' },
        { q: 'RRT-Connect neden iki ağaç büyütür?', options: ['Daha çok bellek kullanmak için', 'İki robotu aynı anda planlamak için', 'Biri başlangıçtan, biri hedeften büyüyüp ortada birleşerek genellikle daha hızlı bulur', 'Engelleri iki kez saymak için'], answer: 2, why: 'İki ağacın birleşmesi tek ağaçla hedefi tutturmaktan genellikle çok daha hızlıdır.' },
        { q: 'plan-failed iletisi ne demektir?', options: ['Kolun bozulduğunu', 'Duvarın çok yüksek olduğunu kesin olarak', 'Hedefin erişilemediğini', 'Bütçe içinde yol bulunamadı; yol olmadığı anlamına gelmez'], answer: 3, why: 'RRT olasılıksal tamdır: bütçe artınca ya da tohum değişince yol bulunabilir.' },
      ],
    },
    en: {
      title: 'Collision-free trajectories: collision checking and planning with RRT',
      summary: 'Model the arm and obstacles with simple geometry, test whether a pose collides, and find a path around an obstacle in joint space with RRT-Connect.',
      goals: ['Check collisions with links as capsules and obstacles as boxes', 'Explain the idea of configuration space and why a direct move can collide', 'Follow the steps of the RRT-Connect algorithm', 'Interpret the result of the plan command (path, nodes, iterations)'],
      notes: `<h3>The collision model</h3>
<p>We use simple geometry instead of real shapes. Every link is a <b>capsule</b> (a line segment plus a radius: 0.08, 0.065, 0.055, 0.025 m) and obstacles are <b>axis-aligned boxes</b>. The capsule–box test grows the box by the radius and intersects the line segment with it (the slab method). The table and obstacles are checked for every link, and so are restricted zones. It is fast, it is a light approximation (box corners are not rounded), and in a real cell it gives way to the manufacturer's cell model.</p>
<h3>Configuration space</h3>
<p>The arm's whole state is six joint angles; every pose is a point in a six-dimensional space. Colliding poses form <b>forbidden regions</b> in this space. PTP follows the <i>straight line</i> between two points in this space; the line can pass through a forbidden region. In the cell with the wall, PTP from above A to above B hits the wall with the forearm at about 41% of the motion, although both end points are collision-free on their own. Checking the end points is not enough; you must check the path.</p>
<h3>RRT-Connect</h3>
<p>Two trees grow in joint space: one from the start, one from the goal. In every iteration a random pose is chosen (15% of the time it is the goal itself); one tree takes a step of 0.35 radians toward it (if the edge is collision-free). Then the other tree keeps extending toward the new node until it reaches it or hits an obstacle. If it reaches, the trees have joined and a path is found. Then <b>shortcut smoothing</b>: if the direct edge between two nodes is collision-free, the nodes between them are dropped.</p>
<ul><li>The result is <b>seeded</b>: the same seed gives the same path, so it can be tested and repeated.</li><li>In the cell with the wall (seed 1) a solution is found in 6 iterations; the raw path has 7 nodes and the smoothed path 3.</li><li>If no path is found you get <code>plan-failed</code>: this does not mean "no path exists", it means "not found within the budget" (the algorithm is probabilistically complete).</li></ul>
<p>The path is a series of poses in joint space; the <code>plan</code> command times it with one trapezoidal profile and plays it in the scene. That the planned path has no collision is verified frame by frame (in a test).</p>`,
      code: [segBoxPy('en'), rrtPy('en'), armscriptBlock('duvar', 'en', 'duvarın üstünden taşımak için plan', 'plan to carry over a wall')],
      lab: 'In the planning simulation leave the wall height at 0.42 m and try the "direct PTP": read at which fraction of the motion and with which link it collides. Then press "Plan" and write down the node, iteration, raw and smoothed path counts. Change the seed: is the path different, and still collision-free? Finally lower the iteration budget to 2 and see the plan-failed message.',
      pitfalls: ['Checking only the end points: the direct path can pass through an obstacle.', 'Treating the collision model as infinitely accurate: capsules and boxes are an approximation; leave a safety margin in a real cell.', 'Reading plan-failed as "no solution": raise the budget or change the seed, then decide.', 'Forgetting to time the planned path: a joint-space path must be executed with speed and acceleration limits.'],
      se: `<p>Make a random algorithm deterministic by <b>seeding</b> it and test it with property tests: "if a path is found every edge is collision-free", "same seed same path", "smoothing never lengthens the path".</p><ul><li>When the budget runs out fail with a reason (<code>no-path</code>, <code>start-invalid</code>, <code>goal-invalid</code>); let the caller know the difference.</li><li>Report time and node count: planner performance is a requirement.</li></ul>`,
      quiz: [
        { q: 'How are links modelled for collisions in this course?', options: ['A capsule (line segment + radius)', 'A sphere mesh', 'A triangle mesh', 'A single point'], answer: 0, why: 'Each link is a line segment and a radius; obstacles are boxes.' },
        { q: 'Why can PTP still collide when both end points are collision-free?', options: ['Motor fault', 'Because the speed is too high', 'Because the gripper is open', 'The straight path in joint space can pass through a forbidden region'], answer: 3, why: 'Collisions must be checked not only at the ends but at every point of the path.' },
        { q: 'Why does RRT-Connect grow two trees?', options: ['To use more memory', 'To plan two robots at once', 'One grows from the start and one from the goal and they meet in the middle, usually faster', 'To count obstacles twice'], answer: 2, why: 'Joining two trees is usually much faster than hitting the goal with one tree.' },
        { q: 'What does a plan-failed message mean?', options: ['That the arm is broken', 'That the wall is certainly too high', 'That the target is unreachable', 'No path was found within the budget; it does not mean there is no path'], answer: 3, why: 'RRT is probabilistically complete: with a bigger budget or another seed a path may be found.' },
      ],
    },
  },
  {
    n: 9, sims: ['safety'],
    related: [
      { href: '/muhendislik/drone', tr: 'Drone dersi: failsafe ve güvenli durum mantığı', en: 'Drone course: failsafe and safe-state logic' },
    ],
    tr: {
      title: 'Basit hücre güvenliği: bölgeler, hız sınırı, insan yakınlığı, acil durdurma',
      summary: 'Yazılımda güvenlik katmanları: yasak bölge, elle kipinde hız tavanı, insana yaklaşınca yavaşla ve dur, mandallı acil durdurma. Ve yazılımın neden tek başına yetmediği.',
      goals: ['Yasak bölge, hız sınırı ve insan yakınlığı kurallarını yazmak', 'Hız-ve-mesafe izlemenin mantığını sayılarla açıklamak', 'Acil durdurmanın neden mandallı olduğunu ve ne zaman sıfırlanabildiğini söylemek', 'Bu dersin modelinin gerçek güvenlik sistemlerinden farkını açıklamak'],
      notes: `<p><b>Önemli:</b> bu bölüm bir öğretim modelidir. Gerçek bir robot hücresinin güvenliği, bir <b>risk değerlendirmesi</b>ne dayanır, onaylı güvenlik donanımı ve güvenlik denetleyicileri kullanır ve robot güvenliği standartlarına (örneğin ISO 10218 ailesi) uyar. Aşağıdaki sayılar bu dersin sabitleridir; hiçbir gerçek hücreye uygulanmaz.</p>
<h3>Katmanlar</h3>
<ul><li><b>Yasak bölge</b>: kolun hiçbir uzvunun girmemesi gereken kutu. Girerse program <code>zone</code> hatasıyla durur (<code>zones</code> listesi).</li><li><b>Elle kipi</b>: bir kişi hücrede ayarlama yaparken hız tavanı: ölçek 0,25.</li><li><b>İnsan yakınlığı (hız ve mesafe izleme)</b>: insanın dikey ekseni (0 ile 1,8 m) ile kolun en yakın kapsülü arasındaki uzaklık d ölçülür. d ≤ 0,8 m ise hız ölçeği 0,25'e iner (yavaşla); d ≤ 0,4 m ise ölçek 0 olur (dur).</li><li><b>Acil durdurma</b>: her şeyden önce gelir, ölçek 0.</li></ul>
<h3>Acil durdurma neden mandallı</h3>
<p>Acil durdurma basılınca <b>kalır</b>: düğmeyi bırakmak kolu çalıştırmaz. Sıfırlama bilinçli bir eylemdir ve yalnızca başka bir durdurma nedeni (insan 0,4 m içinde, kol yasak bölgede) kalmamışsa kabul edilir; yoksa kol sıfırlamayla birlikte yeniden kalkar. Kodda <code>canResetEStop</code> bunu kontrol eder.</p>
<h3>Sayıların okunuşu</h3>
<p>Yavaşlama ölçeği 0,25 ise TCP hızı 0,5 m/s yerine 0,125 m/s olur; durma mesafesi küçülür. Eşikler seçimdir: 0,8 m ve 0,4 m bu derste sabitlenmiştir. Gerçekte eşikler kolun hızından, durma süresinden ve insanın yaklaşma hızından hesaplanır.</p>
<h3>Yazılım neden yetmez</h3>
<ul><li>Güvenlik işlevleri, uygulama yazılımından <b>bağımsız</b>, onaylı donanımda çalışmalıdır: uygulama hata yapınca güvenlik de çökmemeli.</li><li>Bu dersin modeli yalnız konumları bilir; gerçek hücre ışık perdesi, alan tarayıcı ve kapı anahtarı gibi algılayıcılar kullanır.</li><li>Yasak bölge kuralı için gereken kapsül–kutu testi çarpışma testiyle aynıdır (8. ünite).</li></ul>`,
      code: [safetyPy('tr'), segBoxPy('tr')],
      lab: 'Güvenlik simülasyonunda insanı hücreye yaklaştır ve durumun "normal", "yavaş", "dur" arasında nasıl geçtiğini ve hız ölçeğini yaz. İnsanı 0,8 m ve 0,4 m eşiklerinin hemen iki yanına getirip ölçeğin sıçradığını gör. Sonra acil durdurmaya bas, insanı uzaklaştır ve sıfırla: ne zaman sıfırlama kabul ediliyor? Son olarak yasak bölgeyi aç ve kolun bölgeye girmeye çalıştığında ne olduğunu oku.',
      pitfalls: ['Acil durdurmayı "basılı tutulduğu sürece" yapmak: bırakınca kol kalkar; mandallı olmalı.', 'Güvenliği yalnızca uygulama kodunda çözmek: gerçek sistemde bağımsız, onaylı güvenlik işlevi gerekir.', 'Eşikleri kolun hızından bağımsız seçmek: hızlı bir kol 0,4 m\'de durmaya yetişmeyebilir.', 'Bu dersin sayılarını gerçek bir hücreye taşımak: bunlar öğretim sabitleridir.'],
      se: `<p>Güvenlik gereksinimleri <b>kabul testiyle</b> yazılır: "insan 0,4 m içindeyken ölçek 0", "acil durdurma sıfırlanana dek kol kalkmaz", "yasak bölgeye giren program durur".</p><ul><li>Her kural için sınır değerinin iki yanını test et (0,8 m'nin hemen içi ve dışı).</li><li>Güvenli durum (dur) varsayılan olsun: bilinmeyen bir durumda kol durur.</li></ul>`,
      quiz: [
        { q: 'İnsan kola 0,6 m uzaklıktayken hız ölçeği nedir?', options: ['1', '0,5', '0', '0,25'], answer: 3, why: '0,4 m < 0,6 m ≤ 0,8 m aralığı yavaşlama bölgesidir: ölçek 0,25.' },
        { q: 'İnsan 0,3 m uzaktayken ne olur?', options: ['Normal çalışır', 'Yavaşlar', 'Durur (ölçek 0)', 'Tutucu açılır'], answer: 2, why: 'Durdurma eşiği 0,4 m\'dir; altında ölçek 0 olur.' },
        { q: 'Acil durdurma neden mandallıdır?', options: ['Basılınca kalır; bırakmak kolu çalıştırmaz, sıfırlama bilinçli yapılır', 'Daha hızlı olduğu için', 'Pil tasarrufu için', 'Yazılım kolaylığı için'], answer: 0, why: 'Düğmeyi bırakmanın kolu yeniden başlatması tehlikelidir.' },
        { q: 'Neden yalnız uygulama yazılımıyla güvenlik yetmez?', options: ['Yazılım yavaş olduğu için', 'Kod yasak olduğu için', 'Tarayıcıda çalıştığı için', 'Güvenlik işlevi uygulamadan bağımsız, onaylı donanımda olmalıdır'], answer: 3, why: 'Uygulama hata yapınca güvenlik de çökmemelidir; gerçek hücrede bağımsız güvenlik işlevi şarttır.' },
      ],
    },
    en: {
      title: 'Simple cell safety: zones, speed limits, human proximity, emergency stop',
      summary: 'Safety layers in software: a restricted zone, a speed cap in manual mode, slowing and stopping as a person approaches, a latched emergency stop. And why software alone is not enough.',
      goals: ['Write the rules for a restricted zone, a speed limit and human proximity', 'Explain the logic of speed and separation monitoring with numbers', 'Say why the emergency stop is latched and when it can be reset', 'Explain how this course\'s model differs from real safety systems'],
      notes: `<p><b>Important:</b> this section is a teaching model. The safety of a real robot cell rests on a <b>risk assessment</b>, uses approved safety hardware and safety controllers, and follows robot safety standards (for example the ISO 10218 family). The numbers below are this course's constants; they apply to no real cell.</p>
<h3>Layers</h3>
<ul><li><b>Restricted zone</b>: a box that no link of the arm may enter. If one does, the program stops with a <code>zone</code> error (the <code>zones</code> list).</li><li><b>Manual mode</b>: a speed cap while a person is adjusting something in the cell: scale 0.25.</li><li><b>Human proximity (speed and separation monitoring)</b>: the distance d between the person's vertical axis (0 to 1.8 m) and the arm's nearest capsule is measured. If d ≤ 0.8 m the speed scale drops to 0.25 (slow); if d ≤ 0.4 m the scale becomes 0 (stop).</li><li><b>Emergency stop</b>: it comes before everything, scale 0.</li></ul>
<h3>Why the emergency stop is latched</h3>
<p>Once pressed the emergency stop <b>stays</b>: releasing the button does not run the arm. Resetting is a deliberate act and is accepted only if no other stop reason remains (a person within 0.4 m, the arm in a restricted zone); otherwise the arm would rise again with the reset. In code <code>canResetEStop</code> checks this.</p>
<h3>Reading the numbers</h3>
<p>With a slow scale of 0.25 the TCP speed is 0.125 m/s instead of 0.5 m/s; the stopping distance shrinks. The thresholds are a choice: 0.8 m and 0.4 m are fixed in this course. In reality thresholds are calculated from the arm's speed, its stopping time and how fast a person approaches.</p>
<h3>Why software is not enough</h3>
<ul><li>Safety functions must run on approved hardware <b>independent</b> of the application software: when the application makes a mistake, safety must not fail with it.</li><li>This course's model knows only positions; a real cell uses sensors such as light curtains, area scanners and door switches.</li><li>The capsule–box test needed for the restricted zone rule is the same as the collision test (unit 8).</li></ul>`,
      code: [safetyPy('en'), segBoxPy('en')],
      lab: 'In the safety simulation bring the person toward the cell and write down how the state moves between "normal", "slow" and "stop", and the speed scale. Place the person just either side of the 0.8 m and 0.4 m thresholds and see the scale jump. Then press the emergency stop, move the person away and reset: when is the reset accepted? Finally switch on the restricted zone and read what happens when the arm tries to enter it.',
      pitfalls: ['Making the emergency stop work "only while held": when released the arm rises; it must be latched.', 'Solving safety only in application code: a real system needs an independent, approved safety function.', 'Choosing thresholds independent of the arm\'s speed: a fast arm may not manage to stop within 0.4 m.', 'Carrying this course\'s numbers over to a real cell: they are teaching constants.'],
      se: `<p>Safety requirements are written as <b>acceptance tests</b>: "with a person within 0.4 m the scale is 0", "the arm does not rise until the emergency stop is reset", "a program that enters a restricted zone stops".</p><ul><li>For every rule test both sides of the limit value (just inside and just outside 0.8 m).</li><li>Make the safe state (stop) the default: in an unknown situation the arm stops.</li></ul>`,
      quiz: [
        { q: 'With a person 0.6 m from the arm, what is the speed scale?', options: ['1', '0.5', '0', '0.25'], answer: 3, why: 'The range 0.4 m < 0.6 m ≤ 0.8 m is the slow zone: scale 0.25.' },
        { q: 'What happens when the person is 0.3 m away?', options: ['It runs normally', 'It slows down', 'It stops (scale 0)', 'The gripper opens'], answer: 2, why: 'The stop threshold is 0.4 m; below it the scale is 0.' },
        { q: 'Why is the emergency stop latched?', options: ['Once pressed it stays; releasing does not run the arm, and the reset is deliberate', 'It is faster', 'To save battery', 'For software convenience'], answer: 0, why: 'It is dangerous if letting go of the button restarts the arm.' },
        { q: 'Why is application software alone not enough for safety?', options: ['Software is slow', 'Code is forbidden', 'It runs in the browser', 'A safety function must be independent of the application, on approved hardware'], answer: 3, why: 'When the application fails safety must not fail with it; a real cell needs an independent safety function.' },
      ],
    },
  },
  {
    n: 10, sims: ['script'],
    simCfg: { script: { sample: 'bitirme' } },
    related: [
      { href: '/muhendislik/robotik/proje/robot-kol', tr: 'ESOF 323 dönem projesi: robot kol (Webots)', en: 'ESOF 323 term project: robot arm (Webots)' },
      { href: '/muhendislik/drone/proje', tr: 'Drone bitirme projesi (aynı teslim düzeni)', en: 'Drone capstone (same deliverable layout)' },
    ],
    tr: {
      title: 'Bitirme hazırlığı: paletleme hücresi',
      summary: 'Bütün parçaları birleştir: ArmScript ile engelli bir hücrede parçaları alıp bir palet düzenine yerleştiren, ölçülen ve test edilen bir program.',
      goals: ['Bir hücre görevini ölçülebilir gereksinimlere çevirmek', 'Programı yordamlara bölüp plan, lin ve tutucu komutlarını birleştirmek', 'Bir programı sayılarla (süre, parça, düşürme, plan sayısı) doğrulamak', 'Sonuçları rapor ve sunuma dökmek'],
      notes: `<p>Bu ünitede yeni konu yoktur: ilk dokuz üniteyi bir <b>paletleme</b> görevinde birleştirirsin. Görev: duvarlı hücrede alma bölgesindeki üç parçayı al, duvarın üstünden ya da çevresinden taşı ve bırakma bölgesinde bir palet düzenine yerleştir.</p>
<h3>Başlangıç programı</h3>
<p>Bitirme örneği (simülasyonda "bitirme" seçeneği) <code>tasi(x, y, px, py)</code> yordamıyla bir parçayı alır ve palet noktasına koyar: <code>plan</code> ile yaklaşma noktasına, <code>lin</code> ile dikey iniş ve kalkış, <code>close</code> ve <code>open</code> ile tut ve bırak. Bir <code>for</code> döngüsü üç parçayı sırayla işler; palet noktaları <code>0,5 + 0,09·(i % 2)</code> ve <code>0,28 + 0,09·floor(i / 2)</code> ile 2x2 düzenin hücrelerinden üçünü verir.</p>
<h3>Ölçümler</h3>
<p>Programı çalıştırınca şunlar ölçülür: tutulan ve bırakılan parça sayısı (3 ve 3), düşürme (0), plan komutu sayısı (6), toplam benzetim süresi (yaklaşık 24 s) ve çıktı satırı ("parts moved: 3"). Bu sayılar bitirme projesinin kabul ölçütleridir.</p>
<h3>Genişletme fikirleri</h3>
<ul><li>Palet düzenini 3x3'e çıkar, ama hücrede yalnız üç parça olduğundan parça sayısını da artırman gerekir.</li><li>Süreyi kısalt: <code>plan</code> yerine duvar olmayan yarıda <code>ptp</code>, <code>speed</code> ayarı.</li><li>Bir yasak bölge ekle ve programın ona girmediğini göster.</li><li>Her adımda <code>holding()</code> denetle ve başarısızlıkta <code>halt</code> et.</li></ul>
<h3>Rapor</h3>
<p>Raporun bölümleri: gereksinimler, mimari (yordamlar, hareket türü seçimi), ölçümler (yukarıdaki sayılar), sınırlar (çarpışma modeli yaklaşıktır, güvenlik öğretim modelidir) ve sonraki adım. Sunumda programı canlı çalıştır ve bir hatayı bilerek üretip iletisini göster.</p>`,
      code: [armscriptBlock('bitirme', 'tr', 'paletleme: üç parçayı 2x2 düzene yerleştirmek', 'palletising: place three parts into a 2x2 layout'), armscriptBlock('duvar', 'tr', 'duvarın üstünden taşımak için plan', 'plan to carry over a wall')],
      lab: 'Simülasyonda "bitirme" örneğini çalıştır ve okuma kutusundaki sayıları kaydet: parça, düşürme, plan, süre. Sonra bir parçayı gerçekten düşür (bırakma yüksekliğini artır) ve düşürme sayısının değiştiğini kaydet. Son olarak programı değiştir: palet düzeninde üçüncü parçayı farklı bir noktaya koy ve çarpışma ya da erişim hatasına yol açan bir değer bul; iletisini rapora ekle.',
      pitfalls: ['Hepsini tek parça yazmak: yordamlara böl, her yordamı ayrı dene.', 'plan komutunu her harekete koymak: dikey inişte lin, serbest uçuşta plan ya da ptp, yolun önemi neye göre seçilir.', 'Ölçüm almadan "çalışıyor" demek: süre, parça ve düşürme sayısını her değişiklikten sonra kaydet.', 'Sınırları raporlamamak: çarpışma modeli yaklaşık, güvenlik öğretim modelidir; bunu açıkça yaz.'],
      se: `<p>Bitirme projesi bir <b>kabul testi</b> setidir: gereksinim, ölçüm, eşik. Bu dersin kodunda aynı yapı testlerde vardır: bitirme programı için "üç parça, altı plan, çarpışmasız kareler, üç farklı palet hücresi".</p><ul><li>Programı değiştirdiğinde ölçümleri yeniden al: eski sayılara güvenme.</li><li>Hata iletisi de bir çıktıdır: sunumda bilerek bir hata üretip iletisini göstermek programı anlattığını kanıtlar.</li></ul>`,
      quiz: [
        { q: 'Bitirme programında plan komutu neden kullanılır?', options: ['Daha hızlı olduğu için her zaman', 'Duvarlı hücrede serbest uçuşu çarpışmasız yapmak için', 'Tutucuyu kapatmak için', 'Hız yüzdesini ayarlamak için'], answer: 1, why: 'Duvar nedeniyle doğrudan ptp çarpışır; plan çarpışmasız yol bulur.' },
        { q: 'Dikey iniş ve kalkışlar için hangi komut seçilir?', options: ['ptp', 'plan', 'lin', 'wait'], answer: 2, why: 'Dikey çizgide yan sapma olmamalıdır.' },
        { q: 'Bitirme örneği bittiğinde okunan beklenen sayılar hangileridir?', options: ['3 parça, 3 bırakma, 0 düşürme, 6 plan', '1 parça, 6 plan', '3 parça, 12 düşürme', '0 parça, 0 plan'], answer: 0, why: 'Üç parça taşınır; her taşımada iki plan komutu vardır: 3 × 2 = 6.' },
        { q: 'Raporda hangisi mutlaka belirtilmelidir?', options: ['Yalnız çalışan sonuçlar', 'Programın uzunluğu', 'Kullanılan renkler', 'Modelin sınırları: çarpışma yaklaşıktır, güvenlik öğretim modelidir'], answer: 3, why: 'Dürüst bir rapor sınırları da söyler.' },
      ],
    },
    en: {
      title: 'Capstone preparation: a palletising cell',
      summary: 'Put it all together: an ArmScript program in a cell with obstacles that picks parts and places them in a pallet layout, measured and tested.',
      goals: ['Turn a cell task into measurable requirements', 'Split the program into procedures and combine plan, lin and gripper commands', 'Verify a program with numbers (time, parts, drops, plan count)', 'Put the results into a report and a presentation'],
      notes: `<p>There is no new topic in this unit: you combine the first nine units in a <b>palletising</b> task. The task: in the cell with the wall, take the three parts in the pick area, carry them over or around the wall and place them in a pallet layout in the place area.</p>
<h3>The starting program</h3>
<p>The capstone example (the "capstone" option in the simulation) takes a part and puts it on a pallet point with the <code>move_part(x, y, px, py)</code> procedure: <code>plan</code> to the approach point, <code>lin</code> for the vertical descent and lift, <code>close</code> and <code>open</code> to grip and release. A <code>for</code> loop processes the three parts in turn; the pallet points <code>0.5 + 0.09·(i % 2)</code> and <code>0.28 + 0.09·floor(i / 2)</code> give three cells of a 2x2 layout.</p>
<h3>Measurements</h3>
<p>When you run the program these are measured: the number of parts gripped and released (3 and 3), drops (0), the number of plan commands (6), the total simulated time (about 24 s) and the output line ("parts moved: 3"). These numbers are the capstone's acceptance criteria.</p>
<h3>Ideas for extending it</h3>
<ul><li>Make the pallet layout 3x3, but since the cell holds only three parts you also have to increase the part count.</li><li>Shorten the time: <code>ptp</code> instead of <code>plan</code> on the half without the wall, and the <code>speed</code> setting.</li><li>Add a restricted zone and show that the program does not enter it.</li><li>Check <code>holding()</code> at every step and <code>halt</code> on failure.</li></ul>
<h3>The report</h3>
<p>The sections of the report: requirements, architecture (procedures, choice of motion type), measurements (the numbers above), limits (the collision model is approximate, safety is a teaching model) and the next step. In the presentation run the program live and deliberately produce one error and show its message.</p>`,
      code: [armscriptBlock('bitirme', 'en', 'paletleme: üç parçayı 2x2 düzene yerleştirmek', 'palletising: place three parts into a 2x2 layout'), armscriptBlock('duvar', 'en', 'duvarın üstünden taşımak için plan', 'plan to carry over a wall')],
      lab: 'In the simulation run the "capstone" example and record the numbers in the readout: parts, drops, plans, time. Then really drop a part (increase the release height) and record that the drop count changes. Finally change the program: put the third part at a different point in the pallet layout and find a value that causes a collision or reach error; add its message to the report.',
      pitfalls: ['Writing it all in one piece: split it into procedures and try each procedure separately.', 'Putting the plan command on every move: lin for vertical descents, plan or ptp for free flight; choose by whether the path matters.', 'Saying "it works" without measuring: record time, parts and drop count after every change.', 'Not reporting limits: the collision model is approximate and safety is a teaching model; say so clearly.'],
      se: `<p>A capstone is a set of <b>acceptance tests</b>: requirement, measurement, threshold. In this course's code the same structure is in the tests: for the capstone program "three parts, six plans, collision-free frames, three different pallet cells".</p><ul><li>When you change the program, take the measurements again: do not trust the old numbers.</li><li>An error message is also an output: deliberately producing an error in the presentation and showing its message proves you can explain the program.</li></ul>`,
      quiz: [
        { q: 'Why is the plan command used in the capstone program?', options: ['Because it is always faster', 'To make free flight collision-free in the cell with the wall', 'To close the gripper', 'To set the speed percentage'], answer: 1, why: 'A direct ptp collides because of the wall; plan finds a collision-free path.' },
        { q: 'Which command is chosen for vertical descents and lifts?', options: ['ptp', 'plan', 'lin', 'wait'], answer: 2, why: 'On a vertical line there must be no sideways drift.' },
        { q: 'What numbers are read when the capstone example finishes?', options: ['3 parts, 3 releases, 0 drops, 6 plans', '1 part, 6 plans', '3 parts, 12 drops', '0 parts, 0 plans'], answer: 0, why: 'Three parts are moved; every move has two plan commands: 3 × 2 = 6.' },
        { q: 'What must a report state?', options: ['Only the results that work', 'The length of the program', 'The colours used', 'The limits of the model: collisions are approximate and safety is a teaching model'], answer: 3, why: 'An honest report states its limits too.' },
      ],
    },
  },
]
