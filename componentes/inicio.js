import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, Button, Input, theme } from 'galio-framework';

const Inicio = () => {
  const route = useRoute();
  const [trabajador, setTrabajador] = useState('');
  const [url, setUrl] = useState('');
  const [cliente, setCliente] = useState('');
  const [usuario, setUsuario] = useState('');
  const [pass, setPass] = useState('')
  const navigate = useNavigation();
  const selectedOption = route.params.selectedOption

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
    console.log(selectedOption)
  }, []);

  const continuarClick = () => {
    if (selectedOption === 1) {
      if (trabajador.length === 5 && url) {
        navigate.navigate('Pin', { codtrabajador: trabajador, url: url, opcion: selectedOption });
      } else {
        Alert.alert("Error", "Los datos no son correctos");
      }
    } else {
      if (cliente && usuario && pass && trabajador) {
        navigate.navigate('Pin', { codtrabajador: trabajador, codcliente: cliente, pass: pass, usuario: usuario, opcion: selectedOption });
      } else {
        Alert.alert("Error", "Los datos no son correctos");
      }
    }
  };

  const cambiarCodigo = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setTrabajador(numericText);
  };

  const cambiarURL = text => {
    setUrl(text);
  };

  const cambiarCliente = text => {
    setCliente(text);
  };

  const cambiarUsuario = text => {
    setUsuario(text);
  };

  const cambiarPassword = text => {
    setPass(text);
  };

  const isButtonDisabled = selectedOption === 1
    ? trabajador.length !== 5 || !url
    : cliente.length < 1 || !usuario || !pass || !trabajador;

  return (
    <Block flex center style={styles.container}>
      {selectedOption === 1 ?
        <>
          <Text h4 bold style={styles.title}>URL</Text>
          <Input
            placeholder="URL"
            value={url}
            onChangeText={cambiarURL}
            style={styles.input}
          />
        </>
        :
        <>
          <Text h4 bold style={styles.title}>Código de cliente</Text>
          <Input
            placeholder="Código"
            type='numeric'
            value={cliente}
            maxLength={7}
            onChangeText={cambiarCliente}
            style={styles.input}
          />
          <Text h4 bold style={styles.title2}>Usuario</Text>
          <Input
            placeholder="Usuario"
            maxLength={20}
            value={usuario}
            onChangeText={cambiarUsuario}
            style={styles.input}
          />
          <Text h4 bold style={styles.title2}>Contraseña</Text>
          <Input
            password={true}
            placeholder="Contraseña"
            value={pass}
            maxLength={25}
            onChangeText={cambiarPassword}
            style={styles.input}
          />
        </>
      }
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
    marginTop: "40%",
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
