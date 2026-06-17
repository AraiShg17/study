// 4択の1つ。回答前は通常表示、回答後は正解/不正解を色で示す。

import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type ChoiceVisual = 'idle' | 'correct' | 'wrong' | 'muted';

interface Props {
  label: string;
  visual: ChoiceVisual;
  disabled: boolean;
  onPress: () => void;
}

function ChoiceButtonBase({ label, visual, disabled, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        visual === 'correct' && styles.correct,
        visual === 'wrong' && styles.wrong,
        visual === 'muted' && styles.muted,
        pressed && visual === 'idle' && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          visual === 'correct' && styles.labelStrong,
          visual === 'wrong' && styles.labelStrong,
          visual === 'muted' && styles.labelMuted,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing(2.25),
    paddingHorizontal: spacing(2),
    marginBottom: spacing(1.5),
  },
  pressed: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  correct: {
    backgroundColor: colors.correctBg,
    borderColor: colors.correct,
  },
  wrong: {
    backgroundColor: colors.wrongBg,
    borderColor: colors.wrong,
  },
  muted: {
    opacity: 0.5,
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelStrong: {
    color: colors.text,
    fontWeight: '700',
  },
  labelMuted: {
    color: colors.textMuted,
  },
});

export const ChoiceButton = memo(ChoiceButtonBase);
