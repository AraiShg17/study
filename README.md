# 英単語クイズ (study)

英単語をひたすら覚えるための iOS / Expo アプリ。
4択で出題し、回答すると正誤と簡単な解説（品詞・意味・例文）が出て、次の問題へ進む。

## 特長

- **4択クイズ** — 英→日 / 日→英 をランダムにミックスして出題
- **TOPページでレベル選択** — 初級 / 中級 / 上級（頻度ランク帯）＋全レベルミックス＋苦手だけ復習
- **SRS（間隔反復 / Leitner 方式）** — 間違えた単語ほど早く・何度も再出題し、覚えた単語は間隔を空ける
- **進捗の保存** — 連続学習日数・正答率・学習済み/習得数を端末に保存（AsyncStorage）
- **単語データは JSON** — `src/data/words.json`（現在 1,033 語：初級468・中級297・上級268）を追記するだけで増やせる

## 動かし方（Expo Go）

```bash
npm install
npx expo start
```

表示された QR コードを iPhone の Expo Go アプリで読み取ると実機で動く。

## 構成

| パス | 役割 |
|------|------|
| `src/data/words.json` | 単語データ（英単語・意味・品詞・レベル・例文） |
| `src/types.ts` | 型定義 |
| `src/lib/quiz.ts` | 問題生成（出題方向ミックス・4択生成） |
| `src/lib/srs.ts` | SRS（Leitner ボックス）と進捗の保存 |
| `src/lib/pools.ts` | 出題プール（レベル別・全体・苦手復習）の抽出 |
| `src/screens/HomeScreen.tsx` | TOPページ（モード選択） |
| `src/screens/QuizScreen.tsx` | クイズ画面 |
| `src/components/` | 選択肢ボタン・進捗バー |
| `scripts/append_words.py` | 単語バッチを重複チェック付きで追記 |
| `scripts/make_icons.py` | アプリアイコン一式を生成 |

## 単語を増やすには

`src/data/words.json` に同じ形式で要素を追加するだけ。`id` は重複しない値、`level` は `beginner` / `intermediate` / `advanced` のいずれか。

```json
{ "id": "w1034", "word": "example", "meaning": "例", "pos": "noun", "level": "beginner", "example": "Give me an example.", "exampleJa": "例を一つ挙げて。" }
```

まとめて足すときは `scripts/append_words.py` を使うと、重複スキップ・連番ID付与・整形を自動でやってくれる。

## 技術スタック

- Expo SDK 54 / React Native 0.81 / React 19
- TypeScript
- AsyncStorage（進捗の永続化）
