import React, { useEffect, useState } from 'react'
import { Text, View, FlatList, Pressable, StyleSheet, Dimensions, TextInput } from 'react-native'
import { getTasks } from '@/services/task-services'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import StatusModal from '@/components/task-components/StatusModal';
import { TaskTypes } from '@/constants/types';
import MoreOptionsModal from '@/components/task-components/MoreOptionsModal';
import FilterModal from '@/components/task-components/FilterModal';

const { height: screenHeight } = Dimensions.get('window');

function TaskListing() {
  const [tasks, setTasks] = useState<TaskTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getTasks();
      if (response?.status && Array.isArray(response?.tasks)) {
        setTasks(response?.tasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [reRender]);

  const measureButton = (event: any) => {
    // Get the position and dimensions of the button
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
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
    const debouncedSearch = setTimeout(async () => {
      setLoading(true);
      const response = await getTasks(searchQuery, priorityFilter?.value, statusFilter?.value);
      if (response?.status) {
        setTasks(response?.tasks);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(debouncedSearch);
  }, [searchQuery, priorityFilter, statusFilter]);

  const renderFilterModal = (modalType: string) => {
    setCurrentFilterType(modalType);
    setFilterModalVisible(true);
  }

  return (
    <View style={{ padding: 6, display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '100%', marginBottom: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextInput
          style={{ height: 40, paddingHorizontal: 10, borderRadius: 5, width: '47%', marginBottom: 10, backgroundColor: '#ffffff', marginTop: 10 }}
          placeholder="Search tasks..."
          onChangeText={(text) => setSearchQuery(text)}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'space-between', paddingHorizontal: 10 }}>
          <Pressable
            onPress={() => {
              renderFilterModal('status')
            }}
            style={{ borderRadius: 5, padding: 5, width: '47%', height: 40, backgroundColor: '#ffffffff', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={styles.dropdownTriggerText}>{statusFilter?.label}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              renderFilterModal('priority')
            }}
            style={{ borderRadius: 5, padding: 5, width: '47%', height: 40, backgroundColor: '#ffffffff', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={styles.dropdownTriggerText}>{priorityFilter?.label}</Text>
          </Pressable>
        </View>
      </View>
      {loading && <Text>Loading...</Text>}
      {!loading && tasks.length === 0 && <Text>No tasks available.</Text>}
      <FlatList
        data={tasks}
        keyExtractor={(_, index) => `task-${index}`}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 8, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', }}>{item.title}</Text>
              <Text style={{ fontSize: 11, opacity: 0.7 }}>{item.description}</Text>
            </View>
            <View style={{ width: '40%', display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-between', paddingHorizontal: 5 }}>
              <Pressable
                onPress={() => {
                  setSelectedTask(item);
                  setStatusModal(true);
                }}
                style={{ ...styles.dropdownTrigger, backgroundColor: item?.status === 'open' ? '#e0e0e0' : item?.status === 'in_progress' ? '#88afea' : item?.status === 'closed' ? '#abd56d' : '#e0e0e0' }}
              >
                <Text style={styles.dropdownTriggerText}>{formateStatus(item?.status)}</Text>
                <IconSymbol size={17} name="arrow.down.app.fill" color='white' />
              </Pressable>
              <Pressable
                onPress={(event) => {
                  measureButton(event)
                  setSelectedTask(item)
                  setMoreOptionsModal(true)
                }}
                style={styles.moreOptionsButton}
              >
                <MaterialIcons size={17} name="more-vert" color='white' />
              </Pressable>
            </View>
          </View>
        )}
      />
      {/* Dropdown Modal */}
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
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingVertical: 3,
    // paddingHorizontal: 3,
    borderRadius: 5,
    // Shadow for Android
    elevation: 2,
    // Shadow for iOS
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
    // Shadow for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  dropdownTriggerText: {
    fontSize: 10,
    fontWeight: 'semibold',
    marginRight: 5,
  },
  icon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayPriority: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
  },
  dropdownModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: screenHeight * 0.4, // Limit height to prevent taking whole screen
    width: '80%', // Adjust width as needed
    // Add shadow to the modal content for depth
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
    borderBottomColor: '#f0f0f0', // Light separator
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
    // Shadows for depth
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
    // Shadows for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

export default TaskListing