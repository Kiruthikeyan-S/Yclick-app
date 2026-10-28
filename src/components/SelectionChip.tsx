import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, Shadows } from '../theme/spacing';

interface SelectionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const SelectionChip: React.FC<SelectionChipProps> = ({
  label,
  selected,
  onPress,
  style,
  iconName,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        selected ? Shadows.subtle : null,
        style,
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark-circle" size={16} color={Colors.textLight} style={styles.icon} />
      ) : iconName ? (
        <Ionicons
          name={iconName}
          size={16}
          color={Colors.textSecondary}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.unselectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: Spacing.borderRadiusLg,
    borderWidth: 1.5,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  unselectedChip: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  unselectedLabel: {
    color: Colors.textPrimary,
  },
  selectedLabel: {
    color: Colors.textLight,
  },
});
