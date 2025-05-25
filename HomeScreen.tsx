import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AvatarCustomization from './AvatarCustomization';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [avatar, setAvatar] = useState<{ color: 'negro' | 'naranja' | 'violeta' } | null>(null);
  const [showChatButton, setShowChatButton] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (avatar) {
      const timer = setTimeout(() => {
        setShowChatButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [avatar]);

  const getAnimationSource = () => {
    switch (avatar?.color) {
      case 'negro':
        return require('./assets/animations/cat-black.json');
      case 'naranja':
        return require('./assets/animations/cat-orange.json');
      case 'violeta':
      default:
        return require('./assets/animations/cat-violet.json');
    }
  };

  return (
    <View style={styles.container}>
      {!avatar ? (
        <AvatarCustomization onSave={setAvatar} />
      ) : (
        <>
          <Text style={styles.title}>¡Avatar guardado!</Text>
          <LottieView
            source={getAnimationSource()}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ marginTop: 20 }}>Color: {avatar.color}</Text>
          {showChatButton && (
            <View style={{ marginTop: 30 }}>
              <Button
                title="Entrar al chat"
                onPress={() => navigation.navigate('Chat', { avatar: avatar.color })}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
