import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Pin = ({ route }) => {
  const { codtrabajador, url } = route.params
  const [codes, setCodes] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const codeInputs = useRef([]);
  const navigate = useNavigation();

  useEffect(() => {
    console.log(codtrabajador)
  }, [])

  const mostrarPin = () => {
    setShowPin(!showPin);
  };

  const escribirPin = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newCodes = [...codes];
      newCodes[index] = text;
      setCodes(newCodes);
      if (text.length === 1 && index < codes.length - 1) {
        codeInputs.current[index + 1].focus();
      }
    }
  };

  const crearPin = () => {
    const fullCode = codes.join('');
    navigate.navigate('ConfirmacionPin', { codtrabajador, url, pin: fullCode });
  };

  const isButtonDisabled = codes.some(code => code.length !== 1);

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        {codes.map((code, index) => (
          <TextInput
            key={index}
            ref={ref => (codeInputs.current[index] = ref)}
            style={styles.codeInput}
            value={code}
            onChangeText={text => escribirPin(text, index)}
            maxLength={1}
            keyboardType="numeric"
            secureTextEntry={!showPin}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.eyeButton} onPress={mostrarPin}>
        <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, isButtonDisabled && styles.disabledButton]}
        onPress={crearPin}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>Crear Pin</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeInput: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  eyeButton: {
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Pin;