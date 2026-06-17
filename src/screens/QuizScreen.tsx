// メイン画面：4択クイズ。回答→正誤＋解説→次の問題、をひたすら繰り返す。

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import wordsData from '../data/words.json';
import { buildQuestion } from '../lib/quiz';
import {
  applyAnswer,
  loadProgress,
  masteredCount,
  saveProgress,
  selectNextWord,
  seenCount,
} from '../lib/srs';
import { ChoiceButton, type ChoiceVisual } from '../components/ChoiceButton';
import { StatsBar } from '../components/StatsBar';
import { colors, radius, spacing } from '../theme';
import type { Pos, Progress, Question, Word } from '../types';

const WORDS = wordsData as Word[];

const POS_LABEL: Record<Pos, string> = {
  noun: '名詞',
  verb: '動詞',
  adj: '形容詞',
  adv: '副詞',
  prep: '前置詞',
  conj: '接続詞',
  pron: '代名詞',
  phrase: '熟語',
};

export function QuizScreen() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  // 起動時：進捗を読み込み、最初の問題を作る
  useEffect(() => {
    (async () => {
      const p = await loadProgress();
      const word = selectNextWord(WORDS, p);
      setProgress(p);
      setQuestion(buildQuestion(word, WORDS));
    })();
  }, []);

  const answered = selected !== null;
  const isCorrect = answered && question !== null && selected === question.answerIndex;

  const onSelect = useCallback(
    (index: number) => {
      if (selected !== null || !question || !progress) return;
      setSelected(index);
      const correct = index === question.answerIndex;
      const updated = applyAnswer(progress, question.word.id, correct);
      setProgress(updated);
      void saveProgress(updated);
    },
    [selected, question, progress],
  );

  const onNext = useCallback(() => {
    if (!progress || !question) return;
    const word = selectNextWord(WORDS, progress, Date.now(), question.word.id);
    setQuestion(buildQuestion(word, WORDS));
    setSelected(null);
  }, [progress, question]);

  const accuracy = useMemo(() => {
    if (!progress || progress.totalAnswered === 0) return 0;
    return progress.totalCorrect / progress.totalAnswered;
  }, [progress]);

  if (!progress || !question) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const w = question.word;
  const promptHint =
    question.direction === 'en2ja' ? 'この単語の意味は？' : 'この意味を表す英単語は？';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StatsBar
          streak={progress.streak}
          accuracy={accuracy}
          seen={seenCount(progress)}
          mastered={masteredCount(progress)}
          total={WORDS.length}
        />

        <View style={styles.promptCard}>
          <Text style={styles.promptHint}>{promptHint}</Text>
          <Text
            style={[
              styles.prompt,
              question.direction === 'ja2en' && styles.promptJa,
            ]}
          >
            {question.prompt}
          </Text>
        </View>

        <View>
          {question.choices.map((choice, i) => {
            let visual: ChoiceVisual = 'idle';
            if (answered) {
              if (i === question.answerIndex) visual = 'correct';
              else if (i === selected) visual = 'wrong';
              else visual = 'muted';
            }
            return (
              <ChoiceButton
                key={`${choice}-${i}`}
                label={choice}
                visual={visual}
                disabled={answered}
                onPress={() => onSelect(i)}
              />
            );
          })}
        </View>

        {answered && (
          <View
            style={[
              styles.feedback,
              isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Text
              style={[
                styles.feedbackTitle,
                { color: isCorrect ? colors.correct : colors.wrong },
              ]}
            >
              {isCorrect ? '正解！' : '不正解'}
            </Text>

            <View style={styles.explainRow}>
              <Text style={styles.explainWord}>{w.word}</Text>
              <View style={styles.posTag}>
                <Text style={styles.posText}>{POS_LABEL[w.pos]}</Text>
              </View>
            </View>
            <Text style={styles.explainMeaning}>{w.meaning}</Text>

            <Text style={styles.exampleEn}>{w.example}</Text>
            <Text style={styles.exampleJa}>{w.exampleJa}</Text>
          </View>
        )}
      </ScrollView>

      {answered && (
        <View style={styles.footer}>
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          >
            <Text style={styles.nextLabel}>次の問題へ</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing(2),
    paddingBottom: spacing(3),
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(2),
    marginVertical: spacing(2.5),
    alignItems: 'center',
  },
  promptHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing(1.5),
  },
  prompt: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  promptJa: {
    fontSize: 26,
  },
  feedback: {
    marginTop: spacing(2),
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing(2),
  },
  feedbackCorrect: {
    backgroundColor: colors.correctBg,
    borderColor: colors.correct,
  },
  feedbackWrong: {
    backgroundColor: colors.wrongBg,
    borderColor: colors.wrong,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing(1),
  },
  explainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  explainWord: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  posTag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(1),
    paddingVertical: 2,
  },
  posText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  explainMeaning: {
    color: colors.text,
    fontSize: 16,
    marginTop: 2,
    marginBottom: spacing(1.5),
  },
  exampleEn: {
    color: colors.text,
    fontSize: 15,
    fontStyle: 'italic',
  },
  exampleJa: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    padding: spacing(2),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    alignItems: 'center',
  },
  nextBtnPressed: {
    opacity: 0.85,
  },
  nextLabel: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },
});
