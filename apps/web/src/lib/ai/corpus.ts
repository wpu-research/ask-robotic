// Küçük, elle yazılmış metin derlemleri. Dil modeli oyuncakları BU metinlerden gerçekten hesaplanır.
// Gerçek modeller milyarlarca kat daha büyük metinlerle eğitilir; buradaki amaç mekanizmayı görmektir.

/** Türkçe mini derlem (robotik cümleleri). Kelimeler ve noktalar boşlukla ayrılmıştır. */
export const CORPUS_TR = `robot ileri gider .
robot geri gider .
robot sola döner .
robot sağa döner .
robot engeli görür ve durur .
robot engeli görür ve sola döner .
robot mesafeyi ölçer ve karar verir .
sensör mesafeyi ölçer .
sensör ışığı ölçer .
sensör engeli görür .
motor tekerleği döndürür .
motor hızlı döner .
motor yavaş döner .
robot hızlı gider .
robot yavaş gider .
robot çizgiyi izler ve ileri gider .
robot çizgiyi görür ve sağa döner .
kamera görüntüyü okur .
kamera engeli görür .
program robotu yönetir .
program sensörü okur ve motoru çalıştırır .
program kararı verir .
öğrenci programı yazar .
öğrenci robotu dener .
öğrenci hatayı bulur ve programı düzeltir .
öğrenci sensörü test eder .
öğretmen öğrenciye yardım eder .
robot yola devam eder .
robot yolu görür ve ileri gider .
robot duvarı görür ve geri gider .
robot duvarı görür ve durur .
robot duvarı görür ve sağa döner .
robot çizgiyi izler .
robot engeli aşar .
sensör veriyi okur ve program kararı verir .
motor programı bekler .
robot ileri gider ve durur .
robot sağa döner ve ileri gider .
robot sola döner ve ileri gider .
robot hızlı gider ve engeli görür .`

/** İngilizce mini derlem. */
export const CORPUS_EN = `the robot moves forward .
the robot moves backward .
the robot turns left .
the robot turns right .
the sensor measures the distance .
the sensor reads the light .
the robot sees the wall and stops .
the robot sees the wall and turns left .
the program reads the sensor and runs the motor .
the student writes the program .
the student tests the robot .
the student finds the mistake and fixes the program .
the teacher helps the student .
the camera reads the image .
the motor turns the wheel .
the robot follows the line and moves forward .
the robot avoids the obstacle .
the program makes the decision .`

export const CORPUS_KARMA = `${CORPUS_TR}\n${CORPUS_EN}`

/** Benzerlik oyuncağı için kısa belgeler. */
export interface Doc { id: string; title: string; text: string }
export const DOCS_ROBOT: readonly Doc[] = [
  { id: 'd1', title: 'Servo motor', text: 'Servo motor belirli bir açıya döner ve o açıda durur.' },
  { id: 'd2', title: 'Ultrasonik sensör', text: 'Ultrasonik sensör ses dalgasının geri dönme süresinden mesafeyi hesaplar.' },
  { id: 'd3', title: 'Çizgi izleyen robot', text: 'Çizgi izleyen robot, yerdeki siyah çizgiyi kızılötesi sensörle görür ve çizgiden çıkmamaya çalışır.' },
  { id: 'd4', title: 'LED ve direnç', text: 'LED önüne akımı sınırlamak için direnç konur.' },
  { id: 'd5', title: 'Potansiyometre', text: 'Potansiyometre döndürüldükçe direnci değişen ayarlı bir dirençtir.' },
  { id: 'd6', title: 'Python ve sensör', text: 'Python ile yazılan bir program robotun sensör verisini okuyup motor hızını değiştirebilir.' },
  { id: 'd7', title: 'Yarasa', text: 'Ses dalgası havada yayılır; yarasalar yön bulmak için benzer bir yöntem kullanır.' },
  { id: 'd8', title: 'Yazı tura', text: 'Yazı tura atmak, olasılık dersinde rastgeleliği anlatmanın en basit örneğidir.' },
]

/** RAG simülatörü için kurgusal rehber. (Gerçek bir kuruluşun belgesi DEĞİLDİR; ders için uydurulmuştur.) */
export const RAG_GUIDE = `Çevrimiçi Robotik Kulübü her hafta salı akşamı saat 19.00'da buluşur. Buluşmalar bir saat sürer. Katılmak için önceden kayıt gerekmez ama yaş sınırı 13'tür. Her buluşmada önce kısa bir konu anlatılır, sonra üyeler küçük gruplara ayrılır. Gruplar en fazla dört kişiden oluşur. Proje teslimi her ayın son cuma günüdür. Geç teslim edilen projeler değerlendirmeye alınır ama rozet kazanamaz. Rozetler üç türlüdür: bronz, gümüş ve altın. Bronz rozet için en az iki proje tamamlamak gerekir. Altın rozet için bir projeyi başka bir üyeye sunmak gerekir. Kulüpte kod paylaşırken kişisel bilgi yazılmaz; ad, adres ve telefon gibi bilgiler koda konmaz. Yardım istemek için sohbet kanalındaki yardım başlığı kullanılır. Mentörler yardım isteklerine en geç iki gün içinde yanıt verir. Üye aylık duyuruları e-posta ile alır. Kulüp tatil haftalarında buluşmaz; tatil takvimi yılın başında duyurulur.`

/** Ajan simülatörü için küçük bilgi tabanı. */
export const AGENT_KB: Readonly<Record<string, string>> = {
  'üye sayısı': '24',
  'grup büyüklüğü': '4',
  'proje sayısı': '6',
  'servo açı aralığı': '0-180 derece',
  'robot hızı': '5',
}
