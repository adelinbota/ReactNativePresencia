import React, { useEffect } from 'react';
import { Alert, Linking, TouchableOpacity, Text, StyleSheet, BackHandler, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

export default function Permiso() {
  const navigate = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
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
              onPress: () => BackHandler.exitApp(),
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        navigate.navigate('Inicio');
      }
    };

    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    requestLocationPermission();

    return () => {
      backHandler.remove();
    };
  }, [navigate]);

  const obtenerPermisos = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Linking.openSettings();
    } else {
      navigate.navigate('Inicio');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permiso de Ubicación</Text>
      <Text style={styles.description}>
        Para utilizar esta aplicación, necesitamos acceso a su ubicación.
      </Text>
      <TouchableOpacity style={styles.button} onPress={obtenerPermisos}>
        <Text style={styles.buttonText}>Otorgar Permisos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});