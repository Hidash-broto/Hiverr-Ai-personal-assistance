import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const InitialLayout = () => {
  const { token, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (token && !inAuthGroup) {
      router.replace("/(app)/(tabs)");
    } else if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token, initialized]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        {/* Uncomment the SafeAreaView if you want to apply safe area insets */}
        {/* <SafeAreaView> */}
        <InitialLayout />
        <Toast position="top" />
        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </AuthProvider>
  );
}