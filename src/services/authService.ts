import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || undefined,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signup(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || undefined,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('authToken');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth().currentUser;
    if (currentUser) {
      return {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || undefined,
      };
    }
    return null;
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
