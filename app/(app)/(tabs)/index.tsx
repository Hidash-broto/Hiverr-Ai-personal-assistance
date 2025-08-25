import { useAuth } from '@/app/context/AuthContext';
import { TaskTypes } from '@/constants/types';
import { getDashboardData } from '@/services/dashboard';
import { getEvents } from '@/services/event';
import { getTasks } from '@/services/task-services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DashboardStats {
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    upcomingEvents: number;
    todayEvents: number;
}

export default function HomeScreen() {
    const { deleteToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalTasks: 0,
        openTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        upcomingEvents: 0,
        todayEvents: 0
    });
    const [recentTasks, setRecentTasks] = useState<TaskTypes[]>([]);
    const [todayEvents, setTodayEvents] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const currentDate = useMemo(() => new Date(), []);
    const currentHour = currentDate.getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
    const todayDateString = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch tasks
            const response = await getDashboardData(currentDate);
            const { taskStats, todayEvents, upcomingEvents, recentTasks } = response?.data;
            if (response?.status) {
                setTodayEvents(todayEvents);
                setRecentTasks(recentTasks);
                console.log(response.data);
                setStats({
                    ...taskStats,
                    todayEvents : todayEvents?.length | 0,
                    upcomingEvents: upcomingEvents?.length | 0,
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const quickActions = [
        {
            icon: 'add-task',
            title: 'New Task',
            color: '#3b82f6',
            onPress: () => router.push('/create-task')
        },
        {
            icon: 'event',
            title: 'New Event',
            color: '#10b981',
            onPress: () => router.push('/create-event')
        },
        {
            icon: 'chat',
            title: 'Hiverr Bot',
            color: '#8b5cf6',
            onPress: () => router.push('/hiverrBot')
        },
        {
            icon: 'calendar-today',
            title: 'Calendar',
            color: '#f59e0b',
            onPress: () => router.push('/calender')
        }
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: deleteToken }
            ]
        );
    };

    const getTaskPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'in-progress': return '#3b82f6';
            case 'open': return '#6b7280';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        // refreshControl={
        //     <Pressable onPress={onRefresh}>
        //         <ActivityIndicator animating={refreshing} color="#3b82f6" />
        //     </Pressable>
        // }
        >
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>{greeting}!</Text>
                        <Text style={styles.date}>{todayDateString}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
                        <MaterialIcons name="person" size={24} color="#6b7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
                        <Text style={styles.statNumber}>{stats?.totalTasks}</Text>
                        <Text style={styles.statLabel}>Total Tasks</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
                        <Text style={styles.statNumber}>{stats?.completedTasks}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
                        <Text style={styles.statNumber}>{stats.todayEvents}</Text>
                        <Text style={styles.statLabel}>Today&apos;s Events</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
                        <Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionCard}
                            onPress={action.onPress}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                                <MaterialIcons name={action.icon as any} size={24} color="white" />
                            </View>
                            <Text style={styles.quickActionTitle}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Today's Events */}
            {todayEvents?.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today&apos;s Events</Text>
                        <TouchableOpacity onPress={() => router.push('/events')}>
                            <Text style={styles.sectionLink}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {todayEvents.slice(0, 3).map((event, index) => (
                        <View key={index} style={styles.eventCard}>
                            <View style={styles.eventTime}>
                                <Text style={styles.eventTimeText}>
                                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <View style={styles.eventDetails}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                {event.location?.address && (
                                    <Text style={styles.eventLocation}>{event.location.address}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Recent Tasks */}
            {recentTasks?.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Tasks</Text>
                        <TouchableOpacity onPress={() => router.push('/tasks')}>
                            <Text style={styles.sectionLink}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {recentTasks.map((task, index) => (
                        <View key={task._id} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <View style={[styles.priorityDot, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getTaskStatusColor(task.status) }]}>
                                    <Text style={styles.statusText}>{task.status}</Text>
                                </View>
                            </View>
                            {task.description && (
                                <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
                            )}
                            {task.dueDate && (
                                <Text style={styles.taskDueDate}>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Empty State */}
            {stats.totalTasks === 0 && todayEvents?.length === 0 && (
                <View style={styles.emptyState}>
                    <MaterialIcons name="dashboard" size={64} color="#d1d5db" />
                    <Text style={styles.emptyStateTitle}>Welcome to Hiverr!</Text>
                    <Text style={styles.emptyStateText}>
                        Start by creating your first task or event, or chat with Hiverr Bot for assistance.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
        fontSize: 16,
    },
    header: {
        backgroundColor: '#ffffff',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    date: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    sectionLink: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    eventTime: {
        marginRight: 16,
        alignItems: 'center',
        minWidth: 60,
    },
    eventTimeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 14,
        color: '#6b7280',
    },
    taskCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    taskTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500',
    },
    taskDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
        lineHeight: 20,
    },
    taskDueDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});