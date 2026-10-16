// Yasal metin TASLAKLARI. Hukukçu onayı olmadan yayımlanmamalı. Köşeli parantezli alanlar (ör. [ŞİRKET UNVANI])
// şirket bilgileriyle doldurulmalı. Fiyat ve planlar lib/pricing.ts'ten gelir (yer tutucu).
import { FAMILY_SIZE, TRIAL_DAYS } from '@/lib/pricing'

export interface LegalDoc { title: string; sections: { h: string; p: string[] }[] }

const SATICI = [
  'Unvan: [ŞİRKET UNVANI]',
  'Adres: [ADRES]',
  'MERSİS / Vergi No: [MERSİS NO] / [VERGİ DAİRESİ – NO]',
  'E-posta: [DESTEK E-POSTASI] · KEP: [KEP ADRESİ]',
]

export const LEGAL: Record<string, LegalDoc> = {
  'mesafeli-satis': {
    title: 'Mesafeli Satış Sözleşmesi',
    sections: [
      { h: '1. Taraflar', p: ['SATICI: ' + SATICI.join(' · '), 'ALICI: Platformda hesap açarak satın alma yapan kişi; bilgileri hesap kaydındaki ad ve e-postadır.'] },
      { h: '2. Konu', p: ['Bu sözleşme, ALICI\'nın MacademiaX çevrim içi öğrenme platformunda elektronik ortamda satın aldığı Premium ya da Aile üyeliğinin (dijital hizmet) satışı ve ifasına ilişkin tarafların hak ve yükümlülüklerini 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca düzenler.'] },
      { h: '3. Hizmet, bedel ve ödeme', p: [
        'Hizmetin türü, süresi (1 ay ya da 12 ay) ve KDV dahil toplam bedeli ödeme sayfasında ve Ön Bilgilendirme Formu\'nda gösterilir.',
        'Ödeme, ödeme kuruluşu (ör. iyzico) aracılığıyla tek seferde alınır. Üyelik ön ödemelidir: süre bitiminde otomatik yenileme ve karttan otomatik çekim yapılmaz.',
        `Aile üyeliği, ALICI dahil en fazla ${FAMILY_SIZE} hesabın Premium özelliklerini kullanmasını sağlar.`,
      ] },
      { h: '4. İfa', p: ['Hizmet, ödemenin ödeme kuruluşunca onaylanmasıyla derhal ALICI\'nın hesabında etkinleştirilir. Yeni dönem, varsa süren üyeliğin bitiş tarihinden itibaren eklenir.'] },
      { h: '5. Cayma hakkı', p: ['Cayma hakkı ve istisnaları İade ve İptal Koşulları\'nda açıklanmıştır. ALICI, ödeme sırasında dijital hizmetin hemen sunulmasına onay verdiğini ve bu durumda cayma hakkının Yönetmelik md. 15/1-(ğ) kapsamında sınırlanabileceğini bildiğini kabul eder. [HUKUKÇU: istisnanın uygulanıp uygulanmayacağı ve kullanılmamış süre için kısmi iade politikası netleşmeli.]'] },
      { h: '6. Ücretsiz deneme', p: [`Kartsız ${TRIAL_DAYS} günlük deneme ücretsizdir, kullanıcı başına bir kez verilir ve süre bitince kendiliğinden sona erer; bir satış sözleşmesi doğurmaz.`] },
      { h: '7. Uyuşmazlık', p: ['Uyuşmazlıklarda, Ticaret Bakanlığınca ilan edilen parasal sınırlar dahilinde ALICI\'nın yerleşim yerindeki ya da işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri, sınırları aşan durumlarda Tüketici Mahkemeleri yetkilidir.'] },
      { h: '8. Yürürlük', p: ['ALICI, ödeme sayfasındaki onay kutusunu işaretleyip ödemeyi tamamladığında bu sözleşmenin tüm koşullarını kabul etmiş sayılır. Sözleşme elektronik ortamda saklanır ve ALICI\'ya e-postayla iletilir. [YAPILACAK: sözleşme ve fatura e-postası.]'] },
    ],
  },
  'on-bilgilendirme': {
    title: 'Ön Bilgilendirme Formu',
    sections: [
      { h: '1. Satıcı', p: SATICI },
      { h: '2. Hizmetin temel nitelikleri', p: ['MacademiaX Premium / Aile: robotik, elektronik ve yapay zekâ derslerine sınırsız erişim, Mac AI öğretmen, kişisel pratik, reklamsız kullanım. Hizmet tamamen çevrim içi sunulur, fiziksel teslimat yoktur.'] },
      { h: '3. Fiyat', p: ['Seçilen plan ve dönemin KDV dahil toplam bedeli ödeme sayfasında gösterilir. Ek ücret (kargo vb.) yoktur.'] },
      { h: '4. Ödeme ve ifa', p: ['Tek seferlik ödeme; ödeme onaylandığında hizmet derhal hesapta etkinleşir. Otomatik yenileme yoktur.'] },
      { h: '5. Cayma hakkı', p: ['Tüketici, 14 gün içinde gerekçe göstermeksizin cayma hakkına sahiptir; ancak elektronik ortamda anında ifa edilen hizmetlerde, tüketicinin onayıyla ifaya başlanmışsa cayma hakkı kullanılamayabilir (Yönetmelik md. 15/1-ğ). Ayrıntı: İade ve İptal Koşulları.'] },
      { h: '6. Şikâyet ve başvuru', p: ['Talep ve şikâyetler için [DESTEK E-POSTASI]. Tüketici Hakem Heyeti ve Tüketici Mahkemesine başvuru hakkı saklıdır.'] },
    ],
  },
  'iade-iptal': {
    title: 'İade ve İptal Koşulları',
    sections: [
      { h: 'Otomatik yenileme yok', p: ['Üyelikler ön ödemelidir. Süre bitince Premium kendiliğinden ücretsiz plana döner; iptal etmen gereken bir abonelik yoktur.'] },
      { h: 'Ücretsiz deneme', p: [`${TRIAL_DAYS} günlük deneme kart istemez ve hiçbir ücret doğurmaz.`] },
      { h: 'Cayma hakkı', p: [
        'Satın alma tarihinden itibaren 14 gün içinde [DESTEK E-POSTASI] adresine yazarak cayma hakkını kullanabilirsin.',
        'Dijital hizmetin hemen sunulmasına onay verip hizmeti kullanmaya başladıysan cayma hakkı mevzuat gereği sınırlanabilir. [HUKUKÇU/İŞ KARARI: hiç kullanılmamış üyeliklerde tam iade; kullanılmışsa kalan süre için kısmi iade uygulanıp uygulanmayacağı.]',
      ] },
      { h: 'İade süreci', p: ['Onaylanan iadeler, ödemenin yapıldığı karta ödeme kuruluşu aracılığıyla [X] iş günü içinde yapılır; bankanın yansıtma süresi değişebilir. İade edilen dönem hesabından düşülür.'] },
      { h: 'Hesap silme', p: ['Hesabını silersen kalan Premium süresi iade edilmez; iade istiyorsan silmeden önce bize yaz.'] },
    ],
  },
  'kvkk-aydinlatma': {
    title: 'KVKK Aydınlatma Metni',
    sections: [
      { h: 'Veri sorumlusu', p: ['6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca veri sorumlusu: ' + SATICI.join(' · '), 'Okul hesaplarında veri sorumlusu okul, biz veri işleyeniz; okulun aydınlatma metni geçerlidir.'] },
      { h: 'İşlenen veriler', p: ['Kimlik/iletişim: ad, e-posta ya da kullanıcı adı, doğum yılı. Öğrenme: ders ilerlemesi, XP, cevaplar, AI öğretmen sohbetleri. İşlem: plan, ödeme tutarı ve durumu (kart bilgisi bize ulaşmaz; ödeme kuruluşunda işlenir). Teknik: oturum kaydı, onay verdiysen anonim kullanım olayları.'] },
      { h: 'Amaçlar ve hukuki sebepler', p: ['Hizmetin sunulması ve üyeliğin yürütülmesi (sözleşmenin ifası, md. 5/2-c); yasal yükümlülükler (vergi ve tüketici mevzuatı, md. 5/2-ç); hizmetin iyileştirilmesi ve güvenliği (meşru menfaat, md. 5/2-f); açık rıza gereken işlemler (ör. 16 yaş altı için veli onayı, AI öğretmen) için açık rıza.'] },
      { h: 'Aktarım', p: ['Veriler; barındırma (Railway, yurt dışı), ödeme kuruluşu (iyzico) ve AI öğretmen sağlayıcısı (Anthropic, yurt dışı) ile hizmetin gerektirdiği ölçüde paylaşılır. [HUKUKÇU: KVKK md. 9 yurt dışı aktarım dayanağı ve standart sözleşme bildirimleri netleşmeli.]'] },
      { h: 'Saklama', p: ['Hesap açık kaldıkça; hesap silinince kişisel kayıtlar silinir. Mevzuatın saklamayı zorunlu kıldığı ödeme/fatura kayıtları yasal süre boyunca saklanır. [YAPILACAK: ödeme kayıtlarının silme yerine anonimleştirilmesi.]'] },
      { h: 'Hakların (md. 11)', p: ['Verilerinin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltme, silme, itiraz ve zararın giderilmesini isteme hakların vardır. Hesabım sayfasından verilerini JSON olarak indirebilir ve hesabını silebilirsin; diğer talepler için [DESTEK E-POSTASI].'] },
    ],
  },
}
