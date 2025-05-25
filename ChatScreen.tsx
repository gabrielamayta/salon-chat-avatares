import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useRoute } from '@react-navigation/native';

type AvatarColor = 'negro' | 'naranja' | 'violeta';

type Message = {
  id: string;
  userId: string;
  avatar: AvatarColor;  
  text: string;
  timestamp: number;
  animationKey?: string;
};

export default function ChatScreen() {
  const route = useRoute();
  const { avatar } = route.params as { avatar: AvatarColor };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const userId = useRef(`user_${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.1.45:8080/ws");

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
    };

    ws.current.onmessage = (e) => {
      try {
        const msg: Message = JSON.parse(e.data);
        msg.id = Math.random().toString(36).substring(7);
        msg.animationKey = detectAnimationKey(msg.text);
        setMessages((prev) => [msg, ...prev]); 
      } catch (error) {
        console.warn('Mensaje inválido', error);
      }
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error', e);
    };

    ws.current.onclose = () => {
      console.log('WebSocket cerrado');
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const detectAnimationKey = (text: string): string | undefined => {
    if (text.includes('😂')) return 'laugh';
    if (text.includes('❤️')) return 'heart';
    if (text.includes('👋')) return 'wave';
    return undefined;
  };

  const getAnimationSource = (color: AvatarColor, animationKey?: string) => {
    const baseAnimation = {
      negro: require('./assets/animations/cat-black.json'),
      naranja: require('./assets/animations/cat-orange.json'),
      violeta: require('./assets/animations/cat-violet.json'),
    }[color];

    const reactionAnimations: Record<string, any> = {
      laugh: require('./assets/animations/reactions/laugh.json'),
      heart: require('./assets/animations/reactions/heart.json'),
      wave: require('./assets/animations/reactions/hola.json'),
    };

    return animationKey && reactionAnimations[animationKey]
      ? reactionAnimations[animationKey]
      : baseAnimation;
  };

  const sendMessage = () => {
    if (!inputText.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const messageToSend: Message = {
      id: Math.random().toString(36).substring(7),
      userId: userId.current,
      avatar,  // envío sólo el color string
      text: inputText,
      timestamp: Date.now(),
      animationKey: detectAnimationKey(inputText),
    };

    ws.current.send(JSON.stringify(messageToSend));
    setInputText('');
  };

 const renderItem = ({ item }: { item: Message }) => {
  const animationSource = getAnimationSource(item.avatar, item.animationKey);

  return (
    <View style={styles.messageContainer}>
      {animationSource && (
        <LottieView
          source={animationSource}
          autoPlay
          loop={!!item.animationKey}
          style={styles.avatarAnimation}
        />
      )}
      <View style={styles.messageTextContainer}>
        <Text style={styles.messageUser}>{item.userId}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.messageList}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribí un mensaje..."
          />
          <Button title="Enviar" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { flex: 1, padding: 10, backgroundColor: '#f0f0f0' },
  messageContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  avatarAnimation: { width: 50, height: 50, marginRight: 10 },
  messageTextContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    maxWidth: '80%',
  },
  messageUser: { fontWeight: 'bold', marginBottom: 3 },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 30,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
});
