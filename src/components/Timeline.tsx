import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Text,
} from 'react-native';
import { colors, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_HEIGHT = 80;
const TIMELINE_PADDING = 16;
const HANDLE_WIDTH = 16;
const EDGE_PADDING = 12; // Visual padding on left and right edges
const TIMELINE_WIDTH = SCREEN_WIDTH - (TIMELINE_PADDING * 2);
const FILMSTRIP_WIDTH = TIMELINE_WIDTH - (EDGE_PADDING * 2);

interface TimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  trimStart: number;
  trimEnd: number;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  onSeek,
  trimStart,
  trimEnd,
  onTrimStartChange,
  onTrimEndChange,
}) => {
  const [activeHandle, setActiveHandle] = useState<'none' | 'left' | 'right' | 'playhead'>('none');

  // Calculate positions within the filmstrip area
  const trimStartPos = EDGE_PADDING + (trimStart / duration) * FILMSTRIP_WIDTH;
  const trimEndPos = EDGE_PADDING + (trimEnd / duration) * FILMSTRIP_WIDTH;
  const playheadPos = EDGE_PADDING + (currentTime / duration) * FILMSTRIP_WIDTH;

  // Generate visual segments
  const segmentCount = 20;
  const segmentWidth = FILMSTRIP_WIDTH / segmentCount;

  // Pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const x = evt.nativeEvent.locationX;
      
      // Check handles with larger touch area
      if (Math.abs(x - trimStartPos) < 25) {
        setActiveHandle('left');
        return true;
      }
      
      if (Math.abs(x - trimEndPos) < 25) {
        setActiveHandle('right');
        return true;
      }
      
      // Playhead
      setActiveHandle('playhead');
      return true;
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX;
      
      // Clamp x to filmstrip bounds
      const clampedX = Math.max(EDGE_PADDING, Math.min(x, EDGE_PADDING + FILMSTRIP_WIDTH));
      
      // Convert to time
      const percentage = (clampedX - EDGE_PADDING) / FILMSTRIP_WIDTH;
      const time = percentage * duration;
      
      if (activeHandle === 'left') {
        const newStart = Math.max(0, Math.min(time, trimEnd - 1));
        onTrimStartChange(newStart);
      } else if (activeHandle === 'right') {
        const newEnd = Math.max(trimStart + 1, Math.min(time, duration));
        onTrimEndChange(newEnd);
      } else if (activeHandle === 'playhead') {
        const newTime = Math.max(trimStart, Math.min(time, trimEnd));
        onSeek(newTime);
      }
    },
    onPanResponderRelease: () => {
      setActiveHandle('none');
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>{formatTime(trimStart)}</Text>
        <Text style={styles.timeLabel}>{formatTime(trimEnd - trimStart)}</Text>
        <Text style={styles.timeLabel}>{formatTime(trimEnd)}</Text>
      </View>

      <View
        style={styles.timelineContainer}
        {...panResponder.panHandlers}
      >
        {/* Filmstrip segments */}
        <View style={[styles.filmstrip, { left: EDGE_PADDING, width: FILMSTRIP_WIDTH }]}>
          {Array.from({ length: segmentCount }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: segmentWidth,
                  backgroundColor: index % 2 === 0 ? '#2d3748' : '#374151',
                }
              ]}
            />
          ))}
        </View>

        {/* Dimmed regions */}
        {(trimStartPos - EDGE_PADDING) > 0 && (
          <View style={[
            styles.dimmedRegion,
            {
              left: EDGE_PADDING,
              width: trimStartPos - EDGE_PADDING
            }
          ]} />
        )}
        {(trimEndPos) < (EDGE_PADDING + FILMSTRIP_WIDTH) && (
          <View style={[
            styles.dimmedRegion,
            {
              left: trimEndPos,
              width: (EDGE_PADDING + FILMSTRIP_WIDTH) - trimEndPos,
            }
          ]} />
        )}

        {/* Active region border */}
        <View style={[
          styles.activeRegion,
          {
            left: trimStartPos,
            width: trimEndPos - trimStartPos,
          }
        ]} />

        {/* Left trim handle */}
        <View style={[
          styles.trimHandle,
          styles.leftHandle,
          { left: trimStartPos - (HANDLE_WIDTH / 2) }
        ]}>
          <View style={styles.handleGrip} />
          <View style={styles.handleGrip} />
        </View>

        {/* Right trim handle */}
        <View style={[
          styles.trimHandle,
          styles.rightHandle,
          { left: trimEndPos - (HANDLE_WIDTH / 2) }
        ]}>
          <View style={styles.handleGrip} />
          <View style={styles.handleGrip} />
        </View>

        {/* Playhead */}
        <View style={[styles.playhead, { left: playheadPos - 1 }]}>
          <View style={styles.playheadLine} />
          <View style={styles.playheadDot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: spacing.md,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timelineContainer: {
    width: TIMELINE_WIDTH,
    height: TIMELINE_HEIGHT,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1d29',
  },
  filmstrip: {
    position: 'absolute',
    flexDirection: 'row',
    height: '100%',
  },
  segment: {
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#1a1d29',
  },
  dimmedRegion: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activeRegion: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  trimHandle: {
    position: 'absolute',
    top: -5,
    width: HANDLE_WIDTH,
    height: TIMELINE_HEIGHT + 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.text,
  },
  leftHandle: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  rightHandle: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  handleGrip: {
    width: 2,
    height: 16,
    backgroundColor: colors.text,
    borderRadius: 1,
    marginVertical: 1,
  },
  playhead: {
    position: 'absolute',
    top: -10,
    width: 2,
    height: TIMELINE_HEIGHT + 20,
    zIndex: 5,
  },
  playheadLine: {
    width: 2,
    height: '100%',
    backgroundColor: colors.text,
  },
  playheadDot: {
    position: 'absolute',
    top: -4,
    left: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});

export default Timeline;
