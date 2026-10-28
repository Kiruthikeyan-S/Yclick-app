import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function ReviewScreen() {
  const router = useRouter();
  const { preferences } = useDesignProject();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Review Design Request" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Card */}
        <Card style={styles.photoCard} variant="elevated">
          {preferences.photoUri ? (
            <Image source={{ uri: preferences.photoUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No photo selected</Text>
            </View>
          )}
          <View style={styles.photoOverlay}>
            <Badge label="Original Space" variant="primary" />
          </View>
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.cardHeader}>Configuration Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Space Category:</Text>
            <Text style={styles.val}>{preferences.categoryId.replace('-', ' ')} ({preferences.subcategoryId.replace('-', ' ')})</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Selected Style:</Text>
            <Text style={styles.val}>{preferences.style}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Target Budget:</Text>
            <Text style={styles.val}>
              {preferences.budgetChoice === 'Custom budget' ? preferences.customBudget : preferences.budgetChoice}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subHeader}>Items to Preserve:</Text>
          <View style={styles.pillWrap}>
            {preferences.itemsToKeep.length > 0 ? (
              preferences.itemsToKeep.map((item, idx) => (
                <View key={idx} style={styles.pill}>
                  <Text style={styles.pillText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>No items specifically marked to keep.</Text>
            )}
          </View>

          <Text style={styles.subHeader}>Improvement Goals:</Text>
          <View style={styles.pillWrap}>
            {preferences.improvementGoals.length > 0 ? (
              preferences.improvementGoals.map((g, idx) => (
                <View key={idx} style={styles.pill}>
                  <Text style={styles.pillText}>{g}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>General optimization.</Text>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Generate 3 Design Options"
            onPress={() => router.push('/design/generating')}
            icon={<Ionicons name="layers-outline" size={18} color={Colors.textLight} />}
            style={styles.generateBtn}
          />
          <Button
            title="Edit Preferences"
            variant="outline"
            onPress={() => router.back()}
            style={styles.editBtn}
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
  photoCard: {
    padding: 0,
    overflow: 'hidden',
    height: 220,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  photoOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  summaryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  val: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  subHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  pill: {
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadiusSm,
  },
  pillText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    gap: Spacing.sm,
  },
  generateBtn: {
    width: '100%',
  },
  editBtn: {
    width: '100%',
  },
});
