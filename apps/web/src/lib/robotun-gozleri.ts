// "Robotun Gözleri": çocuklar için görüntü işleme (8–12 yaş). 6 kısa ders (kamerasız da çalışır) + 10 kameralı oyun
// (yüz, el ve vücut modelleriyle; mantıkları lib/gozler-logic.ts, bileşenleri components/gozler/games*.tsx).
// Oyunlar tarayıcıda, cihaz içinde çalışan MediaPipe modelleri kullanır (dosyalar /mediapipe altından); görüntü hiçbir yere gönderilmez.

interface Text { title: string; story: string; learned: string[] }
export interface Lesson { n: number; emoji: string; color: string; tr: Text; en: Text }
export type GameKind = 'face' | 'hand' | 'body'
export interface Game { slug: 'yuz-aynasi' | 'tas-kagit-makas' | 'balon-patlat' | 'burun-avcisi' | 'agzinla-yakala' | 'kafa-pinpon' | 'parmak-hesabi' | 'sihirli-firca' | 'dogru-mu-yanlis-mi' | 'robotu-taklit-et'; kind: GameKind; emoji: string; color: string; tr: { title: string; text: string; how: string }; en: { title: string; text: string; how: string } }

export const LESSONS: Lesson[] = [
  {
    n: 1, emoji: '🟦', color: '#dbeafe',
    tr: { title: 'Resim aslında sayıdır', story: 'Robotun gözü bir kameradır. Kamera resmi küçük karelere böler: bunlara piksel denir. Robot her pikselin rengini bir sayı olarak görür. Aşağıdaki robotun çizdiği deseni, sayılara bakarak sen de boya!', learned: ['Bir resim küçük karelerden (piksellerden) oluşur.', 'Robot her pikseli bir sayı olarak görür.', 'Daha çok piksel, daha net bir resim demektir.'] },
    en: { title: 'A picture is really numbers', story: 'A robot\'s eye is a camera. The camera splits the picture into tiny squares called pixels. The robot sees the colour of each pixel as a number. Look at the numbers and paint the robot\'s pattern yourself!', learned: ['A picture is made of tiny squares (pixels).', 'A robot sees each pixel as a number.', 'More pixels means a sharper picture.'] },
  },
  {
    n: 2, emoji: '🎨', color: '#fce7f3',
    tr: { title: 'Kırmızı, yeşil, mavi', story: 'Ekranlar her rengi üç ışığı karıştırarak yapar: kırmızı, yeşil ve mavi. Her biri 0 ile 255 arasında bir sayıdır. Kaydırıcılarla robotun istediği rengi yapabilir misin?', learned: ['Her renk kırmızı, yeşil ve mavi (RGB) ışıktan karışır.', 'Üçü de 255 olursa beyaz, üçü de 0 olursa siyah olur.', 'Robot bir rengi üç sayıyla hatırlar.'] },
    en: { title: 'Red, green, blue', story: 'Screens make every colour by mixing three lights: red, green and blue. Each is a number from 0 to 255. Can you use the sliders to make the colour the robot asks for?', learned: ['Every colour is a mix of red, green and blue (RGB) light.', 'All three at 255 make white, all three at 0 make black.', 'A robot remembers a colour as three numbers.'] },
  },
  {
    n: 3, emoji: '🍎', color: '#fee2e2',
    tr: { title: 'Sadece elmayı bul', story: 'Robot masadaki elmayı bulmak istiyor. Bunun için bir kural koyar: "Rengi elmaya benziyorsa beyaz yap, benzemiyorsa siyah yap." Bu siyah beyaz resme maske denir. Kuralı öyle ayarla ki yalnız elma beyaz kalsın.', learned: ['Bir kuralla pikselleri ikiye ayırabiliriz: beyaz ya da siyah.', 'Bu siyah beyaz resme maske denir.', 'Kural çok gevşekse başka şeyler de seçilir, çok sıkıysa elma kaybolur.'] },
    en: { title: 'Find only the apple', story: 'The robot wants to find the apple on the table. It uses a rule: "If the colour looks like the apple, make it white, otherwise black." This black and white picture is called a mask. Tune the rule so only the apple stays white.', learned: ['A rule can split pixels into two groups: white or black.', 'This black and white picture is called a mask.', 'If the rule is too loose other things get picked, too strict and the apple disappears.'] },
  },
  {
    n: 4, emoji: '⚽', color: '#dcfce7',
    tr: { title: 'Top nerede?', story: 'Maskede beyaz piksellerin tam ortası, topun yeridir. Robot o noktaya bakar ve döner. Topu sürükle, robotun başını çevirip topu izlediğini gör!', learned: ['Beyaz piksellerin ortası nesnenin yeridir.', 'Nesne ortanın solundaysa robot sola, sağındaysa sağa döner.', 'Robotlar topu, insanları ve yolları böyle takip eder.'] },
    en: { title: 'Where is the ball?', story: 'The middle of the white pixels in the mask is where the ball is. The robot looks at that point and turns. Drag the ball and watch the robot turn its head to follow it!', learned: ['The middle of the white pixels is where the object is.', 'If the object is left of centre the robot turns left, if right it turns right.', 'Robots follow balls, people and roads like this.'] },
  },
  {
    n: 5, emoji: '🛣️', color: '#fef3c7',
    tr: { title: 'Kamerayla çizgi izleme', story: 'Bu robotun önünde küçük bir kamera var ve yerdeki siyah çizgiye bakıyor. Çizgi kameranın solundaysa sola, sağındaysa sağa döner. Dönüş gücünü ayarla ve robotu pistte tur attır!', learned: ['Kamera sensörden daha çok şey görür: çizginin tam yerini.', 'Robot, çizgiyi kameranın ortasında tutmaya çalışır.', 'Dönüş çok güçlüyse robot sallanır, çok zayıfsa virajda çizgiden çıkar.'] },
    en: { title: 'Following a line with a camera', story: 'This robot has a small camera looking at the black line on the floor. If the line is on the left of the camera it turns left, if on the right it turns right. Set the turning power and make the robot drive around the track!', learned: ['A camera sees more than a simple sensor: exactly where the line is.', 'The robot tries to keep the line in the middle of its camera.', 'Too much turning makes it wobble, too little and it leaves the line on bends.'] },
  },
  {
    n: 6, emoji: '🧠', color: '#ede9fe',
    tr: { title: 'Robot öğreniyor', story: 'Robota iki şeyi ayırt etmeyi öğretelim. Önce her birinden birkaç çizim göster. Sonra yeni bir çizim yap: robot, gördüğü örneklerden hangisine daha çok benzediğine bakarak tahmin eder. Ne kadar çok örnek, o kadar akıllı robot!', learned: ['Robotlar örneklerden öğrenebilir; buna makine öğrenmesi denir.', 'Robot yeni çizimi en çok benzeyen örneklerle karşılaştırır.', 'Az ya da hep aynı örnek gösterirsen robot yanılır.'] },
    en: { title: 'The robot learns', story: 'Let\'s teach the robot to tell two things apart. First show it a few drawings of each. Then make a new drawing: the robot guesses by checking which examples it looks most like. More examples make a smarter robot!', learned: ['Robots can learn from examples; this is called machine learning.', 'The robot compares a new drawing with the most similar examples.', 'With few or all-the-same examples the robot makes mistakes.'] },
  },
]

export const GAMES: Game[] = [
  {
    slug: 'yuz-aynasi', kind: 'face', emoji: '😄', color: '#fef9c3',
    tr: { title: 'Yüz Aynası', text: 'Robot yüzündeki noktaları görür ve gülüyor musun, şaşırdın mı, kızgın mısın anlar.', how: 'Robot bir yüz ifadesi ister. O ifadeyi yap ve bir saniye tut: puanı kap! Gülümse, şaşır (ağzını aç, kaşlarını kaldır), kaşlarını çatıp kızgın ol ya da göz kırp.' },
    en: { title: 'Face Mirror', text: 'The robot sees the dots on your face and knows if you are smiling, surprised or angry.', how: 'The robot asks for a face. Make it and hold it for a second to score! Smile, look surprised (open your mouth, raise your eyebrows), frown like you are angry, or wink.' },
  },
  {
    slug: 'tas-kagit-makas', kind: 'hand', emoji: '✌️', color: '#e0f2fe',
    tr: { title: 'Taş Kâğıt Makas', text: 'Robotla taş-kâğıt-makas oyna; robot elini kamerayla görür.', how: '"Oyna" düğmesine bas. 3, 2, 1 sayımı bitince elini göster: yumruk taş, açık el kâğıt, iki parmak makas. Robot da seçer, kim kazandı?' },
    en: { title: 'Rock Paper Scissors', text: 'Play rock-paper-scissors with the robot; it sees your hand through the camera.', how: 'Press "Play". When the 3, 2, 1 countdown ends, show your hand: a fist is rock, an open hand is paper, two fingers are scissors. The robot picks too. Who won?' },
  },
  {
    slug: 'balon-patlat', kind: 'body', emoji: '🎈', color: '#fce7f3',
    tr: { title: 'Balon Patlat', text: 'Bütün vücudunla oyna: ellerini sallayarak uçan balonları patlat.', how: 'Kameradan biraz uzaklaş, ellerin görünsün. Balonlar aşağıdan yükselir; ellerini balona değdir ve patlat. 45 saniyede kaç balon?' },
    en: { title: 'Balloon Pop', text: 'Play with your whole body: wave your hands to pop the floating balloons.', how: 'Step back from the camera so your hands are visible. Balloons rise from the bottom; touch them with your hands to pop them. How many in 45 seconds?' },
  },
  {
    slug: 'burun-avcisi', kind: 'face', emoji: '👃', color: '#fef3c7',
    tr: { title: 'Burun Avcısı', text: 'Robot burnunun ucunu bulur. Başını oynatarak ekrandaki yıldızları burnunla topla.', how: 'Başla\'ya bas. Ekranda yıldızlar belirir ve birkaç saniye sonra kaybolur. Başını oynatıp sarı noktayı (burnunu) yıldıza değdir. 45 saniyede kaç yıldız?' },
    en: { title: 'Nose Catcher', text: 'The robot finds the tip of your nose. Move your head to collect the stars with your nose.', how: 'Press Start. Stars appear and vanish after a few seconds. Move your head and touch them with the yellow dot (your nose). How many in 45 seconds?' },
  },
  {
    slug: 'agzinla-yakala', kind: 'face', emoji: '😋', color: '#fee2e2',
    tr: { title: 'Ağzınla Yakala', text: 'Robot ağzının açık mı kapalı mı olduğunu görür. Düşen meyveleri ağzını açarak ye.', how: 'Başla\'ya bas. Meyveler yukarıdan düşer. Başını meyvenin altına getir ve tam ağzına gelirken ağzını aç: halka yeşil olunca ağzın açıktır.' },
    en: { title: 'Catch with Your Mouth', text: 'The robot sees whether your mouth is open. Open it to eat the falling fruit.', how: 'Press Start. Fruit falls from the top. Move your head under it and open your mouth as it arrives: the ring turns green when your mouth is open.' },
  },
  {
    slug: 'kafa-pinpon', kind: 'face', emoji: '🏓', color: '#dcfce7',
    tr: { title: 'Kafa Pinpon', text: 'Raketi başınla yönet: robot yüzünün nerede olduğunu izler, raket seninle kayar.', how: 'Başla\'ya bas. Başını sağa sola oynat, alttaki raket de kayar. Topu yere düşürmeden geri vur. Üç canın var; her vuruşta top biraz hızlanır.' },
    en: { title: 'Head Pong', text: 'Steer the paddle with your head: the robot tracks where your face is and the paddle follows.', how: 'Press Start. Move your head left and right and the paddle moves too. Hit the ball back before it falls. You have three lives and the ball speeds up a little on every hit.' },
  },
  {
    slug: 'parmak-hesabi', kind: 'hand', emoji: '🖐️', color: '#ede9fe',
    tr: { title: 'Parmak Hesabı', text: 'Robot elindeki kalkık parmakları sayar. İşlemin cevabını parmaklarınla göster.', how: 'Ekranda bir toplama ya da çıkarma var, cevabı 0 ile 5 arasında. Elini kameraya göster ve cevap kadar parmağını kaldır; bir saniye tut. Yumruk sıfır demektir.' },
    en: { title: 'Finger Maths', text: 'The robot counts the fingers you hold up. Show the answer with your fingers.', how: 'There is an addition or subtraction with an answer from 0 to 5. Show your hand and hold up that many fingers for a second. A fist means zero.' },
  },
  {
    slug: 'sihirli-firca', kind: 'hand', emoji: '🪄', color: '#e0f2fe',
    tr: { title: 'Sihirli Fırça', text: 'Havada çiz! Robot işaret parmağını izler ve onun ucuyla ekrana resim yapar.', how: 'Yalnız işaret parmağını kaldır (☝️): çizer. Elini aç (✋) ve bir saniye tut: siler. Zafer işareti (✌️) rengi değiştirir. Parmağını indirince fırça kalkar.' },
    en: { title: 'Magic Brush', text: 'Draw in the air! The robot follows your index finger and paints with its tip.', how: 'Point with only your index finger (☝️) to draw. Hold an open hand (✋) for a second to clear. A peace sign (✌️) changes the colour. Lower your finger to lift the brush.' },
  },
  {
    slug: 'dogru-mu-yanlis-mi', kind: 'hand', emoji: '👍', color: '#fce7f3',
    tr: { title: 'Doğru mu Yanlış mı?', text: 'Robot başparmağını görür. Görüntü işleme hakkındaki 10 ifadeyi başparmağınla yanıtla.', how: 'İfadeyi oku. Doğruysa başparmağını yukarı (👍), yanlışsa aşağı (👎) göster ve bir an tut. Robot cevabını kontrol eder ve sıradaki ifadeye geçer.' },
    en: { title: 'True or False?', text: 'The robot sees your thumb. Answer 10 statements about computer vision with a thumbs up or down.', how: 'Read the statement. Show a thumbs up (👍) if it is true and a thumbs down (👎) if it is false, and hold it for a moment. The robot checks and moves on.' },
  },
  {
    slug: 'robotu-taklit-et', kind: 'body', emoji: '🤖', color: '#fef9c3',
    tr: { title: 'Robotu Taklit Et', text: 'Robot bir poz yapar, sen de aynısını yap: robot kollarının ve ellerinin yerini görür.', how: 'Kameradan biraz uzaklaş, omuzların ve ellerin görünsün. Başla\'ya bas. Robotun istediği pozu (iki el yukarı, uçak, sağ ya da sol el yukarı) bir saniye tut. 45 saniyede kaç poz?' },
    en: { title: 'Copy the Robot', text: 'The robot strikes a pose and you copy it: it sees where your arms and hands are.', how: 'Step back so your shoulders and hands are visible. Press Start. Hold the pose the robot asks for (both hands up, plane, right or left hand up) for a second. How many poses in 45 seconds?' },
  },
]

export const lessonOf = (n: number) => LESSONS.find((l) => l.n === n)
export const GAME_KIND_LABEL: Record<GameKind, { tr: string; en: string }> = { face: { tr: 'Yüz', en: 'Face' }, hand: { tr: 'El', en: 'Hand' }, body: { tr: 'Vücut', en: 'Body' } }
export const gameOf = (slug: string) => GAMES.find((g) => g.slug === slug)
