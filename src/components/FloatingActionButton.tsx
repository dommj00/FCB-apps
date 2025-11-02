import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface FloatingActionButtonProps {
  visible: boolean;
  count: number;
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  visible,
  count,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.icon}>🎬</Text>
        <View>
          <Text style={styles.label}>Create Montage</Text>
          <Text style={styles.count}>{count} clip{count !== 1 ? 's' : ''}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  count: {
    color: colors.text,
    fontSize: fontSize.sm,
    opacity: 0.8,
  },
});

export default FloatingActionButton;
