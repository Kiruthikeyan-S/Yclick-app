import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Header } from '../../src/components/Header';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Failed to sign in.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Sign In" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to view your spaces and designs.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={() => {
              loginAsGuest();
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.guestBtnText}>Continue as Guest / Preview →</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.screenPadding,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: Colors.errorBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  guestBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  guestBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});
