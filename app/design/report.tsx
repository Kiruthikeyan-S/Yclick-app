import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function PracticalReportScreen() {
  const router = useRouter();
  const { currentProject } = useDesignProject();

  const suggestions = currentProject?.suggestions || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Practical Improvement Report"
        subtitle="Prioritized architectural actions"
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.actionCircleBtn}
            onPress={() => router.push('/design/export')}
          >
            <Ionicons name="share-outline" size={19} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Overview Card */}
        <Card style={styles.overviewCard} variant="floating">
          <View style={styles.overviewHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>Structured Renovation Roadmap</Text>
              <Text style={styles.overviewSubtitle}>Organized by execution sequence</Text>
            </View>
          </View>
          <Text style={styles.overviewDesc}>
            These recommendations maximize spatial comfort and visual transformation while preventing unnecessary furniture replacement.
          </Text>
        </Card>

        {/* List of Suggestions */}
        {suggestions.map((item) => (
          <Card key={item.id} style={styles.suggestionCard} variant="elevated">
            <View style={styles.cardHeader}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNumber}>0{item.order}</Text>
              </View>
              <View style={styles.titleWrap}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.tagsRow}>
                  <Badge
                    label={`Priority: ${item.priority}`}
                    variant={item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'secondary'}
                  />
                  <Badge
                    label={`Effort: ${item.difficulty}`}
                    variant={item.difficulty === 'Easy' ? 'success' : item.difficulty === 'Moderate' ? 'primary' : 'outline'}
                  />
                </View>
              </View>
            </View>

            {/* Why it matters */}
            <View style={styles.detailBlock}>
              <Text style={styles.sectionLabel}>WHY IT MATTERS</Text>
              <Text style={styles.sectionValue}>{item.whyItMatters}</Text>
            </View>

            {/* Recommended Action */}
            <View style={styles.actionBlock}>
              <Text style={styles.actionLabel}>RECOMMENDED ACTION</Text>
              <Text style={styles.actionValue}>{item.recommendedAction}</Text>
            </View>

            {/* Materials & Cost */}
            <View style={styles.metaRow}>
              <View style={styles.materialsCol}>
                <Text style={styles.metaLabel}>ITEMS & MATERIALS NEEDED</Text>
                {item.materialsNeeded.map((mat, idx) => (
                  <Text key={idx} style={styles.matItem}>• {mat}</Text>
                ))}
              </View>

              {item.estimatedCostRange ? (
                <View style={styles.costBox}>
                  <Text style={styles.costLabel}>EST. COST</Text>
                  <Text style={styles.costVal}>{item.estimatedCostRange}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        ))}

        {/* Professional Work Disclaimer */}
        <Card style={styles.disclaimerCard} variant="outlined">
          <View style={styles.disclaimerHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.disclaimerTitle}>Professional Contractor Notice</Text>
          </View>
          <Text style={styles.disclaimerText}>
            Recommendations are based on visual spatial analysis. Always consult licensed contractors for structural changes, concealed plumbing, and high-voltage electrical wiring.
          </Text>
        </Card>

        {/* Navigation Actions */}
        <View style={styles.bottomButtons}>
          <Button
            title="Browse Recommended Products"
            onPress={() => router.push('/design/products')}
            style={styles.actionBtn}
          />
          <Button
            title="Export & Share Report"
            variant="outline"
            onPress={() => router.push('/design/export')}
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
    gap: Spacing.md,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCard: {
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  overviewSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  overviewDesc: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  suggestionCard: {
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusLg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
    ...Shadows.subtle,
  },
  orderNumber: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '900',
  },
  titleWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  detailBlock: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18.5,
  },
  actionBlock: {
    backgroundColor: Colors.subtleBackground,
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18.5,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  materialsCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  matItem: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  costBox: {
    alignItems: 'flex-end',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.2,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Spacing.borderRadiusSm,
    ...Shadows.subtle,
  },
  costLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  costVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: Colors.primary,
  },
  disclaimerCard: {
    padding: Spacing.md,
    backgroundColor: Colors.subtleBackground,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 3,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16.5,
  },
  bottomButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    width: '100%',
  },
});
