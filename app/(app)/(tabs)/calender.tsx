import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getEvents } from '@/services/event';
import { CreateEventProps } from '@/constants/types';

// Calendar component
interface CalendarEvent {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  attendees: string[];
}

function Calendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Get calendar data
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEvents('', null, currentDate.getMonth() + 1);
      if (response && Array.isArray(response)) {
        setEvents(response);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    return getEventsForDate(date).length > 0;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time for events
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handle date selection
  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  // Navigate to create event with selected date
  const handleCreateEvent = () => {
    if (selectedDate) {
      router.push(`/create-event?date=${selectedDate.toISOString()}`);
    } else {
      router.push('/create-event');
    }
  };

  // Get status color
  const getStatusColor = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start > now) return { color: '#3b82f6', label: 'Upcoming' };
    if (start <= now && end >= now) return { color: '#10b981', label: 'Ongoing' };
    return { color: '#6b7280', label: 'Completed' };
  };

  const calendarDays = generateCalendarDays();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.headerSubtitle}>Manage your schedule</Text>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <MaterialIcons name="chevron-left" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.monthText}>{formatDate(currentDate)}</Text>

          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <MaterialIcons name="chevron-right" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Day Labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                date && isToday(date) && styles.todayCell,
                date && isSelected(date) && styles.selectedCell,
              ]}
              onPress={() => date && handleDatePress(date)}
              disabled={!date}
            >
              {date && (
                <>
                  <Text style={[
                    styles.dayText,
                    isToday(date) && styles.todayText,
                    isSelected(date) && styles.selectedText,
                  ]}>
                    {date.getDate()}
                  </Text>
                  {hasEvents(date) && (
                    <View style={styles.eventIndicator} />
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Date Events */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <View style={styles.eventsSectionHeader}>
              <Text style={styles.eventsSectionTitle}>
                Events for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <TouchableOpacity
                style={styles.addEventButton}
                onPress={handleCreateEvent}
              >
                <MaterialIcons name="add" size={20} color="#ffffff" />
                <Text style={styles.addEventButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : selectedDateEvents.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <MaterialIcons name="event" size={32} color="#9ca3af" />
                <Text style={styles.noEventsText}>No events scheduled</Text>
                <TouchableOpacity
                  style={styles.createEventButton}
                  onPress={handleCreateEvent}
                >
                  <Text style={styles.createEventButtonText}>Create Event</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {selectedDateEvents.map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    style={styles.eventCard}
                    onPress={() => router.push(`/create-event?eventId=${event._id}`)}
                  >
                    <View style={styles.eventCardHeader}>
                      <View style={[
                        styles.eventStatusDot,
                        { backgroundColor: getStatusColor(event.startTime, event.endTime).color }
                      ]} />
                      <Text style={styles.eventTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                    </View>

                    <View style={styles.eventTime}>
                      <MaterialIcons name="schedule" size={14} color="#6b7280" />
                      <Text style={styles.eventTimeText}>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </Text>
                    </View>

                    {event.location && (
                      <View style={styles.eventLocation}>
                        <MaterialIcons name="place" size={14} color="#6b7280" />
                        <Text style={styles.eventLocationText} numberOfLines={1}>
                          {event.location.address}
                        </Text>
                      </View>
                    )}

                    {event.attendees.length > 0 && (
                      <View style={styles.eventAttendees}>
                        <MaterialIcons name="people" size={14} color="#6b7280" />
                        <Text style={styles.eventAttendeesText}>
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        {!selectedDate && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/create-event')}
            >
              <MaterialIcons name="add-circle" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>Create New Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/events')}
            >
              <MaterialIcons name="list" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>View All Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  todayButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  dayLabels: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    margin: 1,
  },
  todayCell: {
    backgroundColor: '#dbeafe',
  },
  selectedCell: {
    backgroundColor: '#3b82f6',
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  todayText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  eventsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addEventButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noEventsText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  createEventButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  eventsList: {
    gap: 8,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventLocationText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventAttendeesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickActions: {
    marginTop: 24,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  quickActionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default Calendar;