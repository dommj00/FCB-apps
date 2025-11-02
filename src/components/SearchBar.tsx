import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search clips...',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    color: colors.textSecondary,
    fontSize: 18,
  },
});

export default SearchBar;
