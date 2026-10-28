import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Privacy & Data Policy" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <Card style={styles.card} variant="subtle">
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Our Commitment to Your Privacy</Text>
          </View>
          <Text style={styles.cardBody}>
            YClick processes photographs exclusively to generate architectural redesign recommendations, layout alternatives, and 3D previews for your account.
          </Text>
        </Card>

        {/* Section: Which photos are uploaded */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. Which Photos Are Uploaded?</Text>
          <Text style={styles.sectionBody}>
            Only the specific space images you actively capture or select from your gallery and confirm with explicit consent are uploaded. YClick never scans background photos or silent camera feeds.
          </Text>
        </View>

        {/* Section: Processing services */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>2. Processing Services & Architecture</Text>
          <Text style={styles.sectionBody}>
            Photos are transmitted through encrypted HTTPS channels to our Python FastAPI server and stored in your authenticated user directory on Firebase Storage. Spatial analysis is performed via server-side AI providers without exposing API keys to the client.
          </Text>
        </View>

        {/* Section: Retention & Deletion */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>3. Data Retention & Control</Text>
          <Text style={styles.sectionBody}>
            Your uploaded photos and generated design alternatives are stored in your private account history so you can review and export them at any time. When you delete a design project, the Firestore metadata and associated storage images are permanently purged.
          </Text>
        </View>

        {/* Section: Account Deletion */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>4. Account & Data Purging</Text>
          <Text style={styles.sectionBody}>
            You have the right to delete your entire account and all associated personal records at any time through the Account Deletion screen.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionStack}>
          <Button
            title="Manage & Delete Saved Designs"
            variant="outline"
            onPress={() => router.push('/(tabs)/designs')}
            style={styles.actionBtn}
          />
          <Button
            title="Delete Account & All Data"
            variant="danger"
            onPress={() => router.push('/settings/delete-account')}
            style={styles.actionBtn}
          />
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
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  actionStack: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    width: '100%',
  },
});
