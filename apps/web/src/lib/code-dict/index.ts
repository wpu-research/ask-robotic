// Kod örneklerinin İngilizce sözlüğü (tüm alanlar için TEK sözlük): ids.json = Türkçe tanımlayıcı → İngilizce, comments.json = Türkçe yorum → İngilizce.
// Aynı Türkçe ad/yorum her yerde aynı çevrilir. Genişletirken: tools/content/code-dict-check.mjs (çakışma ve kapsama denetimi) ve code-dict.test.ts.
import type { CodeDict } from '../code-i18n'
import ids from './ids.json'
import comments from './comments.json'

export const CODE_DICT_EN: CodeDict = { ids: ids as Record<string, string>, comments: comments as Record<string, string> }
