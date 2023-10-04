import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, Button, Input, theme } from 'galio-framework';

const Inicio = () => {
  const [trabajador, setTrabajador] = useState('');
  const [url, setUrl] = useState('');
  const navigate = useNavigation();

  useEffect(() => {
    const checkStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('data');
        if (storedData) {
          navigate.navigate('Autenticacion');
        }
      } catch (error) {
        console.error('Error al verificar los datos almacenados:', error);
      }
    };

    checkStoredData();
  }, []);

  const continuarClick = () => {
    navigate.navigate('Pin', { codtrabajador: trabajador, url: url });
  };

  const cambiarCodigo = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setTrabajador(numericText);
  };

  const cambiarURL = text => {
    setUrl(text);
  };

  const isButtonDisabled = trabajador.length < 1 || trabajador.length > 5 || !url;

  return (
    <Block flex center style={styles.container}>
      <Text h4 bold style={styles.title}>URL</Text>
      <Input
        placeholder="URL"
        value={url}
        onChangeText={cambiarURL}
        style={styles.input}
      />
      <Text h4 bold style={styles.title2}>Código de trabajador</Text>
      <Input
        placeholder="Código"
        value={trabajador}
        onChangeText={cambiarCodigo}
        keyboardType="numeric"
        maxLength={5}
        style={styles.input}
      />
      <Button
        color={theme.COLORS.INFO}
        style={[styles.button, isButtonDisabled && styles.disabledButton]}
        onPress={continuarClick}
        disabled={isButtonDisabled}
      >
        Continuar
      </Button>
    </Block>
  );
};

const styles = {
  container: {
    backgroundColor: theme.COLORS.ERROR,
    width: "100%"
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: "60%",
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    width: '80%',
    height: 50,
    fontSize: 18,
    borderColor: theme.COLORS.GREY,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: '50%',
    height: 50,
    borderRadius: 10,
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: theme.COLORS.GREY,
    color: theme.COLORS.BLACK
  }
};

export default Inicio;
