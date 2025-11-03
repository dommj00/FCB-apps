import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH;
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

export interface MemeOverlayData {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  startTime: number;
  endTime: number;
}

interface DraggableMemeOverlayProps {
  overlay: MemeOverlayData;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
}

const DraggableMemeOverlay: React.FC<DraggableMemeOverlayProps> = ({
  overlay,
  onPositionChange,
  onSizeChange,
}) => {
  const pan = useRef(new Animated.ValueXY({
    x: (overlay.position.x / 100) * VIDEO_WIDTH,
    y: (overlay.position.y / 100) * VIDEO_HEIGHT,
  })).current;

  const scale = useRef(new Animated.Value(1)).current;
  const [currentScale, setCurrentScale] = useState(1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        const finalX = (overlay.position.x / 100) * VIDEO_WIDTH + gestureState.dx;
        const finalY = (overlay.position.y / 100) * VIDEO_HEIGHT + gestureState.dy;

        const clampedX = Math.max(0, Math.min(VIDEO_WIDTH, finalX));
        const clampedY = Math.max(0, Math.min(VIDEO_HEIGHT, finalY));

        const percentX = (clampedX / VIDEO_WIDTH) * 100;
        const percentY = (clampedY / VIDEO_HEIGHT) * 100;

        onPositionChange(overlay.id, { x: percentX, y: percentY });
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
            { scale: scale },
          ],
        },
      ]}
    >
      <Image
        source={{ uri: overlay.url }}
        style={[
          styles.meme,
          {
            width: overlay.size.width,
            height: overlay.size.height,
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  meme: {
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    borderRadius: 4,
  },
});

export default DraggableMemeOverlay;
