import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface AuthContextType {
    token: string | null;
    saveToken: (newToken: string) => Promise<void>;
    deleteToken: () => Promise<void>;
    isLoading: boolean;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

 export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('authToken');
                setToken(storedToken);
            } catch (error) {
                console.error('Failed to load token:', error);
            } finally {
                setIsLoading(false);
                setInitialized(true);
            }
        };
        loadToken();
    }, []);

    const saveToken = async (token: string) => {
        setToken(token);
        await SecureStore.setItemAsync('token', token);
        return token;
    }

    const deleteToken = async () => {
        setToken(null);
        await SecureStore.deleteItemAsync('token');
    }

    if (isLoading) {
        // Optional: Show a splash screen or loading indicator while checking auth state
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ token, saveToken, deleteToken, isLoading, initialized }}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthContext