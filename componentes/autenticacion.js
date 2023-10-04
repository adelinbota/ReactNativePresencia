import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Backr, Linking } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'

export default function Autenticacion() {
  const [hasCompletedAuthentication, setHasCompletedAuthentication] = useState(false);
  const [codes, setCodes] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [pinMatch, setPinMatch] = useState(true);
  const codeInputs = useRef([]);
  const navigate = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
      // const parametros = {
      //   url: "http://eaglehost.ipg/api",
      //   codtrabajador: 10302,
      //   pin: "0000"
      // }
      // await AsyncStorage.mergeItem('data', JSON.stringify(parametros))
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación Requeridos',
          'La aplicación requiere acceso a la ubicación para funcionar correctamente. Por favor, otorgue los permisos de ubicación.',
          [
            {
              text: 'Abrir Configuración',
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: 'Salir',
              onPress: () => Backr.exitApp(),
              style: 'cancel',
            },
          ],
          { cancelable: false },
          navigate.navigate('Permiso')
        );
      } else {
        comprobarDisponibilidadBiometrica();
      }
    };
    requestLocationPermission();
  }, []);

  const mostarPin = () => {
    setShowPin(!showPin);
  };

  const comprobarDisponibilidadBiometrica = async () => {
    const storedData = await AsyncStorage.getItem('data');
    if (storedData) {
      const available = await LocalAuthentication.hasHardwareAsync();
      if (available) {
        inicioBiometrico();
      }
    } else {
      navigate.navigate("Inicio")
    }
  };

  const inicioBiometrico = async () => {
    const result = await LocalAuthentication.authenticateAsync();
    if (result.success) {
      setHasCompletedAuthentication(true);
      await AsyncStorage.setItem('authenticationCompleted', 'true');
      cargarDatos();
    }
  };

  const cargarDatos = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');
      if (storedData) {
        setHasCompletedAuthentication(true);
        navigate.navigate('Fichaje')
      } else if (!storedData) {
        navigate.navigate('Permiso');
      }
    } catch (error) {
      console.error('Error al verificar los datos almacenados:', error);
    }
  };

  const cambiarCodigo = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newCodes = [...codes];
      newCodes[index] = text;
      setCodes(newCodes);
      if (text.length === 1 && index < codes.length - 1) {
        codeInputs.current[index + 1].focus();
      }
    }
  };

  const entrar = async () => {
    const storedData = await AsyncStorage.getItem('data');
    const data = (JSON.parse(storedData));
    console.log("Data pin: " + data.pin + data.codtrabajador)
    const fullCode = codes.join('');
    console.log("El pin que escribo: " + fullCode)
    if (parseInt(fullCode) === (parseInt(data.pin))) {
      navigate.navigate('Fichaje');
      setPinMatch(true);
    } else {
      setPinMatch(false);
      setCodes(['', '', '', '']);
      codeInputs.current[0].focus();
    }
  };

  const isButtonDisabled = codes.some(code => code.length !== 1);

  if (!hasCompletedAuthentication) {
    return (
      <View style={styles.container}>
        <View style={styles.codeContainer}>
          {codes.map((code, index) => (
            <TextInput
              key={index}
              ref={ref => (codeInputs.current[index] = ref)}
              style={styles.codeInput}
              value={code}
              onChangeText={text => cambiarCodigo(text, index)}
              maxLength={1}
              keyboardType="numeric"
              secureTextEntry={!showPin}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.eyeButton} onPress={mostarPin}>
          <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.disabledButton]}
          onPress={entrar}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        {!pinMatch && <Text style={styles.errorText}>Los PINs no coinciden. Intente nuevamente.</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 600,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
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
  text: {
    marginBottom: 35,
    fontSize: 30,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});