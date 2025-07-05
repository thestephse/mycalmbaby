import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Switch,
} from 'react-native';
import { designTokens } from '../styles/designTokens';

// Button Components
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      disabled && styles.disabledButton,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => (
  <TouchableOpacity
    style={[
      styles.secondaryButton,
      disabled && styles.disabledSecondaryButton,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.secondaryButtonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

export const PillButton: React.FC<ButtonProps & { active?: boolean }> = ({
  title,
  onPress,
  active = false,
  style,
  textStyle,
}) => (
  <TouchableOpacity
    style={[
      styles.pillButton,
      active && styles.pillButtonActive,
      style,
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.pillButtonText,
      active && styles.pillButtonTextActive,
      textStyle,
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Card Components
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const FeatureCard: React.FC<CardProps> = ({ children, style }) => (
  <View style={[styles.featureCard, style]}>
    {children}
  </View>
);

// Toggle Component
interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ value, onValueChange, label }) => (
  <View style={styles.toggleContainer}>
    {label && <Text style={styles.toggleLabel}>{label}</Text>}
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: designTokens.colors.mediumGray, true: designTokens.colors.primary }}
      thumbColor={value ? designTokens.colors.white : designTokens.colors.darkGray}
      ios_backgroundColor={designTokens.colors.mediumGray}
    />
  </View>
);

// Section Header
interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style }) => (
  <Text style={[styles.sectionHeader, style]}>{title}</Text>
);

// Mood Button
interface MoodButtonProps {
  emoji: string;
  onPress: () => void;
  active?: boolean;
  style?: ViewStyle;
}

export const MoodButton: React.FC<MoodButtonProps> = ({
  emoji,
  onPress,
  active = false,
  style,
}) => (
  <TouchableOpacity
    style={[
      styles.moodButton,
      active && styles.moodButtonActive,
      style,
    ]}
    onPress={onPress}
  >
    <Text style={styles.moodEmoji}>{emoji}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Button Styles
  primaryButton: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: designTokens.borderRadius.xxl,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...designTokens.shadows.lg,
  },
  primaryButtonText: {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.sizes.base,
    fontWeight: designTokens.typography.weights.semibold,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.sizes.base,
  },
  disabledButton: {
    backgroundColor: designTokens.colors.mediumGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  secondaryButton: {
    backgroundColor: designTokens.colors.white,
    borderWidth: 2,
    borderColor: designTokens.colors.primary,
    borderRadius: designTokens.borderRadius.xxl,
    paddingVertical: designTokens.spacing.md - 2, // Account for border
    paddingHorizontal: designTokens.spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: designTokens.colors.primary,
    fontSize: designTokens.typography.sizes.base,
    fontWeight: designTokens.typography.weights.semibold,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.sizes.base,
  },
  disabledSecondaryButton: {
    borderColor: designTokens.colors.mediumGray,
  },
  
  pillButton: {
    backgroundColor: designTokens.colors.lightGray,
    borderRadius: designTokens.borderRadius.xl,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonActive: {
    backgroundColor: designTokens.colors.primary,
  },
  pillButtonText: {
    color: designTokens.colors.darkGray,
    fontSize: designTokens.typography.sizes.sm,
    fontWeight: designTokens.typography.weights.medium,
  },
  pillButtonTextActive: {
    color: designTokens.colors.white,
  },
  
  // Card Styles
  card: {
    backgroundColor: designTokens.colors.white,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    ...designTokens.shadows.md,
    borderWidth: 1,
    borderColor: designTokens.colors.lightGray,
  },
  
  featureCard: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.lg,
    ...designTokens.shadows.md,
  },
  
  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.sm,
  },
  toggleLabel: {
    fontSize: designTokens.typography.sizes.base,
    fontWeight: designTokens.typography.weights.medium,
    color: designTokens.colors.charcoal,
    flex: 1,
  },
  
  // Text Styles
  sectionHeader: {
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.charcoal,
    marginBottom: designTokens.spacing.md,
    lineHeight: designTokens.typography.lineHeights.tight * designTokens.typography.sizes.lg,
  },
  
  // Mood Button Styles
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.white,
    borderWidth: 2,
    borderColor: designTokens.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    margin: designTokens.spacing.sm,
  },
  moodButtonActive: {
    borderColor: designTokens.colors.primary,
    backgroundColor: designTokens.colors.aliceBlue,
  },
  moodEmoji: {
    fontSize: 24,
  },
});

export default {
  PrimaryButton,
  SecondaryButton,
  PillButton,
  Card,
  FeatureCard,
  Toggle,
  SectionHeader,
  MoodButton,
};
