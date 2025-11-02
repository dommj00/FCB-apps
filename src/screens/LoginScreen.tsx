import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { setUser, setLoading, setError } from '../store/authSlice';
import authService from '../services/authService';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    console.log('Login button pressed');
    
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      console.log('Error: Missing email or password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    dispatch(setLoading(true));

    try {
      console.log('Attempting login with:', email);
      const user = await authService.login(email, password);
      console.log('Login successful:', user);
      dispatch(setUser(user));
    } catch (error: any) {
      console.error('Login error:', error.message);
      dispatch(setError(error.message));
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FuryClips</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Night Fury Powered 🐉</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: fontSize.sm,
  },
});

export default LoginScreen;
