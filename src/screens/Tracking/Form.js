import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Text, Card, Divider, Switch, Button, Input, Icon, Tab, TabView } from 'react-native-elements';
import TrackingService from '../../services/TrackingService';
import TrackingModel from '../../models/Tracking';
import AppCircleButton from '../../components/AppCircleButton';
import { Styles, Colors } from '../../components/Styles';
import { Formik } from "formik";
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import APIService from '../../services/APIService';
import { useAuth } from '../../services/AuthService';
import FormInput from '../../components/FormInput';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Svg, { Path, SvgXml } from "react-native-svg";

const TrackingForm = ({ route, navigation }) => {

  const TRACKING = 'tracking';
  const PAUSED = 'paused';
  const FINISHED = 'finished';
  
  const { model, modelKeys, save } = TrackingModel();
  const { getStoragedBeaches } = APIService();
  const { user } = useAuth();

  const [entity, setEntity] = useState((route.params && route.params.data ? route.params.data : model));  
  const [beaches, setBeaches] = useState([]);
  const [index, setIndex] = useState(0);
  const [beachId, setBeachId] = useState(entity.beachId);  
  const [status, setStatus] = useState(entity.status);  
  const [initialCoordinate, setInitialCoordinate] = useState(null);
  const [finalCoordinate, setFinalCoordinate] = useState(null);

  const {
    permission,
    coordinates,
    location,
    startTracking,
    stopTracking,
    getTrackingData
  } = TrackingService(entity);

  let unsubscribeBackListener = null;

  const validationSchema = Yup.object().shape({
    finished: Yup.bool(),
    notFinishedJustification: Yup.string().when(FINISHED, {
      is: false,
      then: (schema) => schema.required('Preenchimento obrigatório')
    }),
    observation: Yup.string()
  });


  useEffect(() => {

    if (!initialCoordinate && entity.initialCoordinate)
      setInitialCoordinate({latitude:entity.initialCoordinate.latitude, longitude:entity.initialCoordinate.longitude});

    if (!finalCoordinate && entity.finalCoordinate)
      setFinalCoordinate({latitude:entity.finalCoordinate.latitude, longitude:entity.finalCoordinate.longitude});
    else if ( !finalCoordinate && status !== TRACKING && entity.tracking.length > 0)
      setFinalCoordinate({latitude:entity.tracking[entity.tracking.length - 1].latitude, 
        longitude:entity.tracking[entity.tracking.length - 1].longitude})
    
    


    if (beaches.length == 0)
      getBeaches();

    unsubscribeBackListener = navigation.addListener('beforeRemove', handleBackButton);

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBackPress
    );

    return () => {
      unsubscribeBackListener && unsubscribeBackListener();
      backHandler.remove();
    };

  }, [navigation, status]);


  useEffect(() => {
    if (!initialCoordinate && location)
      setInitialCoordinate({latitude:location.latitude, longitude:location.longitude});

  }, [location]);

  const getBeaches = async () => {
    let list = await getStoragedBeaches();
    setBeaches(list);
  }

  function handleHardwareBackPress(e) {
    navigation.goBack();
    return true;
  }

  const handleBackButton = async (e) => {

    if (status !== TRACKING && status !== PAUSED) {
      return;
    }
    
    e.preventDefault();
    await stopTracking();
    setStatus(PAUSED);

    Alert.alert(
      'Alerta!',
      `O monitoramento encontra-se em andamento!\n\nDeseja salvar o trajeto executado?`,
      [
        {
          text: "Não",
          style: "cancel",
          onPress: () => navigation.dispatch(e.data.action)
        },
        {
          text: "Sim",
          onPress: async () => {
            let res = await saveData(PAUSED);

            if (res) {
              navigation.dispatch(e.data.action)
            }
          }
        }
      ],
      { cancelable: true }
    )

  }

  const saveData = async (status, formValues = null) => {

    let trackingData = getTrackingData();
    let tracking = trackingData.tracking;
    let trackingInfo = trackingData.trackingInfo;

    let data = { ...entity };
    data.formErrors = null;

    tracking.forEach(element => {
      data.tracking.push(element);
    });

    trackingInfo.forEach(element => {
      data.trackingInfo.push(element);
    });

    if (formValues) {
      for (let k in formValues) {
        data[k] = formValues[k];
      }
    }

    if (data.responsibleId === null)
      data.responsibleId = user.id;

    if (data.finished === false && !data.notFinishedJustification)
      data.formErrors = { ...{ 'notFinishedJustification': 'Preenchimento obrigatório' } };

    if (status)
      data.status = status;

    data.beachId = beachId;
    data.beach = beaches.find(item => item.id === beachId);

    let res = await save(data);
    let title = 'Sucesso';
    let message = data.id ? 'Monitoramento atualizado com sucesso!' : 'Monitoramento criado com sucesso!';

    if (res) {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Ok'
          },
        ],
        { cancelable: false }
      );

      return true;
    }

    return false;

  }

  const showBeachAlert = () => {
    Alert.alert(
      'Aviso',
      'Selecione uma praia para iniciar o monitoramento!',
      [
        {
          text: 'Ok',
        },
      ],
      { cancelable: false }
    );
  }

  const handlePlayButton = () => {

    if (status === TRACKING) {
      stopTracking();
      setStatus(PAUSED);
      
      if (!finalCoordinate && location)
        setFinalCoordinate({latitude:location.latitude, longitude:location.longitude});
    } else if (beachId === null) {
      showBeachAlert();
    } else {
      setFinalCoordinate(null);
      startTracking();
      setStatus(TRACKING);      
    }

  }

  const handleStopButton = () => {
    if (!finalCoordinate && location)
      setFinalCoordinate({latitude:location.latitude, longitude:location.longitude});

    stopTracking();
    saveData(FINISHED);
    setStatus(FINISHED);
  }

  return (

    <>
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: 'white',
          height: 3,
        }}
        variant="primary"
      >
        <Tab.Item
          title="Mapa"
          titleStyle={{ fontSize: 12 }}
          icon={{ name: 'map', type: 'ionicon', color: 'white' }}
        />
        <Tab.Item
          title="Formulário"
          titleStyle={{ fontSize: 12 }}
          icon={{ name: 'document-text', type: 'ionicon', color: 'white' }}
        />
      </Tab>

      <TabView value={index} animationType="spring">
        <TabView.Item style={{ width: '100%' }}>

          <View style={{ flex: 1, flexDirection: "column" }}>

            <View>

              {!beachId ? null :
                <Text style={{
                  color: '#7384B4',
                  fontSize: 16,
                  fontFamily: 'UbuntuLight',
                  marginHorizontal: 10,
                  paddingLeft: 5,
                  marginTop: 10,
                }} >Praia</Text>
              }

              <View style={{
                borderBottomWidth: 1, borderColor: 'rgba(110, 120, 170, 1)',
                height: 45,
                marginHorizontal: 10,
              }}>

                <Picker selectedValue={beachId}
                  onValueChange={(itemValue, itemIndex) =>
                    setBeachId(itemValue)
                  }
                >
                  {beachId ? null : <Picker.Item label={'Selecione uma praia'} value={0} style={{ color: '#7384B4', fontSize: 18 }} />}
                  {
                    beaches.map((item, i) => <Picker.Item key={i} label={item.name} value={item.id} />)
                  }
                </Picker>
              </View>

            </View>


            <View style={styles.container}>

              <MapView
                style={styles.map}
                showUserLocation
                followUserLocation
                loadingEnabled
                initialRegion={{
                  latitude: 0,
                  longitude: 0,
                  latitudeDelta: 150.0922,
                  longitudeDelta: 150.0421,
                }}

                region={(location ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0002,
                  longitudeDelta: 0.0001,
                } : undefined)

                }
              >

                {
                  location &&
                    status === TRACKING ?
                    <Marker.Animated
                      flat
                      anchor={{ x: 0.5, y: 0.5 }}
                      ref={marker => {
                        if (this) this.marker = marker;
                      }}
                      coordinate={{ latitude: location.latitude, longitude: location.longitude }} >
                      <View
                        style={{
                          transform: [{ rotate: `${location.heading}deg` }],
                          width: 36,
                          height: 36,

                        }}
                      >
                        <Svg fill={"#05445E"} width={35} height={35} viewBox="0 0 64 64">
                          <Path stroke="#05445E" d="M13,52l18-9V38h2v5l18,9L32,14ZM32.71,36.71A1.01394,1.01394,0,1,1,33,36,1.05421,1.05421,0,0,1,32.71,36.71ZM33,33a.9994.9994,0,0,1-.08008.37988,1.03418,1.03418,0,0,1-.21.33008A1,1,0,0,1,31,33a1.02955,1.02955,0,0,1,.29-.71,1.04667,1.04667,0,0,1,1.41992,0A1.03391,1.03391,0,0,1,33,33Z" />
                        </Svg>
                      </View>

                    </Marker.Animated>

                    : null
                }


                {coordinates.length > 0 &&
                  <Polyline
                    coordinates={coordinates}
                    strokeWidth={3}
                    strokeColor={"#2992C4"}
                  />
                }

                {
                  initialCoordinate &&
                  <Marker
                    coordinate={
                      {
                        latitude: initialCoordinate.latitude,
                        longitude: initialCoordinate.longitude
                      }
                    }
                    pinColor="green" />
                }

                {
                  finalCoordinate &&
                  <Marker
                    coordinate={
                      {
                        latitude: finalCoordinate.latitude,
                        longitude: finalCoordinate.longitude
                      }
                    } />
                }

              </MapView>
            </View>


            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 1
            }}>
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <SvgXml width="22" height="22" xml={`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="#ffffff"><path d="M16 32c8.822 0 16-7.178 16-16S24.822 0 16 0 0 7.178 0 16s7.178 16 16 16zm0-31c8.271 0 15 6.729 15 15s-6.729 15-15 15S1 24.271 1 16 7.729 1 16 1z"/><path d="M20.061 21.768a.498.498 0 0 0 .708 0 .5.5 0 0 0 0-.707L16 16.293V9.319a.5.5 0 0 0-1 0V16.5c0 .133.053.26.146.354l4.915 4.914z"/><circle cx="4" cy="16" r="1"/><circle cx="28" cy="16" r="1"/><circle cx="16" cy="4" r="1"/><circle cx="16" cy="28" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="24" cy="24" r="1"/><circle cx="25" cy="8" r="1"/><circle cx="8" cy="24" r="1"/></g></svg>`} />
                  <Text style={styles.infoText}>{`${location ? location.time : '00:00:00'}`}</Text>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <SvgXml width="24" height="24" xml={`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" x="0" y="0" version="1.1" viewBox="0 0 52 52" xml:space="preserve"><path fill="#ffffff" d="M42.263 46.631a1 1 0 0 1-.707-1.707A21.855 21.855 0 0 0 48 29.368c0-5.876-2.289-11.4-6.444-15.556S31.876 7.368 26 7.368s-11.401 2.289-15.557 6.444S4 23.492 4 29.368a21.856 21.856 0 0 0 6.443 15.556 1 1 0 1 1-1.414 1.414A23.84 23.84 0 0 1 2 29.368a23.84 23.84 0 0 1 7.03-16.97c4.533-4.533 10.56-7.03 16.97-7.03s12.438 2.497 16.971 7.03A23.84 23.84 0 0 1 50 29.368c0 6.41-2.497 12.438-7.03 16.97a.997.997 0 0 1-.707.293z"/><path fill="#ffffff" d="M25.997 24.37c-1.71 0-3.23.87-4.13 2.18-.37.55-.64 1.17-.77 1.84-.07.32-.1.65-.1.98 0 2.75 2.25 5 5 5 2.76 0 5-2.25 5-5 0-2.76-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3 0-.42.08-.81.24-1.17a2.985 2.985 0 0 1 2.76-1.83c1.66 0 3 1.34 3 3 0 1.65-1.34 3-3 3z"/><path fill="#ffffff" d="M28.997 29.37c0 1.65-1.34 3-3 3-1.65 0-3-1.35-3-3 0-.42.08-.81.24-1.17a2.985 2.985 0 0 1 2.76-1.83c1.66 0 3 1.34 3 3z"/><path fill="#ffffff" d="M22.313 28.818c-.13 0-.26-.026-.387-.078L9.969 23.71a1 1 0 01.775-1.843l11.957 5.028a1 1 0 01-.388 1.922zM8 30.369H3a1 1 0 110-2h5a1 1 0 110 2zM13.272 17.64a.997.997 0 01-.707-.293l-3.536-3.535a1 1 0 111.414-1.414l3.536 3.535a1 1 0 01-.707 1.707zM26 12.368a1 1 0 01-1-1v-5a1 1 0 112 0v5a1 1 0 01-1 1zM38.729 17.64a1 1 0 01-.707-1.707l3.535-3.535a1 1 0 111.414 1.414l-3.535 3.535a.997.997 0 01-.707.293zM49 30.369h-5a1 1 0 110-2h5a1 1 0 110 2zM42.264 46.632a.997.997 0 01-.707-.293l-3.536-3.535a1 1 0 111.415-1.414l3.535 3.535a1 1 0 01-.707 1.707zM9.736 46.632a1 1 0 01-.707-1.707l3.536-3.535a1 1 0 111.414 1.414l-3.536 3.535a.997.997 0 01-.707.293z"/></svg>`} />
                  <Text style={styles.infoText}>{`${location ? location.speed.toFixed(1) : '0.0'}`}</Text>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <SvgXml width="35" height="35" xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#ffffff" d="M2.252,44.093a1,1,0,0,1-.641-1.768L15.019,31.146a1,1,0,0,1,1.1-.123l4.753,2.428,4.245-4.091a1,1,0,0,1,.694-.28H28.5l4.984-8.671a1,1,0,0,1,.772-.5,1.017,1.017,0,0,1,.852.34L44.5,31.1l3.95-3.179a1,1,0,0,1,1.378.118L62.5,42.432A1,1,0,1,1,61,43.754L48.962,30.083l-3.956,3.184a1,1,0,0,1-1.383-.124l-9.11-10.517L29.94,30.578a1,1,0,0,1-.867.5H26.209l-4.467,4.306a1,1,0,0,1-1.149.171l-4.8-2.453L2.892,43.861A1,1,0,0,1,2.252,44.093Z"/><path fill="#ffffff" d="M35.266 42.831a1 1 0 0 1-.463-1.887l9.072-4.73L48.2 28.228a1 1 0 1 1 1.758.953l-4.472 8.255a1 1 0 0 1-.417.41l-9.343 4.872A1 1 0 0 1 35.266 42.831zM17.837 43.347a1 1 0 0 1-1-1.1l.487-4.921-2.558-4.954a1 1 0 1 1 1.777-.918l2.694 5.217a1 1 0 0 1 .107.557l-.217 2.187 6.332-7.025a1 1 0 0 1 1.627.2l2.254 4.265 2.315-5.146 1.7-10.959a1 1 0 0 1 1.977.307l-1.72 11.092a.962.962 0 0 1-.076.257l-3.21 7.137a1 1 0 0 1-.88.589.961.961 0 0 1-.916-.532l-2.541-4.811L18.58 43.017A1 1 0 0 1 17.837 43.347z"/><path fill="#ffffff" d="M38.3,38.3a1,1,0,0,1-.622-1.784L43.758,31.7A1,1,0,1,1,45,33.271l-6.076,4.816A1,1,0,0,1,38.3,38.3Z"/></svg>`} />
                  <Text style={styles.infoText}>{`${location ? location.altitude.toFixed(1) : '0.0'}`}</Text>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <SvgXml width="28" height="28" xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0,0H24V24H0Z" data-name="Path 3737"/><path fill="#ffffff" d="M1161.3,251.5h-.956a7.8,7.8,0,0,1-6.844,6.843v.957a.9.9,0,1,1-1.8,0v-.957a7.8,7.8,0,0,1-6.844-6.843h-.956a.9.9,0,1,1,0-1.8h.957a7.8,7.8,0,0,1,6.843-6.844V241.9a.9.9,0,1,1,1.8,0v.957a7.8,7.8,0,0,1,6.844,6.843h.956a.9.9,0,0,1,0,1.8Zm-4.5-1.8h1.725a6,6,0,0,0-5.025-5.027V246.4a.9.9,0,1,1-1.8,0v-1.725a6,6,0,0,0-5.027,5.025h1.727a.9.9,0,1,1,0,1.8h-1.725a6,6,0,0,0,5.026,5.027V254.8a.9.9,0,1,1,1.8,0v1.727a6,6,0,0,0,5.025-5.027H1156.8a.9.9,0,0,1,0-1.8Zm-4.2,1.8a.9.9,0,1,1,.9-.9A.9.9,0,0,1,1152.6,251.5Z" data-name="TARGET" transform="translate(-1140.6 -238.6)"/></svg>`} />
                  <Text style={styles.infoText}>{`${location ? location.accuracy.toFixed(1) : '0.0'}`}</Text>
                </View>
              </View>
            </View>


            <View style={{
              alignItems: "center", justifyContent: 'center',
              flex: 1, flexDirection: "row", flexWrap: "wrap",
              marginHorizontal: 20, marginVertical: 10, alignItems: "center"
            }}>

              <AppCircleButton
                disabled={permission.has == false || (status === FINISHED)}
                customClick={handlePlayButton}
                iconName={status === TRACKING ? "pause" : "play"}
                iconSize={35}
                style={{
                  width: 70,
                  height: 70,
                }}
              />

              {
                !(status === TRACKING || status === PAUSED) ? null :

                  <AppCircleButton
                    color="danger"
                    customClick={handleStopButton}
                    iconName="stop"
                    iconSize={35}
                    style={{
                      width: 70,
                      height: 70,
                      marginHorizontal: 15
                    }}
                  />

              }

            </View>



          </View>
        </TabView.Item>


        <TabView.Item style={{ width: '100%' }}>

          <ScrollView keyboardShouldPersistTaps="handled">


            {
              (permission.has === false) &&
              <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={Styles.notes}>{permission.message ? permission.message : 'APP WITHOUT LOCATION PERMISSION'}</Text>
                </View>
              </Card>
            }

            {entity && entity.postErrors &&
              <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text style={Styles.formErrorHeader}>Erros de validação!</Text>
                  {Object.entries(entity.postErrors).map((item, i) => <Text key={i} style={Styles.formErrors}>{`${modelKeys.hasOwnProperty(item[0]) ? modelKeys[item[0]] : item[0]}: ${item[1]}`}</Text>)}
                </View>
              </Card>
            }

            <Formik
              initialValues={entity}
              initialErrors={entity.formErrors}
              validationSchema={validationSchema}
              onSubmit={async (values, actions) => {
                let res = await saveData(undefined, values);

                if (res)
                  navigation.goBack();

                actions.setSubmitting(false);
              }}
            >

              {({ isSubmitting, values, errors, handleChange, handleSubmit, setFieldValue }) => (

                <View style={{ width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
                  {
                    errors.message &&
                    <Text>{errors.message}</Text>
                  }

                  <View style={{ flex: 1 }}>


                    {errors.beachId &&

                      <Text style={{
                        color: '#DB1F48',
                        fontSize: 14,
                        fontFamily: 'UbuntuLight',
                        width: '100%',
                        paddingLeft: 15
                      }} >{errors.beachId}</Text>
                    }
                  </View>

                  <View style={{ flexDirection: 'row', padding: 10, marginTop: 10 }}>
                    <Text style={{ color: '#7384B4', fontSize: 18, paddingHorizontal: 15 }}>Finalizado?</Text>
                    <Switch
                      value={values.finished}
                      onValueChange={(value) => setFieldValue(FINISHED, value)}
                    />
                  </View>

                  {
                    values && values.finished === false &&

                    <FormInput
                      value={values.notFinishedJustification}
                      onChangeText={handleChange('notFinishedJustification')}
                      placeholder="Justificativa não finalizado"
                      returnKeyType="next"
                      errorMessage={errors.notFinishedJustification}
                      multiline
                      numberOfLines={2}
                    />
                  }

                  <FormInput
                    value={values.observation}
                    onChangeText={handleChange('observation')}
                    placeholder="Observação"
                    returnKeyType="next"
                    errorMessage={errors.observation}
                    multiline
                    numberOfLines={2}
                  />

                  <Button
                    loading={isSubmitting}
                    title="Salvar"
                    containerStyle={{ flex: -1, marginLeft: 'auto', marginRight: 'auto' }}
                    buttonStyle={{ backgroundColor: Colors.primary }}
                    titleStyle={{ paddingHorizontal: 10 }}
                    onPress={handleSubmit}
                    disabled={isSubmitting || status === TRACKING || status === null}
                  />
                </View>

              )}

            </Formik>

          </ScrollView>
        </TabView.Item>
      </TabView>
    </>


  );
};

const styles = StyleSheet.create({
  container: {

    flex: 5, //the container will fill the whole screen.
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 20
  },
  infoContainer: {
    paddingHorizontal: 10,
    width: '50%',
    borderWidth: 1,
    backgroundColor: Colors.primary,
    borderColor: 'rgba(110, 120, 170, 1)',
  },

  infoText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'UbuntuLight',
    marginVertical: 10,
    marginHorizontal: 10
  },

  infoItem: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  }

});

export default TrackingForm;



/*



                


   


                


*/