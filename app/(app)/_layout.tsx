import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

export default function AppLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)/create-task" />
    </Stack>
  );
}
