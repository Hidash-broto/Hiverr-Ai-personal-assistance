import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const InitialLayout = () => {
  const { token, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    console.log(segments, 'inAuthGroup')

    if (token && !inAuthGroup) {
      router.replace("/(app)");
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
        {/* <SafeAreaView> */}
          <InitialLayout />
        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </AuthProvider>
  );
}