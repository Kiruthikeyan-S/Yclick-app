import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ConfirmModal } from '../../src/components/ConfirmModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { savedProjects } = useDesignProject();

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setConfirmLogout(false);
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.appBar}>
          <Text style={styles.headerTitle}>User Profile</Text>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* User Card - Stitch Style */}
        <Card style={styles.profileCard} variant="floating">
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(user?.displayName || 'Saravanaraj').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'Saravanaraj'}</Text>
          <Text style={styles.userLocation}>Bengaluru, Karnataka • Spatial Studio Pro</Text>
          <Text style={styles.userEmail}>{user?.email || 'saravanaraj@example.com'}</Text>

          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
            <Text style={styles.verifiedText}>Firebase Verified Account</Text>
          </View>

          {/* 4 Spatial Telemetry Cards */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>4</Text>
              <Text style={styles.metricLabel}>Spaces Transformed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{Math.max(savedProjects.length, 12)}</Text>
              <Text style={styles.metricLabel}>Saved Concepts</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>94%</Text>
              <Text style={styles.metricLabel}>Spatial Fit Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>₹42k</Text>
              <Text style={styles.metricLabel}>Budget Saved</Text>
            </View>
          </View>

          <Button
            title="Start New Redesign"
            onPress={() => router.push('/design/category')}
            icon={<Ionicons name="camera-outline" size={17} color={Colors.textLight} />}
            style={styles.newDesignBtn}
          />
        </Card>

        {/* Settings & Configuration Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Studio Architecture & Cloud</Text>

          <Card style={styles.menuCard} variant="elevated">
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(tabs)/designs')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="images-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Saved Spaces & Projects</Text>
                  <Text style={styles.menuSubtitle}>{savedProjects.length} spaces ready to inspect</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="cloud-done-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Storage Infrastructure</Text>
                  <Text style={styles.menuSubtitle}>Supabase Private Storage & Database (Active)</Text>
                </View>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="sunny-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Visual Theme</Text>
                  <Text style={styles.menuSubtitle}>Pure Light Mode (Strict Mandate)</Text>
                </View>
              </View>
              <Text style={styles.fixedTag}>Fixed</Text>
            </View>
          </Card>
        </View>

        {/* Security & Logout */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security & Account</Text>

          <Card style={styles.menuCard} variant="elevated">
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings/privacy')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Privacy & Data Consent</Text>
                  <Text style={styles.menuSubtitle}>Photo processing & consent controls</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => setConfirmLogout(true)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                </View>
                <Text style={[styles.menuTitle, { color: Colors.error }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <ConfirmModal
        visible={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of YClick Studio?"
        confirmLabel="Sign Out"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
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
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.raised,
  },
  avatarInitials: {
    color: Colors.textLight,
    fontSize: 28,
    fontWeight: '900',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  userLocation: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginTop: 8,
    marginBottom: Spacing.md,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: 10.5,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: Spacing.md,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: Colors.subtleBackground,
    borderRadius: Spacing.borderRadiusMd,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  newDesignBtn: {
    width: '100%',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    paddingLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  fixedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
