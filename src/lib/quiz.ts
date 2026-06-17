// クイズの問題生成。出題方向（英→日 / 日→英）をミックスし、4択を作る。

import type { Direction, Question, Word } from '../types';

/** 配列をシャッフルした新しい配列を返す（Fisher–Yates）。 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 不正解の選択肢（ダミー）を3つ選ぶ。
 * できるだけ同じ品詞から選び、難易度と紛らわしさを上げる。
 * 足りなければ品詞を問わず補充する。
 */
function pickDistractors(answer: Word, all: Word[], direction: Direction): string[] {
  const valueOf = (w: Word) => (direction === 'en2ja' ? w.meaning : w.word);
  const correctValue = valueOf(answer);

  const samePos = all.filter(
    (w) => w.id !== answer.id && w.pos === answer.pos && valueOf(w) !== correctValue,
  );
  const others = all.filter(
    (w) => w.id !== answer.id && w.pos !== answer.pos && valueOf(w) !== correctValue,
  );

  const picked: string[] = [];
  const seen = new Set<string>([correctValue]);

  for (const w of [...shuffle(samePos), ...shuffle(others)]) {
    const v = valueOf(w);
    if (seen.has(v)) continue;
    seen.add(v);
    picked.push(v);
    if (picked.length === 3) break;
  }
  return picked;
}

/** 指定の単語から1問を作る。direction 未指定ならランダム（ミックス）。 */
export function buildQuestion(word: Word, all: Word[], direction?: Direction): Question {
  const dir: Direction = direction ?? (Math.random() < 0.5 ? 'en2ja' : 'ja2en');
  const correct = dir === 'en2ja' ? word.meaning : word.word;
  const distractors = pickDistractors(word, all, dir);
  const choices = shuffle([correct, ...distractors]);

  return {
    word,
    direction: dir,
    prompt: dir === 'en2ja' ? word.word : word.meaning,
    choices,
    answerIndex: choices.indexOf(correct),
  };
}
