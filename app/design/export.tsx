import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function ExportScreen() {
  const router = useRouter();
  const { currentProject } = useDesignProject();
  const [sharing, setSharing] = useState(false);

  const handleShareReport = async () => {
    if (!currentProject) return;

    try {
      setSharing(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Native file sharing is not supported on this device/environment.');
        setSharing(false);
        return;
      }

      // Compile report as text file
      let reportText = `YCLICK - PRACTICAL INTERIOR DESIGN REPORT\n`;
      reportText += `Project: ${currentProject.title}\n`;
      reportText += `Created: ${new Date(currentProject.createdAt).toLocaleDateString()}\n`;
      reportText += `Style: ${currentProject.preferences.style}\n`;
      reportText += `Budget Target: ${currentProject.preferences.budgetChoice}\n\n`;
      reportText += `PRIORITIZED IMPROVEMENT ACTIONS:\n`;
      reportText += `=================================\n\n`;

      currentProject.suggestions.forEach((s) => {
        reportText += `${s.order}. ${s.title} [Priority: ${s.priority} | Effort: ${s.difficulty}]\n`;
        reportText += `   Why it matters: ${s.whyItMatters}\n`;
        reportText += `   Action: ${s.recommendedAction}\n`;
        reportText += `   Materials: ${s.materialsNeeded.join(', ')}\n`;
        if (s.estimatedCostRange) {
          reportText += `   Estimated Cost: ${s.estimatedCostRange}\n`;
        }
        reportText += `\n`;
      });

      reportText += `DISCLAIMER:\n`;
      reportText += `Recommendations are based on visual spatial analysis. Always consult licensed contractors for structural and electrical work.\n`;

      const fileUri = `${FileSystem.cacheDirectory}YClick-Report-${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, reportText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share YClick Improvement Report',
      });

      setSharing(false);
    } catch (err: any) {
      setSharing(false);
      Alert.alert('Export Error', err.message || 'Could not complete report export.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Export & Share" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="share-social-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.heading}>Share Your Design Project</Text>
        <Text style={styles.subtitle}>
          Export a complete, structured summary of your space redesign to share with family, architects, or interior contractors.
        </Text>

        <Card style={styles.includedCard} variant="elevated">
          <Text style={styles.includedTitle}>What's Included in Export:</Text>
          <View style={styles.itemRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.itemText}>Original space specifications and style preferences</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.itemText}>Prioritized step-by-step action plan</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.itemText}>Required materials checklist and budget ranges</Text>
          </View>
          <View style={styles.itemRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.itemText}>Curated interior product references</Text>
          </View>
        </Card>

        <View style={styles.buttonStack}>
          <Button
            title="Share Improvement Report (Text)"
            onPress={handleShareReport}
            loading={sharing}
            icon={<Ionicons name="share-outline" size={18} color={Colors.textLight} />}
            style={styles.actionBtn}
          />
          <Button
            title="Return to Design Results"
            variant="outline"
            onPress={() => router.back()}
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
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.subtleBackground,
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
  includedCard: {
    width: '100%',
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  includedTitle: {
    fontSize: 15,
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
  buttonStack: {
    width: '100%',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
