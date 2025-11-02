import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { ArrowLeft, Check, Play, Pause, Scissors, Type, Smile, Upload } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../theme';
import Timeline from '../components/Timeline';

const { width, height } = Dimensions.get('window');

interface SingleClipEditorScreenProps {
  route: {
    params: {
      clip: any;
    };
  };
  navigation: any;
}

const SingleClipEditorScreen: React.FC<SingleClipEditorScreenProps> = ({ route, navigation }) => {
  const { clip } = route.params;
  const videoRef = useRef<any>(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setTrimEnd(data.duration);
    setIsLoading(false);
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Clip</Text>
        <TouchableOpacity style={styles.doneButton}>
          <Check size={24} color={colors.success} />
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        <Video
          ref={videoRef}
          source={{ uri: clip.download_url }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          onLoad={handleLoad}
          onProgress={handleProgress}
          repeat={true}
        />
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          {isPlaying ? (
            <Pause size={24} color={colors.text} />
          ) : (
            <Play size={24} color={colors.text} />
          )}
        </TouchableOpacity>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Timeline with Trim Handles */}
      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        {duration > 0 ? (
          <Timeline
            duration={duration}
            currentTime={currentTime}
            onSeek={handleSeek}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onTrimStartChange={setTrimStart}
            onTrimEndChange={setTrimEnd}
          />
        ) : (
          <View style={styles.timelinePlaceholder}>
            <Text style={styles.placeholderText}>Loading timeline...</Text>
          </View>
        )}
      </View>

      {/* Tool Buttons */}
      <View style={styles.toolsContainer}>
        <TouchableOpacity style={styles.toolButton}>
          <Scissors size={28} color={colors.text} />
          <Text style={styles.toolText}>Trim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Type size={28} color={colors.text} />
          <Text style={styles.toolText}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Smile size={28} color={colors.text} />
          <Text style={styles.toolText}>Memes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Upload size={28} color={colors.text} />
          <Text style={styles.toolText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  doneButton: {
    padding: spacing.sm,
  },
  videoContainer: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  timelineContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  timelinePlaceholder: {
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
});

export default SingleClipEditorScreen;
