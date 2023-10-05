import { Block, Text, Button, theme } from "galio-framework";
import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import Ionicon from 'react-native-vector-icons/Ionicons'

const Principal = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigation();

  const opcionApi = () => {
    setSelectedOption(0);
    iniciar()
  }

  const opcionServer = () => {
    setSelectedOption(1);
    iniciar()
  }

  const iniciar = () => {
    if (selectedOption !== null) {
      console.log(selectedOption)
      navigate.navigate('Inicio', { selectedOption });
    }
  }

  useEffect(() => {
    const iniciar = () => {
      if (selectedOption !== null) {
        console.log(selectedOption)
        navigate.navigate('Inicio', { selectedOption });
      }
    }
    iniciar();
  }, [selectedOption]);

  return (
    <Block flex style={styles.block}>
      <Block style={styles.block}>
        <Text h3 bold>Escoge el lugar donde se dirigirán las peticiones</Text>
      </Block>
      <Button
        color={theme.COLORS.INFO}
        style={styles.button}
        onPress={opcionApi}
      >
        <Icon name="globe" size={20} color="white" style={styles.icon} /><Text size={20} bold color="white">API centralizado</Text>
      </Button>
      <Button
        color={theme.COLORS.INFO}
        style={styles.button}
        onPress={opcionServer}
      >
        <Ionicon name="server" size={20} color="white" style={styles.icon} /><Text size={20} bold color="white">Servidor personal</Text>
      </Button>
    </Block>
  )
}

export default Principal;

const styles = StyleSheet.create({
  block: {
    marginTop: 50,
    alignContent: "center",
    alignItems: "center",
    margin: 8
  },
  button: {
    flexDirection: "row",
    width: '80%',
    height: 60,
    borderRadius: 10,
    marginTop: 20,
  },
  icon: {
    marginRight: 15,
  },
})
