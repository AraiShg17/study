// TOP画面：レベル（初級/中級/上級）や復習モードを選んでクイズを始める。

import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LEVEL_LABEL,
  LEVEL_ORDER,
  poolFor,
  poolStats,
  type Mode,
} from '../lib/pools';
import { MAX_BOX } from '../lib/srs';
import { colors, radius, spacing } from '../theme';
import type { Level, Progress, Word } from '../types';

interface Props {
  words: Word[];
  progress: Progress;
  onStart: (mode: Mode) => void;
}

const LEVEL_DESC: Record<Level, string> = {
  beginner: '日常の超基本語',
  intermediate: '読解に効く中核語',
  advanced: '小説制覇クラス',
};

const LEVEL_ACCENT: Record<Level, string> = {
  beginner: '#2fbf71',
  intermediate: '#5b8cff',
  advanced: '#ffc857',
};

export function HomeScreen({ words, progress, onStart }: Props) {
  const overallAccuracy =
    progress.totalAnswered === 0 ? 0 : progress.totalCorrect / progress.totalAnswered;
  const reviewCount = poolFor({ kind: 'review' }, words, progress).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.appTitle}>英単語クイズ</Text>
        <Text style={styles.appSub}>4択でひたすら語彙を増やす</Text>

        {/* 全体サマリー */}
        <View style={styles.summary}>
          <Summary value={`${progress.streak}日`} label="連続" />
          <Summary value={`${Math.round(overallAccuracy * 100)}%`} label="正答率" />
          <Summary value={`${progress.totalAnswered}`} label="総回答" />
        </View>

        {/* レベル別 */}
        <Text style={styles.section}>レベルを選ぶ</Text>
        {LEVEL_ORDER.map((level) => {
          const pool = poolFor({ kind: 'level', level }, words, progress);
          const st = poolStats(pool, progress, MAX_BOX);
          const disabled = st.total === 0;
          const ratio = st.total === 0 ? 0 : st.mastered / st.total;
          return (
            <Pressable
              key={level}
              disabled={disabled}
              onPress={() => onStart({ kind: 'level', level })}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: LEVEL_ACCENT[level] },
                pressed && styles.cardPressed,
                disabled && styles.cardDisabled,
              ]}
            >
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{LEVEL_LABEL[level]}</Text>
                <Text style={styles.cardCount}>
                  {disabled ? '準備中' : `${st.total}語`}
                </Text>
              </View>
              <Text style={styles.cardDesc}>{LEVEL_DESC[level]}</Text>
              {!disabled && (
                <>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(ratio * 100)}%`, backgroundColor: LEVEL_ACCENT[level] },
                      ]}
                    />
                  </View>
                  <Text style={styles.cardMeta}>
                    学習済み {st.seen}/{st.total}・習得 {st.mastered}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}

        {/* その他モード */}
        <Text style={styles.section}>その他</Text>
        <Pressable
          onPress={() => onStart({ kind: 'all' })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.modeBtn, pressed && styles.cardPressed]}
        >
          <Text style={styles.modeTitle}>全レベルミックス</Text>
          <Text style={styles.modeMeta}>{words.length}語からランダム出題</Text>
        </Pressable>

        <Pressable
          disabled={reviewCount === 0}
          onPress={() => onStart({ kind: 'review' })}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.modeBtn,
            pressed && styles.cardPressed,
            reviewCount === 0 && styles.cardDisabled,
          ]}
        >
          <Text style={styles.modeTitle}>苦手だけ復習</Text>
          <Text style={styles.modeMeta}>
            {reviewCount === 0 ? '対象なし（まず出題して間違えると貯まる）' : `${reviewCount}語が対象`}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(2.5), paddingBottom: spacing(4) },
  appTitle: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: spacing(1) },
  appSub: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: spacing(2.5) },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(2),
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  section: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing(3),
    marginBottom: spacing(1.5),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: spacing(2),
    marginBottom: spacing(1.5),
  },
  cardPressed: { backgroundColor: colors.surfaceAlt },
  cardDisabled: { opacity: 0.5 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cardCount: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  cardDesc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    marginTop: spacing(1.5),
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  cardMeta: { color: colors.textMuted, fontSize: 12, marginTop: spacing(1) },
  modeBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    marginBottom: spacing(1.5),
  },
  modeTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  modeMeta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
