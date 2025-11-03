import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { X } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../theme';
import { MemeOverlayData } from './DraggableMemeOverlay';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5;

interface MemeEditorPanelProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (memeData: MemeOverlayData) => void;
  meme: MemeOverlayData | null;
  videoDuration: number;
}

const MemeEditorPanel: React.FC<MemeEditorPanelProps> = ({
  visible,
  onClose,
  onUpdate,
  meme,
  videoDuration,
}) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [size, setSize] = useState(150);

  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;

  useEffect(() => {
    if (meme) {
      setStartTime(meme.startTime);
      setEndTime(meme.endTime);
      setSize(meme.size.width);
    }
  }, [meme]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: PANEL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleUpdate = () => {
    if (!meme) return;

    const updatedMeme: MemeOverlayData = {
      ...meme,
      startTime,
      endTime,
      size: { width: size, height: size },
    };

    onUpdate(updatedMeme);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!meme) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Edit Meme</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: meme.url }}
                style={[styles.preview, { width: size, height: size }]}
                resizeMode="contain"
              />
            </View>

            {/* Size Control */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size: {size}px</Text>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={300}
                value={size}
                onValueChange={setSize}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.textSecondary}
                thumbTintColor={colors.primary}
              />
            </View>

            {/* Timing Controls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timing</Text>
              
              {/* Start Time */}
              <View style={styles.timingRow}>
                <Text style={styles.timingLabel}>Start: {formatTime(startTime)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={videoDuration}
                  value={startTime}
                  onValueChange={setStartTime}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.textSecondary}
                  thumbTintColor={colors.primary}
                />
              </View>

              {/* End Time */}
              <View style={styles.timingRow}>
                <Text style={styles.timingLabel}>End: {formatTime(endTime)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={startTime}
                  maximumValue={videoDuration}
                  value={endTime}
                  onValueChange={setEndTime}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.textSecondary}
                  thumbTintColor={colors.primary}
                />
              </View>

              <Text style={styles.durationText}>
                Duration: {formatTime(endTime - startTime)}
              </Text>
            </View>

            {/* Update Button */}
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Update Meme</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  preview: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timingRow: {
    marginBottom: spacing.md,
  },
  timingLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  durationText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  updateButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default MemeEditorPanel;
