import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.text,
  },
});

export default FilterChip;
