import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { getTasks } from '@/services/task-services'

interface Task {
  title: string,
  description: string,
  status: string,
  user: 
}

function TaskListing() {
  const [tasks, setTasks] = useState()

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTasks();
      console.log(response, 'response task');
      if (response?.status) {
        setTasks(response?.tasks);
      }
    }
    fetchData();
  })
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {
        tasks.map(() => {

        })
      }
    </View>
  )
}

export default TaskListing