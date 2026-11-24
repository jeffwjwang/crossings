import 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider } from '@/src/ui/settings';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Atkinson: require('../assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    AtkinsonBold: require('../assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
  });
  const [showBrand, setShowBrand] = useState(true);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (!fontsLoaded) return undefined;
    void SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowBrand(false), 900);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <SettingsProvider>
          <View style={styles.frame}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="puzzle/[id]" />
            </Stack>
          </View>
          {showBrand ? (
            <View style={styles.brand} accessibilityRole="header">
              <Text style={styles.title}>Crossings</Text>
              <Text style={styles.by}>by Vervia</Text>
            </View>
          ) : null}
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#1b1822' },
  frame: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: '#efe3c8' },
  brand: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1b1822',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontFamily: 'AtkinsonBold', fontSize: 52 },
  by: { color: '#ffd96a', fontFamily: 'Atkinson', fontSize: 22, marginTop: 8 },
});
