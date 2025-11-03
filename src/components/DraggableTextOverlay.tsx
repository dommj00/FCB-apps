import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { TextOverlayData } from './TextEditorPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH;
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

interface DraggableTextOverlayProps {
  overlay: TextOverlayData;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

const DraggableTextOverlay: React.FC<DraggableTextOverlayProps> = ({
  overlay,
  onPositionChange,
}) => {
  const pan = useRef(new Animated.ValueXY({
    x: (overlay.position.x / 100) * VIDEO_WIDTH,
    y: (overlay.position.y / 100) * VIDEO_HEIGHT,
  })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        // Calculate final position
        const finalX = (overlay.position.x / 100) * VIDEO_WIDTH + gestureState.dx;
        const finalY = (overlay.position.y / 100) * VIDEO_HEIGHT + gestureState.dy;

        // Clamp to video bounds
        const clampedX = Math.max(0, Math.min(VIDEO_WIDTH, finalX));
        const clampedY = Math.max(0, Math.min(VIDEO_HEIGHT, finalY));

        // Convert to percentage
        const percentX = (clampedX / VIDEO_WIDTH) * 100;
        const percentY = (clampedY / VIDEO_HEIGHT) * 100;

        onPositionChange(overlay.id, { x: percentX, y: percentY });

        // Reset pan values
        pan.setValue({ x: clampedX, y: clampedY });
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontFamily: overlay.font,
            fontSize: overlay.fontSize,
            color: overlay.color,
            textAlign: overlay.alignment,
            backgroundColor: overlay.hasBackground
              ? overlay.backgroundColor
              : 'transparent',
            textShadowColor: overlay.hasShadow ? 'rgba(0,0,0,0.75)' : 'transparent',
            textShadowOffset: overlay.hasShadow ? { width: 2, height: 2 } : { width: 0, height: 0 },
            textShadowRadius: overlay.hasShadow ? 4 : 0,
          },
          overlay.hasOutline && {
            textShadowColor: overlay.outlineColor,
            textShadowRadius: 2,
          },
        ]}
      >
        {overlay.text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 8,
  },
  text: {
    fontWeight: 'bold',
    padding: 4,
  },
});

export default DraggableTextOverlay;
