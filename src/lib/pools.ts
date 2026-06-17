// 出題プール（モード）の定義と、モードに応じた単語の絞り込み。

import type { Level, Progress, Word } from '../types';
import { getCard } from './srs';

/** 出題モード */
export type Mode =
  | { kind: 'level'; level: Level } // レベル別
  | { kind: 'all' } //               全レベルミックス
  | { kind: 'review' }; //           苦手だけ復習

/** そのモードで出題対象になる単語を返す。 */
export function poolFor(mode: Mode, words: Word[], progress: Progress): Word[] {
  switch (mode.kind) {
    case 'level':
      return words.filter((w) => w.level === mode.level);
    case 'all':
      return words;
    case 'review':
      // 一度でも出題され、まだ定着していない（box が低い or 間違えた）単語
      return words.filter((w) => {
        const c = progress.cards[w.id];
        return c !== undefined && (c.box < 2 || c.wrong > 0);
      });
  }
}

/** モードの表示タイトル。 */
export function modeTitle(mode: Mode): string {
  switch (mode.kind) {
    case 'level':
      return LEVEL_LABEL[mode.level];
    case 'all':
      return '全レベルミックス';
    case 'review':
      return '苦手だけ復習';
  }
}

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

export const LEVEL_ORDER: Level[] = ['beginner', 'intermediate', 'advanced'];

/** あるプールの「学習済み数」と「習得数」を数える。 */
export function poolStats(pool: Word[], progress: Progress, maxBox: number) {
  let seen = 0;
  let mastered = 0;
  for (const w of pool) {
    const c = progress.cards[w.id];
    if (!c) continue;
    seen += 1;
    if (c.box >= maxBox) mastered += 1;
  }
  return { total: pool.length, seen, mastered };
}
