// 単語データ・クイズ・SRS の型定義

/** 品詞 */
export type Pos = 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'conj' | 'pron' | 'phrase';

/** 難易度レベル（頻度ランク帯）。beginner=初級 / intermediate=中級 / advanced=上級 */
export type Level = 'beginner' | 'intermediate' | 'advanced';

/** 単語1件。words.json の1要素に対応する。 */
export interface Word {
  /** 安定したID（並び順を変えても変わらない） */
  id: string;
  /** 英単語 */
  word: string;
  /** 日本語の意味（簡潔に） */
  meaning: string;
  /** 品詞 */
  pos: Pos;
  /** 難易度レベル（頻度帯） */
  level: Level;
  /** 例文（英語） */
  example: string;
  /** 例文の訳（日本語） */
  exampleJa: string;
}

/** 出題方向 */
export type Direction = 'en2ja' | 'ja2en';

/** 1問分の問題 */
export interface Question {
  word: Word;
  direction: Direction;
  /** 問題文（方向に応じて英語 or 日本語） */
  prompt: string;
  /** 選択肢4つ（正解を含む。表示順はシャッフル済み） */
  choices: string[];
  /** choices の中で正解のインデックス */
  answerIndex: number;
}

/** 1単語ごとの学習状態（SRS / Leitner） */
export interface CardState {
  /** Leitter のボックス番号（0=未学習/苦手 〜 5=習得） */
  box: number;
  /** 次に出題してよくなる時刻（epoch ms）。0 なら即出題可。 */
  due: number;
  /** 累計正解数 */
  correct: number;
  /** 累計不正解数 */
  wrong: number;
  /** 最後に解いた時刻（epoch ms） */
  lastSeen: number;
}

/** 全体の進捗統計 */
export interface Progress {
  /** 単語ID -> 学習状態 */
  cards: Record<string, CardState>;
  /** 累計回答数 */
  totalAnswered: number;
  /** 累計正解数 */
  totalCorrect: number;
  /** 連続学習日数（ストリーク） */
  streak: number;
  /** 最後に学習した日付 'YYYY-MM-DD'（ローカル） */
  lastStudyDate: string | null;
}
