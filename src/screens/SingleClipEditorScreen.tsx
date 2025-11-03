import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { ArrowLeft, Check, Play, Pause, Scissors, Type, Smile, Upload, Edit2, Trash2 } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../theme';
import Timeline from '../components/Timeline';
import TextEditorPanel, { TextOverlayData } from '../components/TextEditorPanel';
import DraggableTextOverlay from '../components/DraggableTextOverlay';
import MemeLibraryModal from '../components/MemeLibraryModal';
import DraggableMemeOverlay, { MemeOverlayData } from '../components/DraggableMemeOverlay';
import MemeEditorPanel from '../components/MemeEditorPanel';
import ExportModal, { ExportSettings } from '../components/ExportModal';
import { exportEditedClip, checkJobStatus } from '../services/api';

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

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState<TextOverlayData[]>([]);
  const [isTextEditorVisible, setIsTextEditorVisible] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showTextList, setShowTextList] = useState(false);

  // Meme overlay state
  const [memeOverlays, setMemeOverlays] = useState<MemeOverlayData[]>([]);
  const [isMemeLibraryVisible, setIsMemeLibraryVisible] = useState(false);
  const [isMemeEditorVisible, setIsMemeEditorVisible] = useState(false);
  const [editingMeme, setEditingMeme] = useState<MemeOverlayData | null>(null);
  const [showMemeList, setShowMemeList] = useState(false);

  // Export state
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportUrl, setExportUrl] = useState<string>();
  const [jobId, setJobId] = useState<string>();

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

  const handleAddText = (textData: TextOverlayData) => {
    if (editingTextId) {
      setTextOverlays(prev =>
        prev.map(overlay =>
          overlay.id === editingTextId ? textData : overlay
        )
      );
      setEditingTextId(null);
    } else {
      setTextOverlays(prev => [...prev, textData]);
    }
  };

  const handleTextPositionChange = (id: string, position: { x: number; y: number }) => {
    setTextOverlays(prev =>
      prev.map(overlay =>
        overlay.id === id ? { ...overlay, position } : overlay
      )
    );
  };

  const openTextEditor = () => {
    setEditingTextId(null);
    setIsTextEditorVisible(true);
  };

  const editTextOverlay = (overlay: TextOverlayData) => {
    setEditingTextId(overlay.id);
    setIsTextEditorVisible(true);
    setShowTextList(false);
  };

  const deleteTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  const handleSelectMeme = (memeUrl: string, gifData: any) => {
    const newMeme: MemeOverlayData = {
      id: Date.now().toString(),
      url: memeUrl,
      position: { x: 50, y: 50 },
      size: { width: 150, height: 150 },
      startTime: 0,
      endTime: Math.min(5, duration),
    };
    setMemeOverlays(prev => [...prev, newMeme]);
  };

  const handleMemePositionChange = (id: string, position: { x: number; y: number }) => {
    setMemeOverlays(prev =>
      prev.map(overlay =>
        overlay.id === id ? { ...overlay, position } : overlay
      )
    );
  };

  const handleMemeSizeChange = (id: string, size: { width: number; height: number }) => {
    setMemeOverlays(prev =>
      prev.map(overlay =>
        overlay.id === id ? { ...overlay, size } : overlay
      )
    );
  };

  const editMemeOverlay = (meme: MemeOverlayData) => {
    setEditingMeme(meme);
    setIsMemeEditorVisible(true);
    setShowMemeList(false);
  };

  const handleUpdateMeme = (memeData: MemeOverlayData) => {
    setMemeOverlays(prev =>
      prev.map(overlay =>
        overlay.id === memeData.id ? memeData : overlay
      )
    );
    setEditingMeme(null);
  };

  const deleteMemeOverlay = (id: string) => {
    setMemeOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  const handleExport = async (platform: string, settings: ExportSettings) => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportComplete(false);

      // Send export request to backend
      const response = await exportEditedClip(
        clip.clip_id,
        trimStart,
        trimEnd,
        textOverlays,
        memeOverlays,
        settings
      );

      setJobId(response.job_id);

      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkJobStatus(response.job_id);
          
          setExportProgress(status.progress);

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsExporting(false);
            setExportComplete(true);
            setExportUrl(status.download_url);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsExporting(false);
            Alert.alert('Export Failed', status.error || 'An error occurred during export');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsExporting(false);
          Alert.alert('Error', 'Failed to check export status');
        }
      }, 2000);

    } catch (error) {
      setIsExporting(false);
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to start export. Please try again.');
    }
  };

  const getVisibleTextOverlays = () => {
    return textOverlays.filter(
      overlay =>
        currentTime >= overlay.startTime &&
        currentTime <= overlay.endTime
    );
  };

  const getVisibleMemeOverlays = () => {
    return memeOverlays.filter(
      overlay =>
        currentTime >= overlay.startTime &&
        currentTime <= overlay.endTime
    );
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

      {/* Video Preview with Overlays */}
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
        
        {/* Draggable Text Overlays */}
        {getVisibleTextOverlays().map(overlay => (
          <DraggableTextOverlay
            key={overlay.id}
            overlay={overlay}
            onPositionChange={handleTextPositionChange}
          />
        ))}

        {/* Draggable Meme Overlays */}
        {getVisibleMemeOverlays().map(overlay => (
          <DraggableMemeOverlay
            key={overlay.id}
            overlay={overlay}
            onPositionChange={handleMemePositionChange}
            onSizeChange={handleMemeSizeChange}
          />
        ))}
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

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.overlayCounters}>
            {textOverlays.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setShowTextList(!showTextList);
                  setShowMemeList(false);
                }}
                style={styles.overlayCountButton}
              >
                <Type size={16} color={colors.primary} />
                <Text style={styles.overlayCountText}>{textOverlays.length}</Text>
              </TouchableOpacity>
            )}
            {memeOverlays.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setShowMemeList(!showMemeList);
                  setShowTextList(false);
                }}
                style={styles.overlayCountButton}
              >
                <Smile size={16} color={colors.accent} />
                <Text style={styles.overlayCountText}>{memeOverlays.length}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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

      {/* Scrollable Overlay Lists Container */}
      <ScrollView 
        style={styles.overlayListsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Text Overlays List */}
        {showTextList && textOverlays.length > 0 && (
          <View style={styles.overlayListSection}>
            <Text style={styles.overlayListTitle}>Text Overlays ({textOverlays.length})</Text>
            {textOverlays.map((item) => (
              <View key={item.id} style={styles.overlayListItem}>
                <View style={styles.overlayListItemContent}>
                  <Text style={styles.overlayListItemText} numberOfLines={1}>
                    {item.text}
                  </Text>
                  <Text style={styles.overlayListItemTime}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>
                <View style={styles.overlayListItemActions}>
                  <TouchableOpacity 
                    onPress={() => editTextOverlay(item)}
                    style={styles.overlayListItemButton}
                  >
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteTextOverlay(item.id)}
                    style={styles.overlayListItemButton}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Meme Overlays List */}
        {showMemeList && memeOverlays.length > 0 && (
          <View style={styles.overlayListSection}>
            <Text style={styles.overlayListTitle}>Meme Overlays ({memeOverlays.length})</Text>
            {memeOverlays.map((item) => (
              <View key={item.id} style={styles.overlayListItem}>
                <View style={styles.overlayListItemContent}>
                  <Text style={styles.overlayListItemText} numberOfLines={1}>
                    GIF #{item.id.slice(-4)}
                  </Text>
                  <Text style={styles.overlayListItemTime}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>
                <View style={styles.overlayListItemActions}>
                  <TouchableOpacity 
                    onPress={() => editMemeOverlay(item)}
                    style={styles.overlayListItemButton}
                  >
                    <Edit2 size={18} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteMemeOverlay(item.id)}
                    style={styles.overlayListItemButton}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Tool Buttons */}
      <View style={styles.toolsContainer}>
        <TouchableOpacity style={styles.toolButton}>
          <Scissors size={28} color={colors.text} />
          <Text style={styles.toolText}>Trim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={openTextEditor}>
          <Type size={28} color={colors.primary} />
          <Text style={[styles.toolText, { color: colors.primary }]}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => setIsMemeLibraryVisible(true)}>
          <Smile size={28} color={colors.accent} />
          <Text style={[styles.toolText, { color: colors.accent }]}>Memes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => setIsExportModalVisible(true)}>
          <Upload size={28} color={colors.success} />
          <Text style={[styles.toolText, { color: colors.success }]}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <TextEditorPanel
        visible={isTextEditorVisible}
        onClose={() => {
          setIsTextEditorVisible(false);
          setEditingTextId(null);
        }}
        onAddText={handleAddText}
        initialText={
          editingTextId
            ? textOverlays.find(o => o.id === editingTextId)
            : undefined
        }
        videoDuration={duration}
      />

      <MemeLibraryModal
        visible={isMemeLibraryVisible}
        onClose={() => setIsMemeLibraryVisible(false)}
        onSelectMeme={handleSelectMeme}
      />

      <MemeEditorPanel
        visible={isMemeEditorVisible}
        onClose={() => {
          setIsMemeEditorVisible(false);
          setEditingMeme(null);
        }}
        onUpdate={handleUpdateMeme}
        meme={editingMeme}
        videoDuration={duration}
      />

      <ExportModal
        visible={isExportModalVisible}
        onClose={() => {
          setIsExportModalVisible(false);
          if (exportComplete) {
            setExportComplete(false);
            setExportProgress(0);
          }
        }}
        onExport={handleExport}
        isExporting={isExporting}
        progress={exportProgress}
        exportComplete={exportComplete}
        exportUrl={exportUrl}
      />
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
    position: 'relative',
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
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  overlayCounters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overlayCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  overlayCountText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
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
  overlayListsContainer: {
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  overlayListSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  overlayListTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  overlayListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  overlayListItemContent: {
    flex: 1,
  },
  overlayListItemText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  overlayListItemTime: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  overlayListItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overlayListItemButton: {
    padding: spacing.xs,
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
