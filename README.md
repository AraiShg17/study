# 英単語クイズ (study)

英単語をひたすら覚えるための iOS / Expo アプリ。
4択で出題し、回答すると正誤と簡単な解説（品詞・意味・例文）が出て、次の問題へ進む。

## 特長

- **4択クイズ** — 英→日 / 日→英 をランダムにミックスして出題
- **SRS（間隔反復 / Leitner 方式）** — 間違えた単語ほど早く・何度も再出題し、覚えた単語は間隔を空ける
- **進捗の保存** — 連続学習日数・正答率・学習済み/習得数を端末に保存（AsyncStorage）
- **単語データは JSON** — `src/data/words.json` を差し替え・追記するだけで増やせる

## 動かし方（Expo Go）

```bash
npm install
npx expo start
```

表示された QR コードを iPhone の Expo Go アプリで読み取ると実機で動く。

## 構成

| パス | 役割 |
|------|------|
| `src/data/words.json` | 単語データ（英単語・意味・品詞・例文） |
| `src/types.ts` | 型定義 |
| `src/lib/quiz.ts` | 問題生成（出題方向ミックス・4択生成） |
| `src/lib/srs.ts` | SRS（Leitner ボックス）と進捗の保存 |
| `src/screens/QuizScreen.tsx` | メイン画面 |
| `src/components/` | 選択肢ボタン・進捗バー |

## 単語を増やすには

`src/data/words.json` に同じ形式で要素を追加するだけ。`id` は重複しない値にする。

```json
{ "id": "w0201", "word": "example", "meaning": "例", "pos": "noun", "example": "Give me an example.", "exampleJa": "例を一つ挙げて。" }
```

## 技術スタック

- Expo SDK 54 / React Native 0.81 / React 19
- TypeScript
- AsyncStorage（進捗の永続化）
