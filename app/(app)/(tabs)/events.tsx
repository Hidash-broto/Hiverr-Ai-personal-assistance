import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getEvents, updateEvent, deleteEvent } from '@/services/event';
import MoreOptionModal from '@/components/event-components/MoreOptionModal';
import { useFocusEffect } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

// Mock event type - replace with your actual event type
interface EventType {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

function Events() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<{ label: string, value: string | null }>({ label: 'All', value: null });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const measureButton = (event: any) => {
    event.target?.measure?.((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setButtonPosition({ x: pageX, y: pageY, width, height });
    });
  };

  const mountedRef = useRef(true);
  const reqSeqRef = useRef(0);
  const firstLoadDoneRef = useRef(false);

  const fetchEvents = useCallback(async (opts?: { showRefresh?: boolean }) => {
    const reqId = ++reqSeqRef.current;

    if (opts?.showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const events = await getEvents(searchQuery, statusFilter.value);
      if (mountedRef.current && reqId === reqSeqRef.current) {
        setEvents(events);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (e: any) {
      alert(e.response.data.message || 'Failed to fetch events');
      if (mountedRef.current && reqId === reqSeqRef.current) {
        setEvents([]);
      }
    } finally {
      if (mountedRef.current && reqId === reqSeqRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [searchQuery, statusFilter.value]);

  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      fetchEvents();
      return () => {
        mountedRef.current = false;
      };
    }, [])
  );


  useEffect(() => {
    if (!firstLoadDoneRef.current) {
      firstLoadDoneRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      fetchEvents();
    }, 600);
    return () => clearTimeout(t);
  }, [searchQuery, statusFilter, fetchEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start > now) return 'Upcoming';
    if (start <= now && end >= now) return 'Ongoing';
    return 'Completed';
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      upcoming: { bg: '#eef2ff', color: '#3730a3', label: 'Upcoming' },
      ongoing: { bg: '#ecfeff', color: '#065f46', label: 'Ongoing' },
      completed: { bg: '#ecfccb', color: '#365314', label: 'Completed' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
    };
    const cfg = map[status.toLowerCase()] || map.upcoming;
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  };

  const AttendeeCount = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <View style={styles.attendeeBadge}>
        <MaterialIcons name="person" size={12} color="#64748b" />
        <Text style={styles.attendeeText}>{count}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: EventType }) => (
    <View style={styles.card} key={item?._id}>
      <View style={styles.cardHeader}>
        <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => {
              setSelectedEvent(item);
              // Handle status change or navigation
            }}
            style={styles.smallPillButton}
          >
            <Text style={styles.smallPillButtonText}>{formatStatus(item?.startTime, item?.endTime)}</Text>
            <IconSymbol size={14} name="arrow.down.app.fill" color='white' />
          </Pressable>
          <Pressable
            onPress={(e) => {
              measureButton(e);
              setSelectedEvent(item);
              setMoreOptionsModal(true);
              // Handle more options
            }}
            style={styles.iconButton}
          >
            <MaterialIcons size={18} name="more-vert" color='white' />
          </Pressable>
        </View>
      </View>

      {!!item.description && (
        <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
      )}

      <View style={styles.timeRow}>
        <MaterialIcons name="schedule" size={16} color="#64748b" />
        <Text style={styles.timeText}>
          {formatDate(item.startTime)} - {formatDate(item.endTime)}
        </Text>
      </View>

      {item.location && (
        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={16} color="#64748b" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <StatusBadge status={formatStatus(item.startTime, item.endTime)} />
        <AttendeeCount count={item.attendees.length} />
      </View>
    </View>
  );

  const FilterModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    if (!visible) return null;

    const statusOptions = [
      { value: null, label: 'All' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          {statusOptions.map((option) => (
            <Pressable
              key={option.value}
              style={styles.modalItem}
              onPress={() => {
                setStatusFilter(option);
                onClose();
              }}
            >
              <Text style={[
                styles.modalItemText,
                statusFilter.value === option.value && styles.modalItemTextSelected
              ]}>
                {option.label}
              </Text>
              {statusFilter.value === option.value && (
                <MaterialIcons name="check" size={20} color="#3b82f6" />
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search + Filters */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events"
            placeholderTextColor="#94a3b8"
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterChip}
          >
            <MaterialIcons name="filter-list" size={16} color="#0f172a" />
            <Text style={styles.filterChipText}>{statusFilter.label}</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event" size={42} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting filters or search</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 24 }}
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={() => fetchEvents({ showRefresh: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />

      <MoreOptionModal
        moreOptionsModal={moreOptionsModal}
        setMoreOptionsModal={setMoreOptionsModal}
        selectedEvent={selectedEvent}
        fetchEvents={fetchEvents}
        buttonPosition={buttonPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topBar: {
    width: '100%',
    marginBottom: 12,
  },
  searchBox: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChipText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallPillButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  smallPillButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  iconButton: {
    backgroundColor: '#94a3b8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  cardDescription: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  attendeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  attendeeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 13,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptySubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748b',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: screenHeight * 0.5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemText: {
    fontSize: 16,
    color: '#334155',
  },
  modalItemTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default Events;