import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';
import LoginScreen from '../screens/LoginScreen';
import ClipsLibraryScreen from '../screens/ClipsLibraryScreen';
import SingleClipEditorScreen from '../screens/SingleClipEditorScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="ClipsLibrary" component={ClipsLibraryScreen} />
            <Stack.Screen name="SingleClipEditor" component={SingleClipEditorScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
