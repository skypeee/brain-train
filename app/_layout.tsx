import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { ErrorBoundary } from '../src/components/layout/ErrorBoundary';
import { AuthProvider } from '../src/supabase/auth';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <View className="flex-1 bg-white dark:bg-gray-950">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="auth/sign-in"
                options={{ presentation: 'modal', headerShown: true, title: 'Sign In' }}
              />
              <Stack.Screen
                name="auth/sign-up"
                options={{ presentation: 'modal', headerShown: true, title: 'Sign Up' }}
              />
            </Stack>
          </View>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
