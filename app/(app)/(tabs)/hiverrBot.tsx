import { chatService, firstMessage, voiceToText } from '@/services/chat';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// Add Voice import
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  PermissionsAndroid,
} from 'react-native';
import Markdown from 'react-native-markdown-display';


type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
};

// WhatsApp-like typing dots (existing)
function TypingDots() {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(120),
        ])
      );

    const a1 = pulse(d1, 0);
    const a2 = pulse(d2, 120);
    const a3 = pulse(d3, 240);

    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [d1, d2, d3]);

  const Dot = ({ v }: { v: Animated.Value }) => (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
          ],
        },
      ]}
    />
  );

  return (
    <View style={styles.typingDots}>
      <Dot v={d1} />
      <Dot v={d2} />
      <Dot v={d3} />
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#0f172a', fontSize: 14, lineHeight: 20 },
  paragraph: { marginTop: 0, marginBottom: 4 },
  bullet_list: { marginVertical: 4, paddingLeft: 6 },
  ordered_list: { marginVertical: 4, paddingLeft: 6 },
  list_item: { flexDirection: 'row', marginBottom: 2 },
  list_item_content: { flex: 1 },
  strong: { fontWeight: '700' },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  link: { color: '#2563eb' },
});

function VoiceWaveAnimation() {
  // Create multiple animated values for different bars using useMemo
  const bars = useMemo(() =>
    Array.from({ length: 7 }).map(() => new Animated.Value(0.1)),
    []
  );

  // Create the value for translateY multiplication once
  const translateYMultiplier = useMemo(() => new Animated.Value(-20), []);

  useEffect(() => {
    // Animation function for a single bar
    const animateBar = (bar: Animated.Value) => {
      // Random height between 0.3 and 1
      const toValue = 0.3 + Math.random() * 0.7;
      // Random duration between 300ms and 700ms
      const duration = 300 + Math.random() * 400;

      Animated.sequence([
        Animated.timing(bar, {
          toValue,
          duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(bar, {
          toValue: 0.2 + Math.random() * 0.3,
          duration: duration * 0.7,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ]).start(() => {
        // Continue the animation
        animateBar(bar);
      });
    };

    // Start animation for all bars
    const animations = bars.map(bar => {
      animateBar(bar);
      return bar;
    });

    return () => {
      // Proper cleanup
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [bars]); // Add bars as dependency

  return (
    <View style={styles.waveContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: 80,
              transform: [
                { scaleY: bar },
                { translateY: Animated.multiply(bar, translateYMultiplier) }
              ],
              backgroundColor: index % 2 === 0 ? '#60a5fa' : '#3b82f6',
              marginHorizontal: 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function HiverrBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<'ask' | 'agent' | 'llm'>('ask'); // new: chat mode state
  const [modeMenuVisible, setModeMenuVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voice, setVoice] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message>>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !typing, [input, typing]);

  const sendMessage = async () => {
    try {
      const text = input.trim();
      if (!text) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      };

      setInput('');
      setMessages(prev => [userMsg, ...prev]);

      // Simulate bot typing/response (UI-only, no API)
      setTyping(true);
      const response = await chatService(text, mode)
      if (!response.replay) {
        setTyping(false);
        console.error('Unexpected response format:', response);
        return;
      }
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: response.replay,
        timestamp: Date.now(),
      };
      setTimeout(() => {
        setMessages(prev => [botMsg, ...prev]);
        setTyping(false);
      }, 500)
    } finally {
      setTyping(false);
    }
  };

  // New: clear all chats with confirmation
  const clearChats = () => {
    Alert.alert(
      'Clear all chats',
      'Are you sure you want to delete all messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // keep a small greeting
            setMessages([{
              id: `m-${Date.now()}`,
              role: 'bot',
              text: 'Conversation cleared. How can I help you now?',
              timestamp: Date.now(),
            }]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && <View style={styles.avatar}><Text style={styles.avatarEmoji}>🧸</Text></View>}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          {isUser ? (
            <Text style={[styles.bubbleText, styles.userText]}>{item.text}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.text || ''}</Markdown>
          )}
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
        {isUser && <View style={styles.spacer} />}
      </View>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await firstMessage();
      if (response) {
        setMessages([{
          id: `m-${Date.now()}`,
          role: 'bot',
          text: response?.message,
          timestamp: Date.now(),
        }]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const modeName = mode === 'ask' ? 'Ask' : mode === 'llm' ? 'LLM' : 'Agentic';
      setMessages([{
        id: `mode-change-${Date.now()}`,
        role: 'bot',
        text: `Mode changed to ${modeName}. I'll respond using ${modeName} capabilities.`,
        timestamp: Date.now(),
      }]);
    }
  }, [mode]);


  const sendingVoiceforTranscript = async () => {
    if (!voice) return;
    const formData = new FormData();
    formData.append('audio', {
      uri: voice,
      type: 'audio/mp3',
      name: 'voice.mp3',
    } as any);
    const response = await voiceToText(formData);
    console.log(response, 'response')
    if (response) {
      setInput(response.text);
    }
  }

  // ask for microphone access
  async function requestMicrophonePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Your app needs access to your microphone for audio recording.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the microphone');
        return true;
      } else {
        console.log('Microphone permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  // request microphone permission on mount
  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  // Set up Voice event listeners
  useEffect(() => {
    const onSpeechStartHandler = () => {
      console.log("Speech started");
    };

    const onSpeechEndHandler = () => {
      console.log("Speech ended");
      setIsListening(false);
    };

    const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
      console.log("Speech results:", e);
      // Auto-update the input field with the speech result
      if (e.value && e.value.length > 0) {
        setInput(e.value[0]);
      }
    };

    const onSpeechErrorHandler = (e: SpeechErrorEvent) => {
      console.log("Speech error:", e);
      setIsListening(false);
    };

    // Set up Voice event handlers
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;
    Voice.onSpeechError = onSpeechErrorHandler;

    // Cleanup function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Implement voiceOnClick function
  const voiceOnClick = async () => {
    try {
      // Reset states
      setIsListening(true);
      // Start listening
      await Voice.start('English');
      setIsListening(true);
    } catch (e) {
      console.error("Error starting voice recognition:", e);
    }
  };

  // Implement stopListening function
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error("Error stopping voice recognition:", e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.header}>
        <View style={styles.headerAvatar}><Text style={styles.headerEmoji}>🧸</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Hiverr Bot</Text>
          <Text style={styles.headerSubtitle}>Personal assistant</Text>
        </View>

        {/* Mode dropdown trigger */}
        <Pressable
          style={styles.iconBtn}
          onPress={() => setModeMenuVisible(v => !v)}
          accessibilityLabel="Select chat mode"
        >
          <MaterialIcons name="swap-vert" size={20} color="#0f172a" />
          <Text style={styles.modeLabel}>{mode === 'ask' ? 'Ask' : mode === 'llm' ? 'LLM' : 'Agentic'}</Text>
        </Pressable>

        {/* Clear chats button */}
        <Pressable style={styles.iconBtn} onPress={clearChats} accessibilityLabel="Clear chats">
          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>

      {/* Mode menu */}
      {modeMenuVisible && (
        <View style={styles.modeMenuOverlay}>
          <Pressable style={styles.modeMenuBackdrop} onPress={() => setModeMenuVisible(false)} />
          <View style={styles.modeMenu}>
            <Pressable
              style={[styles.modeItem, mode === 'ask' && styles.modeItemSelected]}
              onPress={() => { setMode('ask'); setModeMenuVisible(false); }}
            >
              <Text style={[styles.modeItemText, mode === 'ask' && styles.modeItemTextSelected]}>Ask mode</Text>
              {mode === 'ask' && <MaterialIcons name="check" size={18} color="#3b82f6" />}
            </Pressable>
            <Pressable
              style={[styles.modeItem, mode === 'agent' && styles.modeItemSelected]}
              onPress={() => { setMode('agent'); setModeMenuVisible(false); }}
            >
              <Text style={[styles.modeItemText, mode === 'agent' && styles.modeItemTextSelected]}>Agent mode</Text>
              {mode === 'agent' && <MaterialIcons name="check" size={18} color="#3b82f6" />}
            </Pressable>
            <Pressable
              style={[styles.modeItem, mode === 'llm' && styles.modeItemSelected]}
              onPress={() => { setMode('llm'); setModeMenuVisible(false); }}
            >
              <Text style={[styles.modeItemText, mode === 'llm' && styles.modeItemTextSelected]}>LLM mode</Text>
              {mode === 'llm' && <MaterialIcons name="check" size={18} color="#3b82f6" />}
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.listWrap}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        {typing && (
          <View style={styles.typingRow}>
            <View style={styles.avatarSmall}><Text style={styles.avatarEmojiSmall}>🧸</Text></View>
            <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
              <TypingDots />
            </View>
          </View>
        )}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={voiceOnClick}
          disabled={input.length ? true : false}
          style={({ pressed }) => [
            { height: 44, width: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
            { opacity: pressed ? 0.8 : 1 }
          ]}
          accessibilityLabel='Voice mode'
        >
          <MaterialIcons name='record-voice-over' size={20} color='#ffffff' />
        </Pressable>
        <Pressable
          onPress={sendMessage}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: canSend ? (pressed ? 0.8 : 1) : 0.5 },
          ]}
          accessibilityLabel="Send message"
        >
          <MaterialIcons name="send" size={20} color="#ffffff" />
        </Pressable>
      </View>
      {/* <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04ff0028',
      }}>

        <Text style={{ color: 'white', fontWeight: 'bold' }}>Result: {voice}</Text>
        <Button
          title="Mic check"
          color={'#ace10d'}
          onPress={async () => {
            try {
              const audioText = await startSpeechToText();
              console.log('audioText:', { audioText });
              setVoice(audioText);
            } catch (error) {
              console.log({ error });
            }
          }}
        />
      </View> */}

      {/* Voice listening modal */}
      <Modal
        visible={isListening}
        transparent
        animationType="fade"
        onRequestClose={stopListening}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModal}>
            <Text style={styles.voiceTitle}>Listening...</Text>
            <VoiceWaveAnimation />
            <Text style={styles.voiceSubtitle}>Say something</Text>
            <Pressable
              style={styles.stopButton}
              onPress={stopListening}
            >
              <MaterialIcons name="stop" size={24} color="#fff" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  headerEmoji: { fontSize: 22 },
  headerTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },

  iconBtn: { marginLeft: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  modeLabel: { marginLeft: 6, color: '#0f172a', fontWeight: '600' },

  modeMenuOverlay: { position: 'absolute', top: 64, right: 12, left: 12, zIndex: 999 },
  modeMenuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modeMenu: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 6,
  },
  modeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, gap: 10 },
  modeItemSelected: { backgroundColor: '#eef2ff', borderRadius: 8 },
  modeItemText: { fontSize: 14, color: '#0f172a' },
  modeItemTextSelected: { color: '#3b82f6', fontWeight: '700' },

  listWrap: { flex: 1, paddingHorizontal: 12 },
  row: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarEmoji: { fontSize: 16 },
  spacer: { width: 32, marginLeft: 8 },

  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  botBubble: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
  userBubble: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  botText: { color: '#0f172a' },
  userText: { color: '#0b3b61' },
  timeText: { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'right' },

  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  typingBubble: { paddingVertical: 10 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarEmojiSmall: { fontSize: 14 },

  typingDots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64748b', marginHorizontal: 3 },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a', fontSize: 14 },
  sendBtn: { height: 44, width: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModal: {
    backgroundColor: '#fff',
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  voiceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});