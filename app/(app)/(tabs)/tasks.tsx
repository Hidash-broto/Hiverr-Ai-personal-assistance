import FilterModal from '@/components/task-components/FilterModal';
import MoreOptionsModal from '@/components/task-components/MoreOptionsModal';
import StatusModal from '@/components/task-components/StatusModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TaskTypes } from '@/constants/types';
import { getTasks } from '@/services/task-services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

function TaskListing() {
  const [tasks, setTasks] = useState<TaskTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusModal, setStatusModal] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<TaskTypes | null>(null);
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<{ label: string, value: string }>({ label: 'All', value: 'all' });
  const [statusFilter, setStatusFilter] = useState<{ label: string, value: string }>({ label: 'All', value: 'all' });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState<string | null>(null);

  const fetchData = async (opts?: { showRefresh?: boolean }) => {
    opts?.showRefresh ? setRefreshing(true) : setLoading(true);
    const response = await getTasks(searchQuery, priorityFilter?.value, statusFilter?.value);
    if (response?.status && Array.isArray(response?.tasks)) {
      setTasks(response?.tasks);
      setReRender(false);
      setSelectedTask(null);
    } else {
      setTasks([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [reRender])
  );

  const measureButton = (event: any) => {
    event.target?.measure?.((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setButtonPosition({ x: pageX, y: pageY, width, height });
    });
  };

  const formateStatus = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'closed': return 'Closed'
      default: return 'Open'
    }
  }

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, priorityFilter, statusFilter]);

  const renderFilterModal = (modalType: string) => {
    setCurrentFilterType(modalType);
    setFilterModalVisible(true);
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      open: { bg: '#eef2ff', color: '#3730a3', label: 'Open' },
      in_progress: { bg: '#ecfeff', color: '#065f46', label: 'In Progress' },
      closed: { bg: '#ecfccb', color: '#365314', label: 'Closed' },
    };
    const cfg = map[status] || map.open;
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  };

  const PriorityBadge = ({ priority }: { priority?: string }) => {
    if (!priority) return null;
    const map: Record<string, { bg: string; color: string; label: string }> = {
      low: { bg: '#ecfeff', color: '#0369a1', label: 'Low' },
      medium: { bg: '#fef9c3', color: '#92400e', label: 'Medium' },
      high: { bg: '#fee2e2', color: '#991b1b', label: 'High' },
    };
    const cfg = map[priority] || { bg: '#f1f5f9', color: '#334155', label: priority };
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => {
              setSelectedTask(item);
              setStatusModal(true);
            }}
            style={styles.smallPillButton}
          >
            <Text style={styles.smallPillButtonText}>{formateStatus(item?.status)}</Text>
            <IconSymbol size={14} name="arrow.down.app.fill" color='white' />
          </Pressable>
          <Pressable
            onPress={(event) => {
              measureButton(event)
              setSelectedTask(item)
              setMoreOptionsModal(true)
            }}
            style={styles.iconButton}
          >
            <MaterialIcons size={18} name="more-vert" color='white' />
          </Pressable>
        </View>
      </View>

      {!!item?.description && (
        <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
      )}

      <View style={styles.metaRow}>
        <StatusBadge status={item?.status} />
        <PriorityBadge priority={item?.priority} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search + Filters */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks"
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
            onPress={() => renderFilterModal('status')}
            style={styles.filterChip}
          >
            <MaterialIcons name="filter-list" size={16} color="#0f172a" />
            <Text style={styles.filterChipText}>{statusFilter?.label}</Text>
          </Pressable>
          <Pressable
            onPress={() => renderFilterModal('priority')}
            style={styles.filterChip}
          >
            <MaterialIcons name="flag" size={16} color="#0f172a" />
            <Text style={styles.filterChipText}>{priorityFilter?.label}</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="checklist" size={42} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No tasks found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting filters or search</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 24 }}
          data={tasks}
          keyExtractor={(item: any, index) => `${item?.id ?? item?._id ?? index}`}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={() => fetchData({ showRefresh: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <StatusModal
        animationType="fade"
        transparent={true}
        statusModal={statusModal}
        setStatusModal={setStatusModal}
        selectedTask={selectedTask}
        reRender={reRender}
        setReRender={setReRender}
      />
      <MoreOptionsModal
        moreOptionsModal={moreOptionsModal}
        setMoreOptionsModal={setMoreOptionsModal}
        selectedTask={selectedTask}
        setReRender={setReRender}
        buttonPosition={buttonPosition}
      />

      {filterModalVisible && (
        <FilterModal
          setValue={currentFilterType === 'priority' ? setPriorityFilter : setStatusFilter}
          setVisible={() => setFilterModalVisible(false)}
          values={
            currentFilterType === 'priority'
              ? [
                { value: 'all', label: 'All' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]
              : [
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'closed', label: 'Closed' }
              ]
          }
          visible={!!filterModalVisible}
          loading={loading}
        />
      )}
    </View >
  )
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
  } as any,
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  } as any,
  filterChip: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as any,
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
    // shadow
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

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
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

  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: 90,
  },
  moreOptionsButton: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  dropdownTriggerText: {
    fontSize: 10,
    fontWeight: '600',
    marginRight: 5,
  },
  icon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayPriority: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dropdownModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: screenHeight * 0.4,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  popoverMenuPriority: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popoverPriorityMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

export default TaskListing