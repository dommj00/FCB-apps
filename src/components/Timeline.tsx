import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  PanResponder,
  Text,
} from 'react-native';
import { colors, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_HEIGHT = 80;
const HANDLE_WIDTH = 20;

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
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeHandle, setActiveHandle] = useState<'none' | 'left' | 'right' | 'playhead'>('none');

  // Calculate timeline width (60px per second)
  const timelineWidth = Math.max(SCREEN_WIDTH - 32, duration * 60);

  // Calculate positions
  const trimStartPosition = (trimStart / duration) * timelineWidth;
  const trimEndPosition = (trimEnd / duration) * timelineWidth;
  const playheadPosition = (currentTime / duration) * timelineWidth;

  // Pan responder for trim handles and playhead
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const x = evt.nativeEvent.locationX;
        
        // Check if touching left trim handle
        if (Math.abs(x - trimStartPosition) < HANDLE_WIDTH) {
          setActiveHandle('left');
          return true;
        }
        
        // Check if touching right trim handle
        if (Math.abs(x - trimEndPosition) < HANDLE_WIDTH) {
          setActiveHandle('right');
          return true;
        }
        
        // Otherwise it's the playhead
        setActiveHandle('playhead');
        return true;
      },
      onMoveShouldSetPanResponder: () => activeHandle !== 'none',
      onPanResponderMove: (evt, gestureState) => {
        const x = Math.max(0, Math.min(evt.nativeEvent.locationX, timelineWidth));
        const time = (x / timelineWidth) * duration;
        
        if (activeHandle === 'left') {
          // Move left trim handle (can't go past right handle)
          const newStart = Math.max(0, Math.min(time, trimEnd - 1));
          onTrimStartChange(newStart);
        } else if (activeHandle === 'right') {
          // Move right trim handle (can't go before left handle)
          const newEnd = Math.max(trimStart + 1, Math.min(time, duration));
          onTrimEndChange(newEnd);
        } else if (activeHandle === 'playhead') {
          // Move playhead (stays within trim range)
          const newTime = Math.max(trimStart, Math.min(time, trimEnd));
          onSeek(newTime);
        }
      },
      onPanResponderRelease: () => {
        setActiveHandle('none');
      },
    })
  ).current;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Trim time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>{formatTime(trimStart)}</Text>
        <Text style={styles.timeLabel}>{formatTime(trimEnd - trimStart)}</Text>
        <Text style={styles.timeLabel}>{formatTime(trimEnd)}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: timelineWidth }}
        {...panResponder.panHandlers}
      >
        {/* Gray timeline background */}
        <View style={[styles.timelineBackground, { width: timelineWidth }]}>
          {/* Time markers every 10 seconds */}
          {Array.from({ length: Math.floor(duration / 10) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.timeMarker,
                { left: ((index + 1) * 10 / duration) * timelineWidth }
              ]}
            />
          ))}
        </View>

        {/* Dimmed regions (before trim start and after trim end) */}
        <View style={[styles.dimmedRegion, { width: trimStartPosition }]} />
        <View style={[
          styles.dimmedRegion,
          { left: trimEndPosition, width: timelineWidth - trimEndPosition }
        ]} />

        {/* Active trim region highlight */}
        <View style={[
          styles.activeRegion,
          {
            left: trimStartPosition,
            width: trimEndPosition - trimStartPosition,
          }
        ]} />

        {/* Left trim handle */}
        <View style={[styles.trimHandle, { left: trimStartPosition }]}>
          <View style={styles.trimHandleBar} />
          <View style={styles.trimHandleGrip} />
        </View>

        {/* Right trim handle */}
        <View style={[styles.trimHandle, { left: trimEndPosition - HANDLE_WIDTH }]}>
          <View style={styles.trimHandleBar} />
          <View style={styles.trimHandleGrip} />
        </View>

        {/* Playhead */}
        <View style={[styles.playhead, { left: playheadPosition }]}>
          <View style={styles.playheadLine} />
          <View style={styles.playheadHandle} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: TIMELINE_HEIGHT + 40,
    backgroundColor: colors.background,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timelineBackground: {
    height: TIMELINE_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
  timeMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border,
  },
  dimmedRegion: {
    position: 'absolute',
    top: 0,
    height: TIMELINE_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
  },
  activeRegion: {
    position: 'absolute',
    top: 0,
    height: TIMELINE_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
  },
  trimHandle: {
    position: 'absolute',
    top: 0,
    width: HANDLE_WIDTH,
    height: TIMELINE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trimHandleBar: {
    width: 4,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  trimHandleGrip: {
    position: 'absolute',
    width: 20,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: TIMELINE_HEIGHT + 20,
    zIndex: 10,
  },
  playheadLine: {
    width: 2,
    height: '100%',
    backgroundColor: colors.text,
  },
  playheadHandle: {
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
