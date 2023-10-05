import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConfirmacionPin = ({ route }) => {
  const { codtrabajador, url, pin, usuario, codcliente, pass, opcion } = route.params;
  const [pins, setPins] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [pinMatch, setPinMatch] = useState(true);
  const pinInputs = useRef([]);
  const navigation = useNavigation();

  useEffect(() => {
    alert("Url: " + url + "\nCódigo trabajador: " + codtrabajador + "\nPin: " + pin + "\nUsuario: " + usuario + "\nContraseña: " + pass + "\nCliente: " + codcliente);
  }, []);

  const escribirPin = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newPins = [...pins];
      newPins[index] = text;
      setPins(newPins);
      if (text.length === 1 && index < pins.length - 1) {
        pinInputs.current[index + 1].focus();
      }
      setPinMatch(true);
    }
  };

  const mostrarPin = () => {
    setShowPin(!showPin);
  };

  const confirmarPin = async () => {
    const fullPin = pins.join('');
    console.log('PIN confirmado:', fullPin);
    console.log('PIN anterior:', pin);

    if (fullPin === pin) {
      try {
        await AsyncStorage.setItem('data', JSON.stringify({ codtrabajador, url, pin: fullPin, usuario, pass, codcliente }));
      } catch (error) {
        console.error('Error al guardar los datos:', error);
      }
      navigation.navigate('Fichaje', { opcion });
    } else {
      setPinMatch(false);
      setPins(['', '', '', '']);
      pinInputs.current[0].focus();
    }
  };

  const isButtonDisabled = pins.some(code => code.length !== 1);

  return (
    <View style={styles.container}>
      <View style={styles.pinContainer}>
        {pins.map((pin, index) => (
          <TextInput
            key={index}
            ref={ref => (pinInputs.current[index] = ref)}
            style={styles.pinInput}
            value={pin}
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
        onPress={confirmarPin}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>Confirmar PIN</Text>
      </TouchableOpacity>
      {!pinMatch && <Text style={styles.errorText}>Los PINs no coinciden. Intente nuevamente.</Text>}
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
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInput: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  eyeButton: {
    marginTop: 10,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmacionPin;