// 英単語・英文を読み上げるスピーカーボタン（端末のTTS / expo-speech）。

import * as Speech from 'expo-speech';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  /** 読み上げる英語テキスト */
  text: string;
  /** ボタンサイズ */
  size?: 'sm' | 'md';
}

export function SpeakButton({ text, size = 'md' }: Props) {
  const speak = () => {
    Speech.stop(); // 連打時に重ならないよう止めてから
    Speech.speak(text, { language: 'en-US', rate: 0.95 });
  };

  const dim = size === 'sm' ? 30 : 40;

  return (
    <Pressable
      onPress={speak}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`${text} を読み上げる`}
      style={({ pressed }) => [
        styles.btn,
        { width: dim, height: dim, borderRadius: dim / 2 },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.icon, { fontSize: size === 'sm' ? 15 : 19 }]}>🔊</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    // 絵文字をボタン中央に
    textAlign: 'center',
  },
});
