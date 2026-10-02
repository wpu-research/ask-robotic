// Blockly'nin hazır Türkçe iletileri çocuklar için yer yer kopuk (ör. "%1 %2 ayarla", "-"). Burada daha doğal olanlarla değiştirilir.
export const TR_OVERRIDES: Record<string, string> = {
  VARIABLES_SET: '%1 değişkenini %2 yap',
  MATH_CHANGE_TITLE: '%1 değişkenini %2 kadar değiştir',
  VARIABLES_DEFAULT_NAME: 'değişken',
  CONTROLS_IF_MSG_IF: 'eğer',
  CONTROLS_IF_MSG_THEN: 'ise',
  CONTROLS_IF_MSG_ELSE: 'değilse',
  CONTROLS_IF_MSG_ELSEIF: 'değilse eğer',
  CONTROLS_REPEAT_TITLE: '%1 kez tekrarla',
  CONTROLS_REPEAT_INPUT_DO: 'yap',
  CONTROLS_WHILEUNTIL_OPERATOR_WHILE: 'doğruyken tekrarla',
  CONTROLS_WHILEUNTIL_OPERATOR_UNTIL: 'doğru olana kadar tekrarla',
  CONTROLS_FOR_TITLE: 'sayaç %1 değeri %2 den %3 e kadar, %4 artışla',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: 'döngüden çık',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: 'sonraki tura geç',
  LOGIC_BOOLEAN_TRUE: 'doğru',
  LOGIC_BOOLEAN_FALSE: 'yanlış',
  LOGIC_NEGATE_TITLE: '%1 değil',
  LOGIC_TERNARY_CONDITION: 'eğer',
  LOGIC_TERNARY_IF_TRUE: 'ise',
  LOGIC_TERNARY_IF_FALSE: 'değilse',
  MATH_MODULO_TITLE: '%1 ÷ %2 işleminin kalanı',
  MATH_RANDOM_INT_TITLE: '%1 ile %2 arasında rastgele sayı',
  MATH_CONSTRAIN_TITLE: '%1 sayısını %2 ile %3 arasında tut',
  MATH_SINGLE_OP_ABSOLUTE: 'mutlak değer',
  MATH_SINGLE_OP_ROOT: 'karekök',
  TEXT_JOIN_TITLE_CREATEWITH: 'birleştir',
  PROCEDURES_DEFNORETURN_TITLE: 'fonksiyon',
  PROCEDURES_DEFRETURN_TITLE: 'fonksiyon',
  PROCEDURES_DEFNORETURN_PROCEDURE: 'fonksiyon',
  PROCEDURES_DEFRETURN_PROCEDURE: 'fonksiyon',
  PROCEDURES_BEFORE_PARAMS: 'girdiler:',
  PROCEDURES_CALL_BEFORE_PARAMS: 'girdiler:',
  PROCEDURES_DEFRETURN_RETURN: 'döndür',
  PROCEDURES_MUTATORARG_TITLE: 'girdi adı:',
  PROCEDURES_MUTATORCONTAINER_TITLE: 'girdiler',
  INPUT_LABEL_VARIABLES_SET: 'atanacak değer',
}

/** `Blockly.Msg` nesnesine uygular (setLocale'den sonra çağır). */
export function applyTurkishMessages(msg: Record<string, string>): void {
  for (const [k, v] of Object.entries(TR_OVERRIDES)) msg[k] = v
}
