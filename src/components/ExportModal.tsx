import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { X, Download, Share2 } from 'lucide-react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { colors, spacing, fontSize } from '../theme';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (platform: string, settings: ExportSettings) => void;
  isExporting: boolean;
  progress: number;
  exportComplete: boolean;
  exportUrl?: string;
}

export interface ExportSettings {
  platform: string;
  resolution: string;
  quality: string;
}

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', aspect: '9:16', maxDuration: 600 },
  { id: 'instagram', name: 'Instagram Reels', aspect: '9:16', maxDuration: 90 },
  { id: 'youtube', name: 'YouTube Shorts', aspect: '9:16', maxDuration: 60 },
  { id: 'twitter', name: 'Twitter/X', aspect: '16:9', maxDuration: 140 },
  { id: 'original', name: 'Original', aspect: '16:9', maxDuration: Infinity },
];

const RESOLUTIONS = ['480p', '720p', '1080p'];
const QUALITIES = ['High', 'Medium', 'Low'];

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
  isExporting,
  progress,
  exportComplete,
  exportUrl,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState('original');
  const [resolution, setResolution] = useState('1080p');
  const [quality, setQuality] = useState('High');
  const [downloading, setDownloading] = useState(false);

  const handleExport = () => {
    const settings: ExportSettings = {
      platform: selectedPlatform,
      resolution,
      quality,
    };
    onExport(selectedPlatform, settings);
  };

  const handleDownload = async () => {
    if (!exportUrl) return;

    try {
      setDownloading(true);
      
      // Open URL in browser for download
      const supported = await Linking.canOpenURL(exportUrl);
      
      if (supported) {
        await Linking.openURL(exportUrl);
        Alert.alert('Download Started', 'Your video will download in your browser');
      } else {
        Alert.alert('Error', 'Cannot open download link');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not download video. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!exportUrl) return;

    try {
      const shareOptions = {
        title: 'Share Video',
        message: 'Check out my edited clip!',
        url: exportUrl,
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error);
        Alert.alert('Share Failed', 'Could not share video. Please try again.');
      }
    }
  };

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Export Clip</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!isExporting && !exportComplete ? (
            <>
              {/* Platform Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform</Text>
                <View style={styles.platformGrid}>
                  {PLATFORMS.map((platform) => (
                    <TouchableOpacity
                      key={platform.id}
                      style={[
                        styles.platformButton,
                        selectedPlatform === platform.id && styles.platformButtonSelected,
                      ]}
                      onPress={() => setSelectedPlatform(platform.id)}
                    >
                      <Text
                        style={[
                          styles.platformButtonText,
                          selectedPlatform === platform.id && styles.platformButtonTextSelected,
                        ]}
                      >
                        {platform.name}
                      </Text>
                      <Text style={styles.platformButtonAspect}>{platform.aspect}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Resolution Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resolution</Text>
                <View style={styles.optionRow}>
                  {RESOLUTIONS.map((res) => (
                    <TouchableOpacity
                      key={res}
                      style={[
                        styles.optionButton,
                        resolution === res && styles.optionButtonSelected,
                      ]}
                      onPress={() => setResolution(res)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          resolution === res && styles.optionButtonTextSelected,
                        ]}
                      >
                        {res}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quality Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quality</Text>
                <View style={styles.optionRow}>
                  {QUALITIES.map((qual) => (
                    <TouchableOpacity
                      key={qual}
                      style={[
                        styles.optionButton,
                        quality === qual && styles.optionButtonSelected,
                      ]}
                      onPress={() => setQuality(qual)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          quality === qual && styles.optionButtonTextSelected,
                        ]}
                      >
                        {qual}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Platform Info */}
              {selectedPlatformData && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    📱 Aspect Ratio: {selectedPlatformData.aspect}
                  </Text>
                  {selectedPlatformData.maxDuration !== Infinity && (
                    <Text style={styles.infoText}>
                      ⏱️ Max Duration: {selectedPlatformData.maxDuration}s
                    </Text>
                  )}
                </View>
              )}

              {/* Export Button */}
              <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                <Download size={20} color={colors.text} />
                <Text style={styles.exportButtonText}>Export Video</Text>
              </TouchableOpacity>
            </>
          ) : isExporting ? (
            /* Export Progress */
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.progressTitle}>Exporting...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              <Text style={styles.progressSubtext}>This may take a few minutes</Text>
            </View>
          ) : (
            /* Export Complete */
            <View style={styles.completeContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>✅</Text>
              </View>
              <Text style={styles.completeTitle}>Export Complete!</Text>
              <Text style={styles.completeSubtext}>Your video is ready</Text>

              <TouchableOpacity 
                style={[styles.actionButton, downloading && styles.actionButtonDisabled]} 
                onPress={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <Download size={20} color={colors.text} />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
                <Share2 size={20} color={colors.text} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  platformButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  platformButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  platformButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  platformButtonTextSelected: {
    color: colors.primary,
  },
  platformButtonAspect: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  optionButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  exportButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  progressTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  progressSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 40,
  },
  completeTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  completeSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  shareButton: {
    backgroundColor: colors.accent,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  doneButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  doneButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
});

export default ExportModal;
