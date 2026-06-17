#!/usr/bin/env python3
"""新規バッチを words.json に追記する共通スクリプト。

使い方: バッチ側スクリプトが NEW = [(word, meaning, pos, level, example, exampleJa), ...]
を作って append(NEW) を呼ぶ。
- 既存の単語と重複するものは自動スキップ
- id は w0001 形式で連番付与
- 元の「1行1オブジェクト」フォーマットを維持
"""
import json
import os

PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "words.json")


def append(new_rows):
    words = json.load(open(PATH, encoding="utf-8"))
    existing = {w["word"].lower() for w in words}
    # 既存の最大id番号
    max_n = max((int(w["id"][1:]) for w in words), default=0)

    added, skipped = 0, []
    seen_in_batch = set()
    for row in new_rows:
        word, meaning, pos, level, example, example_ja = row
        key = word.lower()
        if key in existing or key in seen_in_batch:
            skipped.append(word)
            continue
        seen_in_batch.add(key)
        max_n += 1
        words.append({
            "id": f"w{max_n:04d}",
            "word": word,
            "meaning": meaning,
            "pos": pos,
            "level": level,
            "example": example,
            "exampleJa": example_ja,
        })
        added += 1

    lines = ["  " + json.dumps(w, ensure_ascii=False) for w in words]
    open(PATH, "w", encoding="utf-8").write("[\n" + ",\n".join(lines) + "\n]\n")

    from collections import Counter
    c = Counter(w["level"] for w in words)
    print(f"added {added}, skipped {len(skipped)} -> total {len(words)} {dict(c)}")
    if skipped:
        print("skipped:", ", ".join(skipped))
