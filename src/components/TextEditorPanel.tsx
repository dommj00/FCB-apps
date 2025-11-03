import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface TextEditorPanelProps {
  visible: boolean;
  onClose: () => void;
  onAddText: (textData: TextOverlayData) => void;
  initialText?: TextOverlayData;
  videoDuration: number;
}

export interface TextOverlayData {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  hasBackground: boolean;
  hasOutline: boolean;
  outlineColor: string;
  hasShadow: boolean;
  alignment: 'left' | 'center' | 'right';
  position: { x: number; y: number };
  startTime: number;
  endTime: number;
}

const FONTS = [
  'System',
  'Arial-BoldMT',
  'Helvetica-Bold',
  'Courier-Bold',
  'Impact',
];

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#A855F7', // Purple
  '#10B981', // Green
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#F59E0B', // Yellow
  '#EC4899', // Pink
];

const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  visible,
  onClose,
  onAddText,
  initialText,
  videoDuration,
}) => {
  const [text, setText] = useState(initialText?.text || '');
  const [font, setFont] = useState(initialText?.font || 'System');
  const [fontSize, setFontSize] = useState(initialText?.fontSize || 24);
  const [color, setColor] = useState(initialText?.color || '#FFFFFF');
  const [hasBackground, setHasBackground] = useState(initialText?.hasBackground || false);
  const [backgroundColor, setBackgroundColor] = useState(initialText?.backgroundColor || '#000000');
  const [hasOutline, setHasOutline] = useState(initialText?.hasOutline || false);
  const [outlineColor, setOutlineColor] = useState(initialText?.outlineColor || '#000000');
  const [hasShadow, setHasShadow] = useState(initialText?.hasShadow || false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(
    initialText?.alignment || 'center'
  );
  const [startTime, setStartTime] = useState(initialText?.startTime || 0);
  const [endTime, setEndTime] = useState(initialText?.endTime || Math.min(5, videoDuration));

  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    } else {
      Animated.timing(slideAnim, {
        toValue: PANEL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAddText = () => {
    if (!text.trim()) return;

    const textData: TextOverlayData = {
      id: initialText?.id || Date.now().toString(),
      text,
      font,
      fontSize,
      color,
      backgroundColor: hasBackground ? backgroundColor : undefined,
      hasBackground,
      hasOutline,
      outlineColor,
      hasShadow,
      alignment,
      position: initialText?.position || { x: 50, y: 50 },
      startTime,
      endTime,
    };

    onAddText(textData);
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Text</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Text Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Text</Text>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Enter text..."
                placeholderTextColor={colors.textSecondary}
                multiline
                autoFocus={true}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            {/* Font Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Font</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {FONTS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.fontButton,
                      font === f && styles.fontButtonSelected,
                    ]}
                    onPress={() => setFont(f)}
                  >
                    <Text
                      style={[
                        styles.fontButtonText,
                        { fontFamily: f },
                        font === f && styles.fontButtonTextSelected,
                      ]}
                    >
                      Aa
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size: {fontSize}</Text>
              <View style={styles.sizeControls}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  <Text style={styles.sizeButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.sizeDisplay}>
                  <Text style={styles.sizeText}>{fontSize}</Text>
                </View>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => setFontSize(Math.min(72, fontSize + 2))}
                >
                  <Text style={styles.sizeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Text Color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Text Color</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorButton,
                      { backgroundColor: c },
                      color === c && styles.colorButtonSelected,
                    ]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            {/* Background Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.sectionTitle}>Background</Text>
                <TouchableOpacity
                  style={[styles.toggle, hasBackground && styles.toggleActive]}
                  onPress={() => setHasBackground(!hasBackground)}
                >
                  <View style={[styles.toggleThumb, hasBackground && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              {hasBackground && (
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorButton,
                        { backgroundColor: c },
                        backgroundColor === c && styles.colorButtonSelected,
                      ]}
                      onPress={() => setBackgroundColor(c)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Outline Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.sectionTitle}>Outline</Text>
                <TouchableOpacity
                  style={[styles.toggle, hasOutline && styles.toggleActive]}
                  onPress={() => setHasOutline(!hasOutline)}
                >
                  <View style={[styles.toggleThumb, hasOutline && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              {hasOutline && (
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorButton,
                        { backgroundColor: c },
                        outlineColor === c && styles.colorButtonSelected,
                      ]}
                      onPress={() => setOutlineColor(c)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Shadow Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.sectionTitle}>Shadow</Text>
                <TouchableOpacity
                  style={[styles.toggle, hasShadow && styles.toggleActive]}
                  onPress={() => setHasShadow(!hasShadow)}
                >
                  <View style={[styles.toggleThumb, hasShadow && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Alignment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alignment</Text>
              <View style={styles.alignmentRow}>
                {(['left', 'center', 'right'] as const).map((align) => (
                  <TouchableOpacity
                    key={align}
                    style={[
                      styles.alignmentButton,
                      alignment === align && styles.alignmentButtonSelected,
                    ]}
                    onPress={() => setAlignment(align)}
                  >
                    <Text
                      style={[
                        styles.alignmentText,
                        alignment === align && styles.alignmentTextSelected,
                      ]}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.addButton, !text.trim() && styles.addButtonDisabled]}
              onPress={handleAddText}
              disabled={!text.trim()}
            >
              <Text style={styles.addButtonText}>
                {initialText ? 'Update Text' : 'Add Text'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fontButton: {
    width: 60,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fontButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  fontButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  fontButtonTextSelected: {
    color: colors.primary,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  sizeDisplay: {
    marginHorizontal: spacing.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: colors.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.textSecondary,
  },
  toggleThumbActive: {
    backgroundColor: colors.text,
    alignSelf: 'flex-end',
  },
  alignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignmentButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  alignmentButtonSelected: {
    backgroundColor: colors.primary,
  },
  alignmentText: {
    fontSize: 14,
    color: colors.text,
  },
  alignmentTextSelected: {
    color: colors.text,
    fontWeight: 'bold',
  },
  timingRow: {
    marginBottom: spacing.md,
  },
  timingLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  durationText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  addButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default TextEditorPanel;
