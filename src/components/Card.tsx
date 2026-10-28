import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Shadows } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'subtle' | 'floating';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'subtle' && styles.subtle,
        variant === 'floating' && styles.floating,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.md,
  },
  elevated: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  subtle: {
    backgroundColor: Colors.subtleBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floating: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.floating,
  },
});
