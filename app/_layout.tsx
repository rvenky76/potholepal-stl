import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useStore } from '@/store/AppStore';
import { ThemeProvider, useTheme } from '@/ui/theme';

function ThemedApp() {
  const { settings } = useStore();
  const os = useColorScheme();
  const resolved = settings.theme === 'system' ? (os === 'light' ? 'light' : 'dark') : settings.theme;
  return (
    <ThemeProvider resolvedMode={resolved}>
      <ThemedStack />
    </ThemeProvider>
  );
}

function ThemedStack() {
  const { colors, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
