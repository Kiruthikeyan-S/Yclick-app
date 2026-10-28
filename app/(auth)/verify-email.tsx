import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Header } from '../../src/components/Header';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, resendVerification, refreshUser } = useAuth();

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setNotice(null);
    const res = await resendVerification();
    setResending(false);
    if (res.success) {
      setNotice('Verification email sent! Check your inbox and spam folder.');
    } else {
      setNotice(res.error || 'Failed to resend email.');
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Verify Email" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={48} color={Colors.primary} />
          </View>

          <Text style={styles.heading}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{' '}
            <Text style={styles.emailHighlight}>{user?.email || 'your email'}</Text>.
            Verifying your address secures your saved designs and account metadata.
          </Text>

          {notice ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.buttonStack}>
            <Button
              title="I've Verified My Email"
              onPress={handleCheck}
              loading={checking}
              style={styles.actionBtn}
            />

            <Button
              title="Resend Verification Email"
              variant="outline"
              onPress={handleResend}
              loading={resending}
              style={styles.actionBtn}
            />

            <Button
              title="Continue to Home"
              variant="ghost"
              onPress={() => router.replace('/(tabs)')}
              style={styles.actionBtn}
            />
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
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  noticeBox: {
    backgroundColor: Colors.subtleBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
    width: '100%',
  },
  noticeText: {
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
  },
  buttonStack: {
    width: '100%',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
