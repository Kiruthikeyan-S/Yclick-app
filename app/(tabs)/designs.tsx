import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ConfirmModal } from '../../src/components/ConfirmModal';
import { DesignProject } from '../../src/types';

export default function MyDesignsScreen() {
  const router = useRouter();
  const { savedProjects, deleteProject, resetWorkflow } = useDesignProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProjects = savedProjects.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.preferences.style.toLowerCase().includes(query) ||
      p.preferences.categoryId.toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (projectToDelete) {
      setDeleting(true);
      await deleteProject(projectToDelete);
      setDeleting(false);
      setProjectToDelete(null);
    }
  };

  const renderProjectItem = ({ item }: { item: DesignProject }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card style={styles.card} variant="elevated">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            router.push({
              pathname: '/design/details',
              params: { projectId: item.id },
            });
          }}
        >
          <Image
            source={{ uri: item.variants[0]?.imageUrl || item.originalPhotoUri }}
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.titleArea}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.preferences.style} • {item.preferences.subcategoryId.replace('-', ' ')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteIconBtn}
                onPress={() => setProjectToDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>Created {formattedDate}</Text>
              <Text style={styles.viewDetailsText}>View Design →</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Designs</Text>
        <Text style={styles.headerSubtitle}>
          {savedProjects.length} saved space {savedProjects.length === 1 ? 'project' : 'projects'}
        </Text>
      </View>

      {savedProjects.length > 0 ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by space, style or room..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            iconName="images-outline"
            title="No designs saved yet"
            description="Take a photo of your space to visualize design options and receive practical layout recommendations."
            actionTitle="Start New Design"
            onActionPress={() => {
              resetWorkflow();
              router.push({
                pathname: '/design/category',
                params: { categoryId: 'home-rooms' },
              });
            }}
          />
        }
      />

      <ConfirmModal
        visible={projectToDelete !== null}
        title="Delete Design Project"
        message="Are you sure you want to delete this design? All generated options, improvement reports, and 3D customizations will be permanently deleted."
        confirmLabel="Delete"
        isDestructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.screenPadding,
    gap: Spacing.md,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 170,
    backgroundColor: Colors.subtleBackground,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
