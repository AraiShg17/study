// SRS（間隔反復）— Leitner ボックス方式。
// 間違えた単語ほど早く・何度も出題し、覚えた単語は間隔を空けて出す。

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CardState, Progress, Word } from '../types';

const STORAGE_KEY = 'study.progress.v1';

/** ボックスごとの再出題までの待ち時間（ミリ秒）。box が上がるほど間隔が伸びる。 */
const BOX_INTERVALS_MS = [
  0, //            box0: すぐ（苦手・未学習）
  1000 * 60 * 1, // box1: 1分後
  1000 * 60 * 10, // box2: 10分後
  1000 * 60 * 60 * 24, // box3: 1日後
  1000 * 60 * 60 * 24 * 3, // box4: 3日後
  1000 * 60 * 60 * 24 * 7, // box5: 7日後（ほぼ習得）
];

export const MAX_BOX = BOX_INTERVALS_MS.length - 1;

/** 未学習カードの初期状態。 */
function freshCard(): CardState {
  return { box: 0, due: 0, correct: 0, wrong: 0, lastSeen: 0 };
}

/** ローカル日付 'YYYY-MM-DD' を返す。 */
function todayStr(now = Date.now()): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 空の進捗を作る。 */
export function emptyProgress(): Progress {
  return {
    cards: {},
    totalAnswered: 0,
    totalCorrect: 0,
    streak: 0,
    lastStudyDate: null,
  };
}

/** 保存済みの進捗を読み込む（無ければ空）。 */
export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...emptyProgress(), ...parsed, cards: parsed.cards ?? {} };
  } catch {
    return emptyProgress();
  }
}

/** 進捗を保存する。 */
export async function saveProgress(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // 保存に失敗してもアプリは続行する
  }
}

/** その単語の現在の状態を取得（無ければ新規）。 */
export function getCard(p: Progress, wordId: string): CardState {
  return p.cards[wordId] ?? freshCard();
}

/**
 * 次に出題する単語を選ぶ。
 * 1) 期限が来ている（due <= now）カードを優先。その中では box が低い＝苦手なものを優先。
 * 2) 期限が来ているものが無ければ、最も早く期限が来るカードを選ぶ。
 * 直前と同じ単語が連続しないよう excludeId を避ける。
 */
export function selectNextWord(
  words: Word[],
  p: Progress,
  now = Date.now(),
  excludeId?: string,
): Word {
  const pool = words.filter((w) => w.id !== excludeId);
  const candidates = pool.length > 0 ? pool : words;

  const scored = candidates.map((w) => {
    const c = getCard(p, w.id);
    return { w, c };
  });

  const due = scored.filter(({ c }) => c.due <= now);
  if (due.length > 0) {
    // box が低い順 → 最後に見たのが古い順。少しランダム性も混ぜる。
    due.sort((a, b) => a.c.box - b.c.box || a.c.lastSeen - b.c.lastSeen);
    const head = due.slice(0, Math.min(8, due.length));
    return head[Math.floor(Math.random() * head.length)].w;
  }

  // 全部まだ期限前 → 最も早く期限が来るものを出す
  scored.sort((a, b) => a.c.due - b.c.due);
  return scored[0].w;
}

/**
 * 回答結果を進捗に反映した新しい Progress を返す（非破壊）。
 * 正解: box を1つ上げて間隔を伸ばす。不正解: box0 に戻してすぐ再出題。
 */
export function applyAnswer(p: Progress, wordId: string, correct: boolean, now = Date.now()): Progress {
  const prev = getCard(p, wordId);
  const box = correct ? Math.min(prev.box + 1, MAX_BOX) : 0;
  const next: CardState = {
    box,
    due: now + BOX_INTERVALS_MS[box],
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastSeen: now,
  };

  // ストリーク更新
  const today = todayStr(now);
  let streak = p.streak;
  if (p.lastStudyDate !== today) {
    const yesterday = todayStr(now - 1000 * 60 * 60 * 24);
    streak = p.lastStudyDate === yesterday ? p.streak + 1 : 1;
  }

  return {
    cards: { ...p.cards, [wordId]: next },
    totalAnswered: p.totalAnswered + 1,
    totalCorrect: p.totalCorrect + (correct ? 1 : 0),
    streak,
    lastStudyDate: today,
  };
}

/** 「習得済み」とみなすカード数（box が最大）。 */
export function masteredCount(p: Progress): number {
  return Object.values(p.cards).filter((c) => c.box >= MAX_BOX).length;
}

/** 一度でも学習したカード数。 */
export function seenCount(p: Progress): number {
  return Object.keys(p.cards).length;
}
