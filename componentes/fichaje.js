import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  ToastAndroid,
  Modal,
  FlatList,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Block, Button, Text, theme } from 'galio-framework';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import publicIp from 'react-native-public-ip';
import Icon from 'react-native-vector-icons/FontAwesome'
import Setting from 'react-native-vector-icons/Ionicons'
import MapView, { Marker } from 'react-native-maps';
const { width } = Dimensions.get('screen');

const Fichaje = () => {
  const [entryTime, setEntryTime] = useState(null);
  const [exitTime, setExitTime] = useState(null);
  const [hourTime, setHourTime] = useState(null);
  const [minuteTime, setMinuteTime] = useState(null);
  const [secondTime, setSecondTime] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState((currentDate.getMonth() + 1).toString());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear().toString());
  const [inputMonthError, setInputMonthError] = useState(false);
  const [ip, setIP] = useState(null);
  const [data, setData] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [presencia, setPresencia] = useState([]);
  const [estado, setEstado] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [modalIncidencias, setModalIncidencias] = useState(false);
  const [modalConsulta, setModalConsulta] = useState(false);
  const [modalConsulta2, setModalConsulta2] = useState(false);
  const [modalMapa, setModalMapa] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [URL, setURL] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pin, setPin] = useState("")

  const navigate = useNavigation();

  const cargarDatos = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');
      const storedDataJSON = JSON.parse(storedData);
      setData(storedDataJSON);
      setURL(storedDataJSON.url || "");
      setCodigo(storedDataJSON.codtrabajador || "");
      setPin(storedDataJSON.pin || "");

      const empresa = await axios.get(storedDataJSON.url + "/parametros");
      setEmpresa(empresa.data.nom);

      const personal = await axios.get(storedDataJSON.url + "/personal?max=100&offset=0&cod=" + storedDataJSON.codtrabajador)
      setPersonal(personal.data.personal);

      const estado_personal = await axios.get(storedDataJSON.url + "/estado_personal?cod_personal=" + storedDataJSON.codtrabajador)
      setEstado(estado_personal.data);
    } catch (error) {
      <ActivityIndicator />
      setModalConfig(true);
      Alert.alert('Error', 'No se encuentra la URL')
    }
  };

  useEffect(() => {
    publicIp().then(ip => { setIP(ip) })

    cargarDatos();

    let backPressCount = 0;
    const backAction = () => {
      if (backPressCount < 1) {
        backPressCount++;
        ToastAndroid.show('Presiona nuevamente para salir de la aplicación', ToastAndroid.SHORT);
        setTimeout(() => {
          backPressCount = 0;
        }, 2000);
      } else {
        BackHandler.exitApp();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandler.remove();
    };
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

  const entradaClick = async () => {
    const currentTimeEntry = new Date();
    const coordinates = await obtenerCoordenadas();
    console.log(currentTimeEntry.toLocaleTimeString())
    setEntryTime(currentTimeEntry);
    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaFormateada = currentTimeEntry.toLocaleDateString(undefined, opcionesFecha);
    const aJSON = {
      cod: data.codtrabajador,
      fecha: fechaFormateada,
      hora: currentTimeEntry.toLocaleTimeString(),
      estado: 1,
      tipofic: 1,
      fec_computo: fechaFormateada,
      hor_computo: currentTimeEntry.toLocaleTimeString(),
      ip: ip,
      codcalendario: estado[0].codcalendario,
      latitud: coordinates.latitude,
      longitud: coordinates.longitude
    }
    try {
      cargarDatos()
      const response = await axios.post(data.url + '/presencia', aJSON);
      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  };

  function formatearHora(number) {
    return number.toString().padStart(2, '0');
  }

  const salidaClick = async () => {
    const currentTimeExit = new Date();
    const entryTimeParts = estado[0].hora.split(":");
    const entryTime = new Date();
    entryTime.setHours(entryTimeParts[0], entryTimeParts[1], entryTimeParts[2]);
    const timeDifferenceMilliseconds = currentTimeExit - entryTime;

    const hours = Math.floor(timeDifferenceMilliseconds / 3600000);
    const minutes = Math.floor((timeDifferenceMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((timeDifferenceMilliseconds % 60000) / 1000);

    const formattedHours = formatearHora(hours);
    const formattedMinutes = formatearHora(minutes);
    const formattedSeconds = formatearHora(seconds);

    setExitTime(currentTimeExit.toLocaleTimeString());
    setHourTime(formattedHours);
    setMinuteTime(formattedMinutes);
    setSecondTime(formattedSeconds);

    try {
      const variables_version = await axios.get(data.url + "/variables_version?max=100&offset=0&api_account=99990");

      const response = await axios.get(data.url + "/ficha_tiposinciden?max=100&offset=0&api_account=99990&dispo=1");
      setIncidencias(response.data);

      if (variables_version.data.preincd) {
        toggleModalIncidencias()
      }

    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const consultarPresencia = async () => {
    if (!inputMonthError) {
      console.log(currentMonth)
      const presencia = await axios.get(data.url + "/presencia?max=100&offset=0&month=" + currentMonth + "&year=" + currentYear + "&cod_personal=" + data.codtrabajador + "&sort[]=fecha&sort_ad[]=DESC&sort[]=hora&sort_ad[]=DESC&sort[]=sr_recno&sort_ad[]=DESC")
      setPresencia(presencia.data.rows);
      if (presencia.data.rows.length > 0) {
        setModalConsulta(false);
        setModalConsulta2(true);
      } else {
        Alert.alert("Error", "No hay datos del mes introducido")
      }
    } else {
      Alert.alert("Error", "El mes ingresado no es válido.");
    }
  }

  const minMonth = 1;
  const maxMonth = 12;

  const validarMes = (text) => {
    const month = parseInt(text);
    const esMesValido = !isNaN(month) && month >= minMonth && month <= maxMonth;
    setInputMonthError(!esMesValido);
    setCurrentMonth(text);
  };

  const editarConfig = async () => {
    if (!URL || !codigo || !pin) {
      Alert.alert("Error", "No puedes guardar datos vacíos")
    } else {
      const datos = {
        url: URL,
        codtrabajador: codigo,
        pin: pin
      }

      await AsyncStorage.mergeItem('data', JSON.stringify(datos))
      const storedData = await AsyncStorage.getItem('data');
      setData(JSON.parse(storedData));
      console.log(storedData);
      setModalConfig(false)
    }
  }

  const toggleModalIncidencias = () => {
    setModalIncidencias(true);
  }

  const toggleModalConsulta = () => {
    setModalConsulta(true);
  }

  const toggleFichajeGrupal = () => {
    navigate.navigate('FichajeGrupal')
  }

  const salida = (codigo) => async () => {
    const coordinates = await obtenerCoordenadas();
    const fecha = new Date()
    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaFormateada = fecha.toLocaleDateString(undefined, opcionesFecha);
    const aJSON = {
      cod: data.codtrabajador,
      fecha: fechaFormateada,
      hora: fecha.toLocaleTimeString(),
      estado: 0,
      tipofic: 1,
      fec_computo: fechaFormateada,
      hor_computo: fecha.toLocaleTimeString(),
      codincidencia: codigo,
      ip: ip,
      codcalendario: estado[0].codcalendario,
      latitud: coordinates.latitude,
      longitud: coordinates.longitude
    }
    try {
      cargarDatos()
      const response = await axios.post(data.url + '/presencia', aJSON)
      console.log("Respuesta del servidor: " + response.data)
    } catch (error) {
      console.log("Error: " + error)
    }
    setModalIncidencias(false);
  }

  const toggleModalMapa = (longitud, latitud) => {
    if (longitud && latitud) {
      setModalMapa(true)
      setLongitud(longitud)
      setLatitud(latitud)
    } else {
      Alert.alert("Error", "No hay coordenadas")
    }
  }

  const toggleModalConfig = () => {
    setModalConfig(true)
  }

  return (
    <Block style={styles.container}>
      <TouchableOpacity
        style={styles.settings}
        onPress={toggleModalConfig}
      >
        <Setting name="settings" size={25} />
      </TouchableOpacity>
      <Text style={styles.title}>{empresa}</Text>
      {personal.map((item, index) => (
        <Block card style={[styles.card, styles.shadow]} key={index}>
          {item.foto ? (
            // <Image source={{ uri: "data:image/jpeg;base64," + item.foto }} style={styles.foto} />
            <Image source={require("../assets/adri.png")} style={styles.foto} />
          ) : (
            console.log("No se encontró una foto para", item.nom)
          )}
          <Text bold style={styles.titleCard}>{item.nom}</Text>
        </Block>
      ))}

      {estado.map((item, index) => {
        const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        const fechaActual = new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const isPresent = item.estado === "1";
        const isExitButton = isPresent;
        const buttonText = isPresent ? "Salida" : "Entrada";
        const buttonColor = isPresent ? "red" : "green";
        return (
          <Block style={styles.content} key={index}>
            <Block card style={[styles.card2, styles.shadow2]}>
              <Text key={index} style={styles.textContent}>
                <Text bold>Fecha:</Text> {fechaActual}{'\n'}
                <Text bold>Último fichaje:</Text> {fechaFormateada} {item.hora}{'\n'}
                <Text bold>Estado:</Text> {item.estado === "1" ? "PRESENTE" : "AUSENTE"}
              </Text>
            </Block>
            <Button onPress={isExitButton ? salidaClick : entradaClick} style={[styles.buttonSalida, { backgroundColor: buttonColor, height: 60 }]}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Button>
            {personal.map((item, index) => (
              <Block key={index}>
                {item.ficha_consulta === "1" ? (
                  <Button
                    style={[styles.buttonIncidencia, { backgroundColor: 'blue', marginTop: -5 }]}
                    onPress={toggleModalConsulta}
                  >
                    <Text style={styles.buttonText}>Consultar</Text>
                  </Button>
                ) : (
                  console.log("No hay botón Consultar")
                )}
                {item.ficha_dep === "1" ? (
                  <Button
                    style={[styles.buttonIncidencia, { backgroundColor: 'orange', marginTop: -5 }]}
                    onPress={toggleFichajeGrupal}
                  >
                    <Text style={styles.buttonText}>Fichaje Grupal</Text>
                  </Button>
                ) : (
                  console.log("No hay botón Grupal")
                )}
              </Block>
            ))}
          </Block>
        );
      })}


      {/* Modal Incidencias */}
      <Modal visible={modalIncidencias} animationType="slide">
        <Block style={styles.modalContent}>
          {exitTime && (
            <Block card style={styles.card3}>
              <Text color="white" bold size={40}>
                {hourTime}:{minuteTime}:{secondTime}
              </Text>
            </Block>
          )}
          <Block>
            {/* <Text bold size={26} style={styles.titleIncidencias}>Opciones:</Text> */}
            <Button shadowless color="info" style={[styles.buttonIncidenciaSalir, styles.shadow]} onPress={salida(null)}><Text color="white" bold size={20}>SALIR</Text></Button>
            {incidencias && incidencias.rows && incidencias.rows.map((item, index) => (
              <Button shadowless color="warning" style={[styles.buttonIncidencia, styles.shadow]} key={index} onPress={salida(item.cod)}><Text color="white" bold>{item.txtcor}</Text></Button>
            ))}
          </Block>
          <Button
            style={[styles.buttonIncidencia, styles.closeButtonFooterIncidencia]}
            onPress={() => setModalIncidencias(false)}
          >
            CERRAR
          </Button>
        </Block>
      </Modal>
      {/* Modal Fecha Consulta */}
      <Modal visible={modalConsulta} animationType="slide">
        <Block style={styles.modalContent}>
          <Block style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Consultar presencia</Text>
          </Block>
          <Block style={styles.modalBody}>
            <Text>Mes:</Text>
            <TextInput
              style={[
                styles.input,
                inputMonthError && styles.invalidInput,
              ]}
              keyboardType="numeric"
              placeholder="Mes"
              maxLength={2}
              value={currentMonth}
              onChangeText={validarMes}
            />
            <Text>Año:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Año"
              maxLength={4}
              value={currentYear}
              onChangeText={(text) => setCurrentYear(text)}
            />
          </Block>
          <Block style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.button, styles.consultButton]}
              onPress={consultarPresencia}
            >
              <Text style={styles.buttonText}>Consultar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButtonFooter]}
              onPress={() => setModalConsulta(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </Block>
        </Block>
      </Modal>
      {/* Modal Consultar Fichajes */}
      <Modal visible={modalConsulta2} animationType="slide">
        <Block style={styles.modalContent}>
          <Block style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Fichajes</Text>
          </Block>
          <Block style={styles.modalBody}>
            <Block style={styles.tableHeader}>
              <Text></Text>
              <Text style={styles.tableHeaderText}>Fecha</Text>
              <Text style={styles.tableHeaderText}>Hora</Text>
              <Text style={styles.tableHeaderText}>E/S</Text>
            </Block>
            <FlatList
              data={presencia}
              keyExtractor={(item) => item.sr_recno.toString()}
              renderItem={({ item }) => {
                const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                return (
                  <Block style={styles.tableRow}>
                    <Text style={item.estado === "1" ? [styles.celdaPequena, styles.arrowRightStyle] : [styles.celdaPequena, styles.arrowLeftStyle]}>
                      {item.estado === "1" ? '\u2192' : '\u2190'}
                    </Text>
                    <Text style={styles.tableCell}>{fechaFormateada}</Text>
                    <Text style={styles.tableCell}>{item.hora}</Text>
                    <TouchableOpacity style={styles.celdaPequena2} onPress={() => toggleModalMapa(parseFloat(item.longitud), parseFloat(item.latitud))}>
                      <Icon name="map-marker" size={25} />
                    </TouchableOpacity>
                    <Text style={styles.tableCell}>{item.estado === "1" ? "ENTRADA" : "SALIDA"}</Text>
                  </Block>
                )
              }}
            />
            <Block style={styles.modalFooter2}>
              <TouchableOpacity
                style={[styles.button, styles.closeButtonFooter]}
                onPress={() => setModalConsulta2(false)}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
      </Modal>
      {/* Modal Mapa Ubicación */}
      <Modal visible={modalMapa} animationType="slide">
        <Block style={styles.modalContent}>
          <MapView
            style={styles.map}
            initialRegion={{
              longitude: longitud,
              latitude: latitud,
              latitudeDelta: 0.00268,
              longitudeDelta: 0.00273
            }}
          >
            <Marker coordinate={{ latitude: latitud, longitude: longitud }} title="Yo" description="Mi ubicación" />
          </MapView>
          <Block style={styles.modalFooterMapa}>
            <TouchableOpacity
              style={[styles.button, styles.closeButtonFooter]}
              onPress={() => setModalMapa(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </Block>
        </Block>
      </Modal>
      {/* Modal Configuración Datos */}
      <Modal visible={modalConfig} animationType="slide">
        {data ?
          <Block style={styles.modalContent}>
            <Text>URL:</Text>
            <TextInput
              style={styles.input}
              placeholder="URL"
              value={URL}
              onChangeText={(text) => setURL(text)}
            />
            <Text>Trabajador:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Código"
              maxLength={5}
              value={codigo}
              onChangeText={(text) => setCodigo(text)}
            />
            <Text>Pin:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Pin"
              maxLength={4}
              value={pin}
              onChangeText={(text) => setPin(text)}
            />
            <Block style={styles.modalFooterMapa}>
              <TouchableOpacity
                style={[styles.button, styles.consultButton]}
                onPress={editarConfig}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.closeButtonFooter]}
                onPress={() => setModalConfig(false)}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </Block>
          </Block>
          : <ActivityIndicator />}
      </Modal>
    </Block>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
  },
  titleIncidencias: {
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
  },
  titleCard: {
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
  },
  textContent: {
    fontSize: 17,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    margin: 10,
  },
  buttonIncidencia: {
    marginBottom: theme.SIZES.BASE,
    width: width - (theme.SIZES.BASE * 2),
    borderRadius: 17,
  },
  buttonIncidenciaSalir: {
    marginBottom: theme.SIZES.BASE,
    width: width - (theme.SIZES.BASE * 2),
    height: 70,
    borderRadius: 17,
  },
  buttonSalida: {
    marginBottom: theme.SIZES.BASE,
    width: width - (theme.SIZES.BASE * 2),
    borderRadius: 17
  },
  shadow: {
    shadowColor: 'white',
    borderColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
    paddingTop: 80
  },
  modalTitle: {
    margin: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
    color: "red",
  },
  modalBody: {
    paddingBottom: 20,
    alignItems: "center"
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalFooter2: {
    flexDirection: "row",
    paddingBottom: 50,
    paddingTop: 35,
    justifyContent: "center"
  },
  modalFooterMapa: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 50
  },
  consultButton: {
    backgroundColor: "blue",
  },
  closeButtonFooter: {
    backgroundColor: "gray",
  },
  closeButtonFooterIncidencia: {
    backgroundColor: "gray",
    marginTop: 50
  },
  invalidInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
  },
  tableCell: {
    margin: 20,
    textAlign: "center",
  },
  tableHeader: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 2,
    borderColor: "#000",
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontWeight: "bold",
    paddingRight: 28
  },
  arrowRightStyle: {
    color: 'green',
    fontSize: 25
  },
  arrowLeftStyle: {
    color: 'red',
    fontSize: 25,
  },
  celdaPequena: {
    marginLeft: 5,
    paddingTop: 8
  },
  celdaPequena2: {
    paddingTop: 15
  },
  foto: {
    width: 160,
    height: 160,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  map: {
    height: '100%',
    width: '100%'
  },
  settings: {
    position: "relative",
    marginBottom: 4
  },
  card: {
    paddingTop: 30,
    paddingBottom: -10,
    marginBottom: 30,
    width: "70%",
    alignItems: "center"
  },
  card2: {
    padding: 10,
    paddingBottom: -10,
    alignItems: "center",
    marginBottom: 10
  },
  shadow2: {
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 0.4,
    shadowOpacity: 0,
    elevation: 0.1
  },
  card3: {
    padding: 7,
    width: "70%",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#4ea93b",
    marginBottom: 30,
    borderColor: "white"
  },
});

export default Fichaje;