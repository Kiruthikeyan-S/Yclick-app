import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'outline';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'warning':
        return styles.warningContainer;
      case 'error':
        return styles.errorContainer;
      case 'success':
        return styles.successContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'warning':
        return styles.warningText;
      case 'error':
        return styles.errorText;
      case 'success':
        return styles.successText;
      case 'outline':
        return styles.outlineText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <View style={[styles.baseContainer, getContainerStyle(), style]}>
      <Text style={[styles.baseText, getTextStyle()]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Spacing.borderRadiusSm,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  primaryContainer: {
    backgroundColor: Colors.subtleBackground,
  },
  primaryText: {
    color: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.border,
  },
  secondaryText: {
    color: Colors.textSecondary,
  },
  warningContainer: {
    backgroundColor: Colors.warningBackground,
  },
  warningText: {
    color: Colors.warning,
  },
  errorContainer: {
    backgroundColor: Colors.errorBackground,
  },
  errorText: {
    color: Colors.error,
  },
  successContainer: {
    backgroundColor: Colors.successBackground,
  },
  successText: {
    color: Colors.success,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineText: {
    color: Colors.textSecondary,
  },
});
