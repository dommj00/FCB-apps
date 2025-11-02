import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { clipsAPI } from '../services/api/clipsApi';
import { Clip } from '../types';
import ClipCard from '../components/ClipCard';
import FloatingActionButton from '../components/FloatingActionButton';
import SearchBar from '../components/SearchBar';
import FilterChip from '../components/FilterChip';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

const RESOLUTIONS = ['All', '720p', '1080p', '1440p'];
const STATUSES = ['All', 'complete', 'processing', 'error'];

const ClipsLibraryScreen = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchClips = async () => {
    try {
      console.log('Fetching clips...');
      const response = await clipsAPI.getClips();
      console.log('Fetched clips:', response.clips.length);
      setClips(response.clips);
    } catch (error: any) {
      console.error('Error fetching clips:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  // Filter clips based on search and filters
  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        clip.stream_title?.toLowerCase().includes(searchLower) ||
        clip.stream_game?.toLowerCase().includes(searchLower) ||
        clip.clip_id.toLowerCase().includes(searchLower);

      // Resolution filter
      const matchesResolution =
        selectedResolution === 'All' || clip.resolution === selectedResolution;

      // Status filter
      const matchesStatus =
        selectedStatus === 'All' || clip.status === selectedStatus;

      return matchesSearch && matchesResolution && matchesStatus;
    });
  }, [clips, searchQuery, selectedResolution, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClips();
  };

  const handleClipPress = (clipId: string) => {
    if (selectionMode) {
      toggleSelection(clipId);
    } else {
      console.log('Open clip:', clipId);
      Alert.alert('Clip Selected', 'Single clip editor coming soon!');
    }
  };

  const handleClipLongPress = (clipId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      toggleSelection(clipId);
    }
  };

  const toggleSelection = (clipId: string) => {
    const newSelected = new Set(selectedClips);
    if (newSelected.has(clipId)) {
      newSelected.delete(clipId);
    } else {
      newSelected.add(clipId);
    }
    setSelectedClips(newSelected);

    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedClips(new Set());
    setSelectionMode(false);
  };

  const handleCreateMontage = () => {
    const clipIds = Array.from(selectedClips);
    console.log('Creating montage with clips:', clipIds);
    Alert.alert(
      'Create Montage',
      `Ready to create montage with ${clipIds.length} clips!\n\nMontage editor coming soon!`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading clips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Clips Library</Text>
          {selectionMode && (
            <Text style={styles.selectionCount}>
              {selectedClips.size} selected
            </Text>
          )}
        </View>
        {selectionMode && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSelection}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filters */}
      {!selectionMode && (
        <View style={styles.filtersContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
          
          <Text style={styles.filterLabel}>Resolution</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}>
            {RESOLUTIONS.map((res) => (
              <FilterChip
                key={res}
                label={res}
                active={selectedResolution === res}
                onPress={() => setSelectedResolution(res)}
              />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}>
            {STATUSES.map((status) => (
              <FilterChip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                active={selectedStatus === status}
                onPress={() => setSelectedStatus(status)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results count */}
      {!selectionMode && (
        <Text style={styles.resultsCount}>
          {filteredClips.length} clip{filteredClips.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Clips Grid */}
      <FlatList
        data={filteredClips}
        keyExtractor={(item) => item.clip_id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ClipCard
            clip={item}
            selected={selectedClips.has(item.clip_id)}
            onPress={() => handleClipPress(item.clip_id)}
            onLongPress={() => handleClipLongPress(item.clip_id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          selectionMode && styles.listContentWithFAB,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clips found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        visible={selectionMode && selectedClips.size > 0}
        count={selectedClips.size}
        onPress={handleCreateMontage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  selectionCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 4,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  resultsCount: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  listContent: {
    padding: spacing.lg,
  },
  listContentWithFAB: {
    paddingBottom: spacing.xl + 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});

export default ClipsLibraryScreen;
