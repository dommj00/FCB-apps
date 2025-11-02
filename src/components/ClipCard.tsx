import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Clip } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

interface ClipCardProps {
  clip: Clip;
  selected?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  selected = false,
  onPress,
  onLongPress,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return colors.success;
      case 'processing':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {clip.thumbnail_path ? (
          <Image
            source={{ uri: clip.thumbnail_path }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Text style={styles.placeholderText}>🎬</Text>
          </View>
        )}

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(clip.duration)}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(clip.status) }]}>
          <View style={styles.statusDot} />
        </View>

        {/* Selection Overlay */}
        {selected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {clip.stream_title || clip.stream_game || 'Untitled Clip'}
        </Text>
        <Text style={styles.metadata}>
          {clip.resolution} • {clip.direction}
        </Text>
        {clip.stream_game && (
          <Text style={styles.game} numberOfLines={1}>
            🎮 {clip.stream_game}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  thumbnailContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBackground,
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDot: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metadata: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  game: {
    fontSize: fontSize.xs,
    color: colors.accent,
  },
});

export default ClipCard;
