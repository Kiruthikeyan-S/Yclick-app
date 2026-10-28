import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { ConfirmModal } from '../../src/components/ConfirmModal';

export default function DesignDetailsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const { loadProjectById, deleteProject } = useDesignProject();

  const project = loadProjectById(projectId as string);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Design Details" onBackPress={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Project not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    await deleteProject(project.id);
    setDeleting(false);
    setShowDeleteModal(false);
    router.replace('/(tabs)/designs');
  };

  const selectedVariant = project.variants.find(v => v.id === project.selectedVariantId) || project.variants[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={project.title}
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <Card style={styles.heroCard} variant="elevated">
          <Image
            source={{ uri: selectedVariant?.imageUrl || project.originalPhotoUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.badgeRow}>
            <Badge label={project.preferences.style} variant="primary" />
            <Badge label={project.preferences.categoryId.replace('-', ' ')} variant="secondary" />
          </View>
        </Card>

        {/* Project Header Info */}
        <View style={styles.infoBlock}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.date}>
            Created on {new Date(project.createdAt).toLocaleDateString()} • Target Budget: {project.preferences.budgetChoice}
          </Text>
        </View>

        {/* Navigation Quicklinks */}
        <View style={styles.linksGrid}>
          <TouchableOpacity
            style={styles.linkTile}
            onPress={() => router.push('/design/results')}
          >
            <Ionicons name="images-outline" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>View Redesign Options</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkTile}
            onPress={() => router.push('/design/report')}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>Improvement Report ({project.suggestions.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkTile}
            onPress={() => router.push('/design/three-d')}
          >
            <Ionicons name="cube-outline" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>Interactive 3D Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkTile}
            onPress={() => router.push('/design/products')}
          >
            <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>Recommended Products ({project.products.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Preferences Summary */}
        <Card style={styles.prefCard} variant="subtle">
          <Text style={styles.prefHeading}>Configured Preferences</Text>
          <Text style={styles.prefLine}>• Category: {project.preferences.categoryId} / {project.preferences.subcategoryId}</Text>
          <Text style={styles.prefLine}>• Preserved: {project.preferences.itemsToKeep.join(', ') || 'None specified'}</Text>
          <Text style={styles.prefLine}>• Goals: {project.preferences.improvementGoals.join(', ') || 'General'}</Text>
          {project.preferences.roomMeasurements ? (
            <Text style={styles.prefLine}>• Dimensions: {project.preferences.roomMeasurements}</Text>
          ) : null}
        </Card>

        {/* Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Export / Share Project"
            onPress={() => router.push('/design/export')}
            style={styles.btn}
          />
          <Button
            title="Delete Design"
            variant="danger"
            onPress={() => setShowDeleteModal(true)}
            style={styles.btn}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Design Project"
        message="This action will permanently remove this design project, including all generated visual variants, improvement suggestions, and 3D scene customizations."
        confirmLabel="Delete"
        isDestructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
    height: 220,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  infoBlock: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  linksGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  linkTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  prefCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  prefHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  prefLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomActions: {
    gap: Spacing.sm,
  },
  btn: {
    width: '100%',
  },
});
