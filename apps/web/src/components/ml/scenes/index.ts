// Yeni derslerin sahneleri (ders slug'ına göre). draw.ts'teki yardımcıları kullanırlar; draw.ts bu dosyayı içe aktarmaz.
import type { Draw } from '../draw'
import { draw as aktivasyonFonksiyonlari } from './aktivasyon-fonksiyonlari'
import { draw as ayniKodUcUrun } from './ayni-kod-uc-urun'
import { draw as bolgeIhlali } from './bolge-ihlali'
import { draw as boruta } from './boruta'
import { draw as ciCdHatti } from './ci-cd-hatti'
import { draw as copToplama } from './cop-toplama'
import { draw as dbscan } from './dbscan'
import { draw as destekVektorMakinesi } from './destek-vektor-makinesi'
import { draw as dikkatMekanizmasi } from './dikkat-mekanizmasi'
import { draw as dusmeTespiti } from './dusme-tespiti'
import { draw as geriYayilim } from './geri-yayilim'
import { draw as gitDallari } from './git-dallari'
import { draw as goruntuUreteci } from './goruntu-ureteci'
import { draw as gradyanArtirma } from './gradyan-artirma'
import { draw as gradyanInisi } from './gradyan-inisi'
import { draw as hizSiniri } from './hiz-siniri'
import { draw as ikiliArama } from './ikili-arama'
import { draw as kelimeVektorleri } from './kelime-vektorleri'
import { draw as kesinlikDuyarlilik } from './kesinlik-duyarlilik'
import { draw as kilitlenme } from './kilitlenme'
import { draw as konteynerOlcekleme } from './konteyner-olcekleme'
import { draw as lojistikNoron } from './lojistik-noron'
import { draw as miniDilModeli } from './mini-dil-modeli'
import { draw as modelDamitma } from './model-damitma'
import { draw as nesneTakibi } from './nesne-takibi'
import { draw as olayDongusu } from './olay-dongusu'
import { draw as onbellek } from './onbellek'
import { draw as oneriSistemi } from './oneri-sistemi'
import { draw as qOgrenme } from './q-ogrenme'
import { draw as rag } from './rag'
import { draw as rakamTanima } from './rakam-tanima'
import { draw as rastgeleOrman } from './rastgele-orman'
import { draw as shapDegerleri } from './shap-degerleri'
import { draw as siralamaAlgoritmalari } from './siralama-algoritmalari'
import { draw as yapayZekaAjani } from './yapay-zeka-ajani'
import { draw as yiginVeObek } from './yigin-ve-obek'
import { draw as yuzDogrulama } from './yuz-dogrulama'
import { draw as zincirKurali } from './zincir-kurali'

export const SCENES: Record<string, Draw> = {
  'aktivasyon-fonksiyonlari': aktivasyonFonksiyonlari,
  'ayni-kod-uc-urun': ayniKodUcUrun,
  'bolge-ihlali': bolgeIhlali,
  'boruta': boruta,
  'ci-cd-hatti': ciCdHatti,
  'cop-toplama': copToplama,
  'dbscan': dbscan,
  'destek-vektor-makinesi': destekVektorMakinesi,
  'dikkat-mekanizmasi': dikkatMekanizmasi,
  'dusme-tespiti': dusmeTespiti,
  'geri-yayilim': geriYayilim,
  'git-dallari': gitDallari,
  'goruntu-ureteci': goruntuUreteci,
  'gradyan-artirma': gradyanArtirma,
  'gradyan-inisi': gradyanInisi,
  'hiz-siniri': hizSiniri,
  'ikili-arama': ikiliArama,
  'kelime-vektorleri': kelimeVektorleri,
  'kesinlik-duyarlilik': kesinlikDuyarlilik,
  'kilitlenme': kilitlenme,
  'konteyner-olcekleme': konteynerOlcekleme,
  'lojistik-noron': lojistikNoron,
  'mini-dil-modeli': miniDilModeli,
  'model-damitma': modelDamitma,
  'nesne-takibi': nesneTakibi,
  'olay-dongusu': olayDongusu,
  'onbellek': onbellek,
  'oneri-sistemi': oneriSistemi,
  'q-ogrenme': qOgrenme,
  'rag': rag,
  'rakam-tanima': rakamTanima,
  'rastgele-orman': rastgeleOrman,
  'shap-degerleri': shapDegerleri,
  'siralama-algoritmalari': siralamaAlgoritmalari,
  'yapay-zeka-ajani': yapayZekaAjani,
  'yigin-ve-obek': yiginVeObek,
  'yuz-dogrulama': yuzDogrulama,
  'zincir-kurali': zincirKurali,
}
