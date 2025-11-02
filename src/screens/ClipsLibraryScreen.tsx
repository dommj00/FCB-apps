import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import { colors, spacing, fontSize } from '../theme';
import clipsService from '../services/clipsService';

interface ClipsLibraryScreenProps {
  navigation: any;
}

const ClipsLibraryScreen: React.FC<ClipsLibraryScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    try {
      setLoading(true);
      const response = await clipsService.getClips('kaznightfury', 'ready');
      setClips(response.clips || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load clips');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClipPress = (clip: any) => {
    navigation.navigate('SingleClipEditor', { clip });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderClipItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.clipCard}
      onPress={() => handleClipPress(item)}
    >
      <Image
        source={{ uri: item.thumbnail_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.clipInfo}>
        <Text style={styles.clipTitle} numberOfLines={2}>
          {item.stream_title || 'Untitled Clip'}
        </Text>
        <Text style={styles.clipMeta}>
          {formatDuration(item.duration_seconds)} • {item.resolution}
        </Text>
        <Text style={styles.clipDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading clips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>FuryClips</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} color={colors.text} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Clips List */}
      {clips.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No clips available</Text>
          <Text style={styles.emptySubtext}>
            Create clips using !fury command in Twitch chat
          </Text>
        </View>
      ) : (
        <FlatList
          data={clips}
          renderItem={renderClipItem}
          keyExtractor={(item) => item.clip_id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  listContainer: {
    padding: spacing.sm,
  },
  clipCard: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundDark,
  },
  clipInfo: {
    padding: spacing.sm,
  },
  clipTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  clipMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  clipDate: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ClipsLibraryScreen;
