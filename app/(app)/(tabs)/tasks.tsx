import React, { useEffect, useState } from 'react'
import { Text, View, FlatList, Pressable, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { getTasks, deleteTask } from '@/services/task-services'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Toast from 'react-native-toast-message';
import StatusModal from '@/components/task-components/StatusModal';
import { TaskTypes } from '@/constants/types';
import PrioritySelectModal from '@/components/task-components/PrioritySelectModal';
import MoreOptionsModal from '@/components/task-components/MoreOptionsModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function TaskListing() {
  const [tasks, setTasks] = useState<TaskTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusModal, setStatusModal] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<TaskTypes | null>(null);
  const [priorityModal, setPriorityModal] = useState(false);
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [nestedPopupPosition, setNestedPopupPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })

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

  return (
    <View style={{ padding: 6, display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
      { /* menuOptions Modal */}
      <PrioritySelectModal
        priorityModal={priorityModal}
        setPriorityModal={setPriorityModal}
        selectedTask={selectedTask}
        setReRender={setReRender}
        buttonPosition={nestedPopupPosition}
      />
      <MoreOptionsModal
        moreOptionsModal={moreOptionsModal}
        setMoreOptionsModal={setMoreOptionsModal}
        selectedTask={selectedTask}
        setReRender={setReRender}
        buttonPosition={buttonPosition}
        setPriorityModal={setPriorityModal}
        setNestedPopupPosition={setNestedPopupPosition}
      />
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