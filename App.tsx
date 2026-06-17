import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QuizScreen } from './src/screens/QuizScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QuizScreen />
    </SafeAreaProvider>
  );
}
