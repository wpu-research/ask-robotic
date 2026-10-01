import { describe, expect, it } from 'vitest'
import { ALLOWED_HEADERS, LIMITS, validateSource } from './validate'

const BLINK = `void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`

function errs(src: string) {
  const r = validateSource(src)
  return r.ok ? [] : r.errors
}
/** Reddedilmeli; en az bir hata beklenen satırda olmalı. */
function expectRejectedAt(src: string, line: number) {
  const e = errs(src)
  expect(e.length, `reddedilmeliydi:\n${src}`).toBeGreaterThan(0)
  expect(e.map((x) => x.line)).toContain(line)
  for (const x of e) expect(x.message).toMatch(/\S/)
}

describe('izinli programlar', () => {
  it('Blink geçer', () => expect(validateSource(BLINK)).toEqual({ ok: true }))

  it('Servo + LCD + Wire include\'lu örnek geçer', () => {
    const src = `#include <Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <avr/pgmspace.h>
Servo s;
LiquidCrystal_I2C lcd(0x27, 16, 2);
const char msg[] PROGMEM = "Merhaba // dunya /* x */";
void setup() { s.attach(9); lcd.init(); Wire.begin(); lcd.print("selam"); }
void loop() { s.write(90); delay(15); }
`
    expect(validateSource(src)).toEqual({ ok: true })
  })

  it('#define, #ifdef, #if/#elif/#else/#endif, #undef geçer', () => {
    const src = `#define LED 13
#define SQUARE(x) ((x)*(x))
#define MSG "hello"
#ifdef LED
  const int pin = LED;
#else
  const int pin = 12;
#endif
#ifndef FOO
#define FOO 1
#endif
#if FOO == 1
int a;
#elif FOO == 2
int b;
#endif
#undef FOO
void setup() {}
void loop() {}
`
    expect(validateSource(src)).toEqual({ ok: true })
  })

  it('boşluklu yazım meşrudur (#  include <Servo.h>, # define)', () => {
    expect(validateSource('#  include <Servo.h>\n  # define X 1\n\t#\tinclude <Wire.h>\n')).toEqual({ ok: true })
  })

  it('tüm izinli başlıklar geçer', () => {
    for (const h of ALLOWED_HEADERS) expect(validateSource(`#include <${h}>\n`), h).toEqual({ ok: true })
  })

  it('dize içindeki "#include \\"x\\"" zararsızdır', () => {
    expect(validateSource('const char* s = "#include \\"x\\"";\n')).toEqual({ ok: true })
    expect(validateSource('const char* s = "asm __asm__ #pragma";\n')).toEqual({ ok: true })
    expect(validateSource("char c = '\"'; const char* t = \"#pragma\";\n")).toEqual({ ok: true })
  })

  it('yorum içindeki yasak şeyler zararsızdır', () => {
    expect(validateSource('// #include "/etc/passwd"\n/* #pragma once\nasm */\nint x;\n')).toEqual({ ok: true })
  })

  it('PROGMEM gibi makrolar serbest, "casm"/"asmx" gibi kelimeler yanlış pozitif vermez', () => {
    expect(validateSource('int casm, asmx, my_asm;\nconst int PROGMEM t[] = {1};\n')).toEqual({ ok: true })
  })

  it('CRLF satır sonları geçer', () => expect(validateSource(BLINK.replace(/\n/g, '\r\n'))).toEqual({ ok: true }))

  it('# ile başlayan tek başına satır (boş yönerge) geçer', () => expect(validateSource('#\nint x;\n')).toEqual({ ok: true }))
})

describe('#include saldırıları', () => {
  it.each([
    ['#include "/etc/passwd"'],
    ['#include "../x.h"'],
    ['#include <../../etc/passwd>'],
    ['#include </etc/passwd>'],
    ['# include "x"'],
    ['#include "Servo.h"'],
    ['#include MACRO'],
    ['#include <Bilinmeyen.h>'],
    ['#include <avr/io.h>'],
    ['#include <avr/pgmspace.h/../../x>'],
    ['#include <C:\\x.h>'],
    ['#include <a:b.h>'],
    ['#include <Servo.h> garbage'],
    ['#include <Servo.h'],
    ['#include'],
    ['#include <servo.h>'],
    ['#include < Servo.h >'],
    ['#include_next <Servo.h>'],
    ['#import <Servo.h>'],
  ])('%s reddedilir (2. satır)', (line) => expectRejectedAt(`int x;\n${line}\nint y;\n`, 2))

  it('yol içeren başlık mesajı yol der', () => {
    expect(errs('#include </etc/passwd>\n')[0].message).toMatch(/Yol/)
    expect(errs('#include "x"\n')[0].message).toMatch(/Tırnaklı/)
    expect(errs('#include MACRO\n')[0].message).toMatch(/Makro/)
  })

  it('digraf %:include reddedilir', () => {
    expectRejectedAt('int x;\n%:include "x"\n', 2)
    expectRejectedAt('int x;\n%: include <Servo.h>\n', 2)
    expectRejectedAt('#define A(a,b) a %:%: b\n', 1)
  })

  it('trigraf ??= reddedilir', () => {
    expectRejectedAt('int x;\n??=include "x"\n', 2)
    expectRejectedAt('int x; // ??/\n#include "x"\n', 1)
    expectRejectedAt('char* s = "??=";\n', 1)
  })

  it('"??" tek başına (trigraf değil) geçer', () => {
    expect(validateSource('const char* s = "ne?? tamam";\n')).toEqual({ ok: true })
  })

  it('satır bölmeli #in\\<yeni satır>clude "x" reddedilir (hata # satırında)', () => {
    expectRejectedAt('int x;\n#in\\\nclude "x"\n', 2)
    expectRejectedAt('#inc\\\nlu\\\nde "/etc/passwd"\n', 1)
    expectRejectedAt('#\\\ninclude "x"\n', 1)
    expectRejectedAt('#in\\  \nclude "x"\n', 1) // \ + boşluk + LF de GCC'de birleştirir
    expectRejectedAt('#in\\\r\nclude "x"\r\n', 1)
  })

  it('satır bölmeyle #pragma gizlenemez', () => {
    expectRejectedAt('#pra\\\ngma once\n', 1)
  })

  it('yorumla gizleme: /* */ #include "x"', () => {
    expectRejectedAt('/* */ #include "x"\n', 1)
    expectRejectedAt('/**/#include "x"\n', 1)
    expectRejectedAt('/*\n*/ #include "x"\n', 2)
    expectRejectedAt('# /* a\nb */ include "x"\n', 1) // çok satırlı yorum '#' ile ad arasında: tek boşluk
    expectRejectedAt('#/**/include "x"\n', 1)
    expectRejectedAt('int a; /* \n\n */ \n#include "x"\n', 4)
    // satır yorumu \ ile devam eder: sonraki satır yorumun parçasıdır (GCC ile aynı) -> zararsız
    expect(validateSource('// \\\n#include "x"\nint y;\n')).toEqual({ ok: true })
  })

  it('yorum içine gömülü yasak söz yorumdan sonra yakalanır', () => {
    expectRejectedAt('/* x */ #pragma once\n', 1)
    expectRejectedAt('/* "\n */ #include "x"\n', 2)
    // '#' satırın ilk belirteci değilse yönerge değildir (GCC ile aynı) -> zararsız
    expect(validateSource('int a; /* "\n */ #include "x"\n')).toEqual({ ok: true })
  })

  it('"//" içeren dizenin ardından gelen yönerge gizlenemez', () => {
    expectRejectedAt('const char* u = "http://x"; \n#include "x"\n', 2)
    expectRejectedAt("char c = '/'; \n#include \"x\"\n", 2)
  })

  it('header-name içinde // yorum sayılmaz, kapanış yoksa reddedilir', () => {
    expectRejectedAt('#include <Servo.h//>\n', 1)
    expectRejectedAt('#include <a//b>\n', 1)
  })

  it('kapanmamış tırnak sonraki satırdaki yönergeyi gizleyemez', () => {
    expectRejectedAt('char c = \'\n#include "x"\n', 2)
    expectRejectedAt('const char* s = "abc\n#include "x"\n', 2)
  })

  it('kapanmamış tırnağın kalanı kod gibi taranır', () => {
    expectRejectedAt('char c = \' asm("nop");\n', 1)
  })

  it('kapanmamış /* yorumu hata', () => expectRejectedAt('int x;\n/* acik\n', 2))
})

describe('diğer yönergeler ve sözcükler', () => {
  it.each([
    ['#pragma once'],
    ['#pragma GCC poison x'],
    ['#error nope'],
    ['#warning nope'],
    ['#line 5 "x"'],
    ['# 33 "/etc/passwd"'],
    ['#ident "x"'],
    ['#sccs "x"'],
    ['#assert machine(x)'],
    ['#unassert machine'],
    ['#import "x"'],
    ['#include_next "x"'],
    ['#foo'],
    ['#!bang'],
    ['#if __has_include(<Servo.h>)'],
    ['#if __has_include_next(<Servo.h>)'],
    ['#ifdef __has_include'],
  ])('%s reddedilir', (line) => expectRejectedAt(`int x;\n${line}\n`, 2))

  it.each([
    ['asm("nop");'],
    ['asm volatile("nop");'],
    ['__asm__("nop");'],
    ['__asm("nop");'],
    ['_Pragma("GCC poison x")'],
    ['int x __attribute__((section(".y")));'],
    ['int x __attribute((packed));'],
    ['int y = __has_include(<x>);'],
    ['const char d[] = ".incbin";'.replace('".incbin"', '0') + ' incbin(x)'],
    ['int z = __builtin_trap();'],
    ['__builtin_foo();'],
    ['#define X asm'],
    ['#define A(x) __asm__ x'],
    ['#define B _Pragma'],
    ['#define C __attribute__'],
  ])('%s reddedilir', (line) => expectRejectedAt(`int x;\n${line}\n`, 2))

  it('token yapıştırma (##) ve ters eğik çizgi (UCN) ile gizleme engellenir', () => {
    expectRejectedAt('#define CAT(a,b) a##b\nCAT(as,m)("nop");\n', 1)
    expectRejectedAt('\\u0061sm("nop");\n', 1)
    expectRejectedAt('int x;\n\\x\n', 2)
  })

  it('ham dize sabiti (raw string) reddedilir', () => {
    expectRejectedAt('const char* s = R"x(\n#include "/etc/passwd"\n)x";\n', 1)
    expectRejectedAt('const char* s = u8R"(a)";\n', 1)
  })

  it('"R" ile biten ama ham dize olmayan tanımlayıcı geçer', () => {
    expect(validateSource('int PR = 1; const char* s = "x";\nconst char* t = FOOR "x";\n')).toEqual({ ok: true })
  })

  it('yorum/dize DIŞINDA kelime olarak geçen asm satır numarasıyla bildirilir', () => {
    const e = errs('void f() {\n  int a = 1;\n  asm("nop");\n}\n')
    expect(e).toEqual([{ line: 3, message: "'asm' kullanılamaz." }])
  })

  it('birden çok hata sıralı döner', () => {
    const e = errs('#pragma once\nint x;\n#error y\nasm("");\n')
    expect(e.map((x) => x.line)).toEqual([1, 3, 4])
  })
})

describe('boyut ve karakter sınırları', () => {
  it('NUL bayt reddedilir (satır numarası ile)', () => expectRejectedAt('int x;\nint y\0;\n', 2))

  it('diğer denetim karakterleri ve yalnız CR reddedilir', () => {
    expectRejectedAt('int x;\n\x01\n', 2)
    expectRejectedAt('int x;\rint y;\n', 1)
    expectRejectedAt('int x;\f\n', 1)
  })

  it('geçersiz UTF-8 (U+FFFD) ve yetim vekil reddedilir', () => {
    expectRejectedAt('int x;\n// \uFFFD\n', 2)
    expectRejectedAt('int x;\n// \uD800\n', 2)
  })

  it('UTF-8 metin (Türkçe yorum, emoji) geçer', () => {
    expect(validateSource('// Işık yak çok güzel 💡\nconst char* s = "şğüıöç";\n')).toEqual({ ok: true })
  })

  it('32 KB sınırı: tam sınır geçer, 1 bayt fazlası reddedilir', () => {
    const line = '//' + 'a'.repeat(98) + '\n' // 101 bayt
    let ok = ''
    while (Buffer.byteLength(ok + line) <= LIMITS.maxBytes) ok += line
    ok += '/'.repeat(LIMITS.maxBytes - Buffer.byteLength(ok)) // satırı bozmadan tam 32768 bayta tamamla
    expect(Buffer.byteLength(ok)).toBe(LIMITS.maxBytes)
    expect(ok.split('\n').length).toBeLessThan(LIMITS.maxLines)
    expect(validateSource(ok)).toEqual({ ok: true })
    expectRejectedAt(ok + '/', 1)
  })

  it('çok baytlı karakterler bayt olarak sayılır', () => {
    const big = '//' + 'ş'.repeat(17000) // 17000 karakter, 34000 bayt
    expect(errs(big).length).toBeGreaterThan(0)
  })

  it('1500 satır geçer, 1501 reddedilir', () => {
    expect(validateSource('int x;\n'.repeat(1500))).toEqual({ ok: true })
    expectRejectedAt('int x;\n'.repeat(1501), 1501)
    expect(validateSource('\n'.repeat(1500))).toEqual({ ok: true })
  })

  it('tek satır 400 karakter geçer, 401 reddedilir ve doğru satırı bildirir', () => {
    const ok = '//' + 'x'.repeat(398)
    expect(ok.length).toBe(400)
    expect(validateSource(`int a;\n${ok}\n`)).toEqual({ ok: true })
    expectRejectedAt(`int a;\nint b;\n${ok}x\n`, 3)
  })

  it('satır birleştirmeyle uzun satır yapılsa da fiziksel satır sınırı geçerlidir', () => {
    const part = 'a'.repeat(450) + '\\\n'
    expectRejectedAt('int x;\n' + 'int ' + (part + 'a'.repeat(10) + ';\n'), 2)
  })

  it('metin olmayan girdi reddedilir', () => {
    expect(validateSource(undefined).ok).toBe(false)
    expect(validateSource(42).ok).toBe(false)
    expect(validateSource({}).ok).toBe(false)
  })

  it('boş kod geçer', () => expect(validateSource('')).toEqual({ ok: true }))
})
