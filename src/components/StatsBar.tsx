// 画面上部の進捗バー。連続日数・正答率・習得状況を表示。

import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  streak: number;
  accuracy: number; // 0..1
  seen: number;
  mastered: number;
  total: number;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function StatsBar({ streak, accuracy, seen, mastered, total }: Props) {
  return (
    <View style={styles.row}>
      <Stat value={`${streak}日`} label="連続" />
      <Stat value={`${Math.round(accuracy * 100)}%`} label="正答率" />
      <Stat value={`${seen}/${total}`} label="学習済み" />
      <Stat value={`${mastered}`} label="習得" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(1.5),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
