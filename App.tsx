import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import wordsData from './src/data/words.json';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { loadProgress, saveProgress } from './src/lib/srs';
import { modeTitle, poolFor, type Mode } from './src/lib/pools';
import { colors } from './src/theme';
import type { Progress, Word } from './src/types';

const WORDS = wordsData as Word[];

/** クイズ中のセッション。pool は開始時に固定（回答中に作り直さない）。 */
interface Session {
  mode: Mode;
  pool: Word[];
}

export default function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [session, setSession] = useState<Session | null>(null); // null = TOP画面

  // 起動時に進捗を読み込む
  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  // 進捗が変わるたびに保存（端末ローカル）
  useEffect(() => {
    if (progress) void saveProgress(progress);
  }, [progress]);

  // モード開始：その時点のプールをスナップショットして固定する
  const startMode = (mode: Mode) => {
    if (!progress) return;
    setSession({ mode, pool: poolFor(mode, WORDS, progress) });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!progress ? (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : session === null ? (
        <HomeScreen words={WORDS} progress={progress} onStart={startMode} />
      ) : (
        <QuizScreen
          words={session.pool}
          progress={progress}
          onProgressChange={setProgress}
          onBack={() => setSession(null)}
          title={modeTitle(session.mode)}
        />
      )}
    </SafeAreaProvider>
  );
}
