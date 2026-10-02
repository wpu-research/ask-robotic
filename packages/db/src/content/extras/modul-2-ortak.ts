// Modül 2 ek içeriği için ortak yardımcı: blok dizilerini kod bloğu olarak yazar (şablon dizgilerinde ters tırnak kaçışı gerekmesin).
// Blok dizileri metinle gösterilir: girinti = bir C bloğunun (tekrarla, eğer, sonsuza kadar) içi.
export const kod = (...satir: string[]): string => '```\n' + satir.join('\n') + '\n```'
