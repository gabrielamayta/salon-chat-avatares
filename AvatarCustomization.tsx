import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

type Props = {
  onSave: (avatarData: { color: 'negro' | 'naranja' | 'violeta' }) => void;
};

export default function AvatarCustomization({ onSave }: Props) {
  const [avatarColor, setAvatarColor] = useState<'negro' | 'naranja' | 'violeta'>('negro');

  const getAnimationSource = () => {
    switch (avatarColor) {
      case 'negro':
        return require('./assets/animations/cat-black.json');
      case 'naranja':
        return require('./assets/animations/cat-orange.json');
      case 'violeta':
      default:
        return require('./assets/animations/cat-violet.json');
    }
  };

  const handleSave = () => {
    onSave({ color: avatarColor });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personaliza tu Avatar</Text>
      <LottieView
        source={getAnimationSource()}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <View style={styles.buttonsContainer}>
        <Button title="Negro" onPress={() => setAvatarColor('negro')} />
        <Button title="Naranja" onPress={() => setAvatarColor('naranja')} />
        <Button title="Violeta" onPress={() => setAvatarColor('violeta')} />
      </View>
      <Text style={{ marginTop: 20 }}>Color seleccionado: {avatarColor}</Text>
      <View style={{ marginTop: 30 }}>
        <Button title="Guardar Avatar" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
});
