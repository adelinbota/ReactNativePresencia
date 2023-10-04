import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as Location from 'expo-location';
import publicIp from 'react-native-public-ip';

const FichajeGrupal = () => {
  const [data, setData] = useState(null);
  const [persGrupal, setPersGrupal] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bolsasInput, setBolsasInput] = useState({});
  const [ip, setIP] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigation();

  useEffect(() => {
    publicIp().then(ip => { setIP(ip) })

    const cargarDatos = async () => {
      try {
        const storedData = await AsyncStorage.getItem("data");
        const storedDataJSON = JSON.parse(storedData);
        setData(storedDataJSON);

        const grupal = await axios.get(
          `${storedDataJSON.url}/personal_dep?ficha_global=1&activo=1&sort[]=personal.nom&sort_ad[]=DESC`
        );
        setPersGrupal(grupal.data.rows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al verificar los datos almacenados:", error);
      }
    };

    cargarDatos();
  }, [navigate]);

  const obtenerCoordenadas = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      return location.coords;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  const marcarCheckbox = (item) => {
    const itemIndex = selectedItems.findIndex(
      (selectedItem) => selectedItem.codigo === item.cod
    );

    let updatedItems = [...selectedItems];
    if (itemIndex === -1) {
      updatedItems.push({
        codigo: item.cod,
        estado: item.estado_fichaje === "1" ? "0" : "1",
      });
    } else {
      updatedItems.splice(itemIndex, 1);
    }

    setSelectedItems(updatedItems);
  };

  const fichar = async () => {
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const coordinates = await obtenerCoordenadas();

    if (selectedItems.length === 0) {
      Alert.alert("Atención", "Tienes que seleccionar a alguien para poder fichar");
      return;
    }

    const bolsasIngresadas = {};
    persGrupal.forEach((item) => {
      const bolsaKey = `bolsa_${item.cod}`;
      const bolsaValue = bolsasInput[bolsaKey];
      if (bolsaValue !== undefined) {
        bolsasIngresadas[item.cod] = bolsaValue;
      }
    });

    const requests = selectedItems.map(async (item) => {
      const bolsasValue = bolsasIngresadas[item.codigo];
      const n_bolsas = bolsasValue !== undefined ? `bolsa_${bolsasValue}` : null;
      const aJSON = {
        cod: item.codigo,
        fecha: fechaFormateada,
        hora: fecha.toLocaleTimeString(),
        estado: item.estado,
        codcalendario: null,
        tipofic: 1,
        fec_computo: fechaFormateada,
        hor_computo: fecha.toLocaleTimeString(),
        cod_incidencia: null,
        latitud: coordinates.latitude,
        longitud: coordinates.longitude,
        ip: ip
      };
      if (n_bolsas !== null) {
        aJSON.n_bolsas = n_bolsas;
      }
      try {
        const response = await axios.post(data.url + '/presencia', aJSON);
        console.log(response.data)
      } catch (error) {
        console.error("Error al enviar la solicitud:", error);
      }
    });

    await Promise.all(requests);

    navigate.navigate("Fichaje");
  };

  const atras = () => {
    navigate.navigate("Fichaje");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Fichaje Grupal</Text>
        </View>
        <View style={styles.modalBody}>
          <View style={styles.tableHeaderGrupal}>
            <Text style={styles.tableHeaderTextGrupal}>Nombre</Text>
            <Text style={styles.tableHeaderTextGrupal}>Bolsas</Text>
            <Text style={styles.tableHeaderTextGrupal}>Departamento</Text>
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="always"
          >
            {isLoading ? (
              <View style={styles.container}>
                <ActivityIndicator />
              </View>
            ) : (
              persGrupal.map((item) => (
                <View style={styles.tableRowGrupal} key={item.cod}>
                  <BouncyCheckbox
                    size={20}
                    style={styles.bouncy}
                    fillColor="blue"
                    unfillColor="#FFFFFF"
                    isChecked={selectedItems.some(
                      (selectedItem) => selectedItem.codigo === item.cod
                    )}
                    innerIconStyle={{ borderWidth: 1 }}
                    onPress={() => marcarCheckbox(item)}
                  />
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          item.estado_fichaje === "1" ? "green" : "red",
                      },
                    ]}
                  />
                  <Text style={styles.tableCellGrupal1}>{item.nom}</Text>
                  <TextInput
                    style={styles.inputGrupal}
                    maxLength={6}
                    keyboardType="numeric"
                    editable={
                      selectedItems.some(
                        (selectedItem) => selectedItem.codigo === item.cod
                      ) && item.estado_fichaje === "1"
                    }
                    onChangeText={(text) => {
                      const bolsaKey = `bolsa_${item.cod}`;
                      setBolsasInput({ ...bolsasInput, [bolsaKey]: text });
                    }}
                  />
                  <Text style={styles.tableCellGrupal2}>
                    {item.departamento}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.modalFooter2}>
            <TouchableOpacity
              style={[styles.button, styles.buttonFooterFichar]}
              onPress={fichar}
            >
              <Text style={styles.buttonText}>Fichar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButtonFooter]}
              onPress={atras}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
  },
  modalTitle: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    paddingBottom: 20,
  },
  inputGrupal: {
    width: "20%",
    borderColor: "gray",
    borderWidth: 1,
    marginLeft: "1%",
    marginRight: "4%",
    textAlign: "right",
    justifyContent: "center"
  },
  modalFooter2: {
    flexDirection: "row",
    paddingBottom: 60,
    paddingTop: 20,
    justifyContent: "center",
  },
  closeButtonFooter: {
    backgroundColor: "gray",
    textAlign: "center",
    marginLeft: 30,
  },
  buttonFooterFichar: {
    backgroundColor: "blue",
    textAlign: "center",
  },
  tableRowGrupal: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    height: 50,
  },
  tableCellGrupal2: {
    width: "25%",
    textAlign: "center",
    fontSize: 10,
    textAlignVertical: "center",
  },
  tableCellGrupal1: {
    width: "30%",
    textAlign: "center",
    fontSize: 10,
    textAlignVertical: "center",
  },
  tableHeaderGrupal: {
    marginTop: 20,
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#000",
    justifyContent: "flex-end",
    paddingVertical: 10,
  },
  tableHeaderTextGrupal: {
    fontWeight: "bold",
    padding: 3,
    marginLeft: 22,
  },
  bouncy: {
    paddingLeft: 15,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    marginTop: "3.3%",
  },
});

export default FichajeGrupal;