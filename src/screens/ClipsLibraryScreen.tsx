import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import authService from '../services/authService';
import { colors, spacing, fontSize } from '../theme/colors';

const ClipsLibraryScreen = () => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clips Library</Text>
      <Text style={styles.subtitle}>Coming Soon!</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});

export default ClipsLibraryScreen;
