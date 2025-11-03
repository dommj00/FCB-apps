import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Search, X, TrendingUp } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../theme';
import { config } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MemeLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMeme: (memeUrl: string, gifData: any) => void;
}

interface GifData {
  id: string;
  url: string;
  preview_url: string;
  width: number;
  height: number;
  title: string;
}

const MemeLibraryModal: React.FC<MemeLibraryModalProps> = ({
  visible,
  onClose,
  onSelectMeme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending');

  useEffect(() => {
    if (visible) {
      if (activeTab === 'trending') {
        fetchTrendingGifs();
      }
    }
  }, [visible, activeTab]);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${config.giphy.apiKey}&limit=20&rating=g`
      );
      const data = await response.json();
      
      const formattedGifs: GifData[] = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview_url: gif.images.fixed_width.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
        title: gif.title,
      }));
      
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${config.giphy.apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
      );
      const data = await response.json();
      
      const formattedGifs: GifData[] = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview_url: gif.images.fixed_width.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
        title: gif.title,
      }));
      
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveTab('search');
      searchGifs(searchQuery);
    }
  };

  const handleSelectGif = (gif: GifData) => {
    onSelectMeme(gif.url, gif);
    onClose();
  };

  const renderGifItem = ({ item }: { item: GifData }) => (
    <TouchableOpacity
      style={styles.gifItem}
      onPress={() => handleSelectGif(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.preview_url }}
        style={styles.gifImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Meme</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search GIFs..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setActiveTab('trending');
                  fetchTrendingGifs();
                }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => {
              setActiveTab('trending');
              fetchTrendingGifs();
            }}
          >
            <TrendingUp size={18} color={activeTab === 'trending' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => {
              if (searchQuery.trim()) {
                setActiveTab('search');
                searchGifs(searchQuery);
              }
            }}
          >
            <Search size={18} color={activeTab === 'search' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search
            </Text>
          </TouchableOpacity>
        </View>

        {/* GIF Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading GIFs...</Text>
          </View>
        ) : (
          <FlatList
            data={gifs}
            renderItem={renderGifItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gifGrid}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Powered by Giphy */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by GIPHY</Text>
        </View>
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  gifGrid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  gifItem: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  gifImage: {
    width: '100%',
    height: (SCREEN_WIDTH / 2) - spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
  footer: {
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});

export default MemeLibraryModal;
