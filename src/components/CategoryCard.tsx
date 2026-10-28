import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpaceCategory } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, Shadows } from '../theme/spacing';

interface CategoryCardProps {
  category: SpaceCategory;
  onPress: () => void;
  selected?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.card,
        selected ? styles.selectedCard : null,
      ]}
    >
      <View style={[styles.iconContainer, selected ? styles.selectedIconContainer : null]}>
        <Ionicons
          name={category.iconName as any}
          size={24}
          color={selected ? Colors.textLight : Colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{category.name}</Text>
          <View style={styles.subCountBadge}>
            <Text style={styles.subCountText}>{category.subcategories.length} spaces</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      </View>
      <View style={styles.chevronCircle}>
        <Ionicons name="arrow-forward" size={16} color={selected ? Colors.primary : Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.subtleBackground,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  subCountBadge: {
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Spacing.borderRadiusSm,
  },
  subCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
