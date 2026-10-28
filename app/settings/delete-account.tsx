import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ConfirmModal } from '../../src/components/ConfirmModal';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, deleteAccount } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const res = await deleteAccount();
    setLoading(false);

    if (res.success) {
      setShowConfirm(false);
      Alert.alert(
        'Account Deleted',
        'Your account and all associated designs and profile data have been deleted.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }]
      );
    } else {
      setShowConfirm(false);
      setError(res.error || 'Failed to delete account. Please sign in again and retry.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Delete Account" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning-outline" size={44} color={Colors.error} />
        </View>

        <Text style={styles.heading}>Permanent Account Deletion</Text>
        <Text style={styles.subtitle}>
          This is an irreversible action. Once your account is deleted, your data cannot be recovered.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Card style={styles.card} variant="elevated">
          <Text style={styles.listTitle}>The following data will be permanently purged:</Text>
          <View style={styles.itemRow}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.itemText}>User profile details, credentials, and verification records</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.itemText}>All uploaded room photos from Firebase Storage</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.itemText}>All generated AI design variants and saved reports</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <Text style={styles.itemText}>All 3D spatial settings and custom material configurations</Text>
          </View>
        </Card>

        <View style={styles.actionStack}>
          <Button
            title="I Understand, Delete My Account"
            variant="danger"
            onPress={() => setShowConfirm(true)}
            style={styles.actionBtn}
          />
          <Button
            title="Cancel & Return to Settings"
            variant="outline"
            onPress={() => router.back()}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        title="Final Account Deletion Confirmation"
        message="Are you completely sure you want to permanently delete your account and all saved spaces? This action cannot be undone."
        confirmLabel="Permanently Delete"
        isDestructive
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  errorBox: {
    width: '100%',
    backgroundColor: Colors.errorBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  card: {
    width: '100%',
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  actionStack: {
    width: '100%',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
