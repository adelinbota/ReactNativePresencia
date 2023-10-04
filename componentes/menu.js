import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Inicio from './inicio';
import Pin from "./pin";
import Fichaje from "./fichaje";
import Autenticacion from "./autenticacion";
import ConfirmacionPin from "./confirmacionpin";
import Permiso from "./permiso";
import FichajeGrupal from "./fichaje_grupal";

const Stack = createStackNavigator();

export default function Menu() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Autenticacion'>
        <Stack.Screen name="Inicio" component={Inicio} options={{ title: 'Inicio', headerShown: false }} />
        <Stack.Screen name="Pin" component={Pin} options={{ title: 'Pin', headerShown: false }} />
        <Stack.Screen name="Fichaje" component={Fichaje} options={{ title: 'Fichaje', headerShown: false }} />
        <Stack.Screen name="FichajeGrupal" component={FichajeGrupal} options={{ title: 'FichajeGrupal', headerShown: false }} />
        <Stack.Screen name="Autenticacion" component={Autenticacion} options={{ title: 'Autenticacion', headerShown: false }} />
        <Stack.Screen name="ConfirmacionPin" component={ConfirmacionPin} options={{ title: 'ConfirmacionPin', headerShown: false }} />
        <Stack.Screen name="Permiso" component={Permiso} options={{ title: 'Permiso', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}