// consent ad alanı (Türkçe kaynak): Veri kaydı onayı (components/learn/consent-banner.tsx).
// notice: bant ve ayar kutusundaki onay metni; CONSENT_TEXT bu nesnenin kendisidir (learn.test.tsx Türkçesini denetler).
export const consent = {
  notice: {
    title: 'Öğrenme verisi (taslak, pilot)',
    body: 'Hangi derslere baktığını, mini testlerde neyi doğru yaptığını ve ekranda geçirdiğin süreyi kaydedip İlerlemem sayfasında beceri haritası çıkarabiliriz. Ad, e-posta ya da IP adresi kaydedilmez; yalnızca bu cihazda rastgele üretilen anonim bir kimlik kullanılır. Kaydı istediğin zaman "Verilerimi sil" ile hem bu cihazdan hem sunucudan silebilirsin.',
    minor: '16 yaşından küçükseniz kayıt için ebeveyn ya da yasal vasinin onayı gerekir. Onayı vermeden önce bir yetişkinle birlikte okuyun.',
    draft: 'Bu metin pilot için hazırlanmış bir taslaktır; hukuki KVKK aydınlatma metninin yerini tutmaz.',
    ack: '16 yaşından büyüğüm ya da ebeveynim/vasim bu kaydı onayladı.',
  },
  bannerLabel: 'Veri kaydı onayı',
  local: 'Yalnız bu cihazda tut',
  sync: 'Tut ve anonim olarak sunucuya da gönder',
  deny: 'Kaydetme',
  mode: {
    local: 'Olaylar yalnız bu tarayıcıda saklanıyor.',
    sync: 'Olaylar bu tarayıcıda saklanıyor ve anonim olarak sunucuya gönderiliyor.',
    denied: 'Hiçbir şey kaydedilmiyor.',
  },
  undecided: 'Henüz bir karar vermedin; hiçbir şey kaydedilmiyor.',
  eventCount: 'Kayıtlı olay sayısı:',
  settingsTitle: 'Verilerim (taslak, pilot)',
  change: 'Tercihini değiştir',
  deleteTitle: 'Verilerimi sil',
  deleteButton: 'Verilerimi sil',
  deleteDialog: 'Silme onayı',
  deleteConfirm: 'Olay günlüğü, cihaz kimliği ve onay bu cihazdan ve sunucudan kalıcı olarak silinecek. Emin misin?',
  deleteYes: 'Evet, sil',
  deleteNo: 'Vazgeç',
  deleteError: 'Sunucudaki kayıtlar silinemedi; hiçbir şey silinmedi. Bağlantını kontrol edip yeniden dene.',
  deletedLocal: 'Silindi: bu tarayıcıdaki olay günlüğü, cihaz kimliği ve onay. Ders ilerlemen ve çalışma dosyaların etkilenmedi.',
  deletedServer: 'Silindi: bu tarayıcıdaki olay günlüğü, cihaz kimliği ve onay ile sunucudaki kayıtların. Ders ilerlemen ve çalışma dosyaların etkilenmedi.',
}
