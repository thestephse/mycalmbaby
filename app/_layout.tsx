import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import AudioManager from './utils/AudioManager';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const startAudio = async () => {
      await AudioManager.initialize();
      await AudioManager.startWhiteNoise();
    };

    startAudio();

    return () => {
      AudioManager.cleanup();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="main-menu" />
        <Stack.Screen name="animation" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#FFFFFF" />
    </>
  );
}
