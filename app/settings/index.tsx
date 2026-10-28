import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const handleSignout = async () => {
    setShowSignoutModal(false);
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section: Account & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account & Security</Text>
          <Card style={styles.card} variant="elevated">
            <View style={styles.infoRow}>
              <Text style={styles.label}>Logged in as</Text>
              <Text style={styles.value}>{user?.email || 'Guest User'}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings/privacy')}
            >
              <Text style={styles.menuText}>Privacy & Data Protection</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings/delete-account')}
            >
              <Text style={[styles.menuText, { color: Colors.error }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.error} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section: Appearance (Light Theme Policy) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Visual Theme</Text>
          <Card style={styles.card} variant="elevated">
            <View style={styles.themeRow}>
              <View>
                <Text style={styles.themeTitle}>Pure Light Theme</Text>
                <Text style={styles.themeSubtitle}>Natural, architectural interior palette</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Always Active</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Section: Support */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Support & Resources</Text>
          <Card style={styles.card} variant="elevated">
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings/help')}
            >
              <Text style={styles.menuText}>Help Center & FAQs</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section: About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About YClick</Text>
          <Card style={styles.card} variant="elevated">
            <View style={styles.infoRow}>
              <Text style={styles.label}>Application Version</Text>
              <Text style={styles.value}>1.0.0 (Production Release)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Architecture</Text>
              <Text style={styles.value}>React Native • Expo • FastAPI</Text>
            </View>
          </Card>
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => setShowSignoutModal(true)}
          style={styles.signOutBtn}
        />
      </ScrollView>

      <ConfirmModal
        visible={showSignoutModal}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out from your account?"
        confirmLabel="Sign Out"
        onConfirm={handleSignout}
        onCancel={() => setShowSignoutModal(false)}
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
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  themeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadiusSm,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  signOutBtn: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
