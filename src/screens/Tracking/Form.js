import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import AppMapView from './AppMapView';
import TrackingModel from '../../models/Tracking';
import { Styles, Colors } from '../../components/Styles';
import { Formik } from "formik";
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import APIService from '../../services/APIService';
import FormInput from '../../components/FormInput';
import * as geolib from 'geolib';
import { useTracking } from '../../services/TrackingService';
import BackgroundService from 'react-native-background-actions';

import {
  View,
  ScrollView,
  Alert,
  ToastAndroid,
} from 'react-native';

import {
  Text,
  Card,
  Switch,
  Button,
  Tab,
  TabView,
} from 'react-native-elements';

const TrackingForm = ({ route, navigation }) => {

  const veryIntensiveTask = async (taskDataArguments) => {
    // Example of an infinite loop task
    const { delay } = taskDataArguments;
    await new Promise(async (resolve) => { });
  };

  const options = {
    taskName: 'MonitoringTracking',
    taskTitle: 'Geolocation',
    taskDesc: 'Monitoramento! Obtendo localização.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    parameters: {
      delay: 1000,
    },
  };

  const startBackgroundService = async () => {
    if (BackgroundService.isRunning() === false) {
      await BackgroundService.start(veryIntensiveTask, options);
    }
  }

  const {
    tracking,
    watching,
    stopTracking,
  } = useTracking();

  const TRACKING = 'tracking';
  const PAUSED = 'paused';
  const FINISHED = 'finished';

  const { model, modelKeys, save } = TrackingModel();
  const { getStoragedBeaches } = APIService();

  const formRef = useRef();
  const [entity, setEntity] = useState((route.params && route.params.data ? route.params.data : model));
  const [beaches, setBeaches] = useState([]);
  const [index, setIndex] = useState(0);
  const [beachId, setBeachId] = useState(entity.beachId);
  const [beachGeoJson, setBeachGeoJson] = useState([]);
  const [canTracking, setCanTracking] = useState(entity.status === PAUSED ? true : false);
  const [isTracking, setIsTracking] = useState(false);
  const [mapInitialValues, setMapInitialValues] = useState(
    {
      startLocation: entity.initialCoordinate,
      endLocation: entity.finalCoordinate,
      tracking: entity.tracking,
      trackingLog: createTrackingTimeLine(entity.trackingInfo)
    }
  );

  const validationSchema = Yup.object().shape({
    finished: Yup.bool(),
    notFinishedJustification: Yup.string().when(FINISHED, {
      is: false,
      then: (schema) => schema.required('Preenchimento obrigatório')
    }),
    observation: Yup.string()
  });

  useEffect(() => {
    getBeaches();

    const unsubscribeBackListener = navigation.addListener('beforeRemove', handleBackButton);

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBackPress
    );

    if ((entity.postErrors || entity.formErrors) &&
      entity.status === FINISHED) {
      setIndex(1);
      formRef.current.setErrors(entity.formErrors);
    }

    return () => {
      BackgroundService.stop();
      unsubscribeBackListener && unsubscribeBackListener();
      backHandler.remove();
    };

  }, [isTracking, tracking]);

  useEffect(() => {
    if (watching)
      startBackgroundService()
    else
      BackgroundService.stop();
  }, [watching])

  const getBeaches = async () => {
    let list = await getStoragedBeaches();

    setBeaches(list);

    if (entity.beachId)
      setBeachGeoJson([...selectBeachGeoJson(entity.beachId, list)]);
  }

  function handleHardwareBackPress(e) {
    navigation.goBack();
    return true;
  }

  const handleBackButton = async (e) => {

    stopTracking();
    e.preventDefault();

    if (!isTracking) {
      navigation.dispatch(e.data.action);
      return;
    }

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

  const handlePlay = (location) => {
    if (!location) return;

    entity.trackingInfo.push(
      {
        date: location.timestamp,
        point: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        status: TRACKING
      }
    );
    
    setIsTracking(true);
    setEntity(entity);
  }

  const handlePause = () => {
    setIsTracking(false);
    saveData(PAUSED);
  }

  const handleStop = () => {
    console.log("A")
    setIsTracking(false);
    saveData(FINISHED);
    setCanTracking(false);
  }

  const saveData = async (status, formValues = null) => {

    let coordinate = tracking.length === 0 ? 
      entity.tracking[entity.tracking.length - 1] : 
      tracking[(tracking.length - 1)];

    entity.formErrors = null;

    if (status && coordinate) {
      entity.status = status;

      entity.trackingInfo.push(
        {
          date: coordinate.timestamp,
          point: {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
          },
          status: status
        }
      );
    }

    entity.tracking = entity.tracking.concat(tracking);
    console.log(entity.tracking.length)

    if (formRef.current.values.finished !== null) {
      for (let k in formValues) {
        entity[k] = formValues[k];
      }
    } else {
      entity.finished = checkBeachIntersection(tracking, beachGeoJson);
    }

    if (entity.finished === false && (!entity.notFinishedJustification || !entity.notFinishedJustification === ''))
      entity.formErrors = { ...{ 'notFinishedJustification': 'Preenchimento obrigatório' } };

    entity.beachId = beachId;
    entity.beach = beaches.find(item => item.id === beachId);

    let res = await save(entity);

    if (res) {
      let message = entity.id ? 'Monitoramento atualizado com sucesso!' : 'Monitoramento criado com sucesso!';
      entity.id = res;
      setEntity({ ...entity });

      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );

      return true;
    }

    return false;

  }

  function createTrackingTimeLine(trackingLog) {
    let start = null;
    let list = [];

    if (trackingLog && trackingLog.length > 0)
      trackingLog.map((item) => {
        if (!start)
          start = item;

        if (start && start.date < item.date) {
          list.push({ start: start.date, end: item.date });
          start = null;
        }
      });

    return list;
  }

  const selectBeachGeoJson = (id, beaches) => {
    if (!beaches)
      return;

    let list = [];
    let beach = beaches.find(item => item.id === id);
    let json = beach ? beach.geoJson : null;

    if (json) {
      let features = json.features

      for (let i = 0; i < features.length; i++) {
        let obj = { type: "FeatureCollection", features: [], properties: { poly: [], isIntersects: false } };
        let coordinates = features[i].geometry.coordinates[0];
        coordinates.map(item => obj.properties.poly.push({ longitude: item[0], latitude: item[1] }));
        obj.features.push(features[i]);
        list.push(obj);
      }
    }

    return list;
  }

  const checkBeachIntersection = (locations, geometries) => {
    if (geometries.length === 0) return false;

    let count = 0;

    geometries.map((item, i) => {
      locations.map((location) => {
        if (geolib.isPointInPolygon({ latitude: location.latitude, longitude: location.longitude }, item.properties.poly))
          count++;
      })
    });

    return count === geometries.length;
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
          containerStyle={{ backgroundColor: 'rgba(110, 120, 170, 1)' }}
          titleStyle={{ fontSize: 14 }}
          icon={{ name: 'map', type: 'ionicon', color: 'white' }}
        />
        <Tab.Item
          title="Formulário"
          containerStyle={{ backgroundColor: 'rgba(110, 120, 170, 1)' }}
          titleStyle={{ fontSize: 14 }}
          icon={{ name: 'document-text', type: 'ionicon', color: 'white' }}
        />
      </Tab>

      <TabView value={index} animationType="spring">
        <TabView.Item style={{ width: '100%' }}>



          <View style={{ flex: 1, flexDirection: "column" }}>

            <View style={{
              borderBottomWidth: 1, borderColor: 'rgba(110, 120, 170, 1)',
              height: 50,
              marginHorizontal: 10,
            }}>

              <Picker selectedValue={beachId}
                onValueChange={(itemValue, itemIndex) => {
                  setBeachId(itemValue)

                  if (beachId != itemValue) {
                    setBeachGeoJson([...selectBeachGeoJson(itemValue, beaches)]);
                    if (entity.status !== FINISHED) setCanTracking(true);
                  }

                }}
              >
                {beachId ? null : <Picker.Item label={'Selecione uma praia'} value={0} style={{ color: '#7384B4', fontSize: 18 }} />}
                {
                  beaches.map((item, i) => <Picker.Item key={i} label={item.name} value={item.id} />)
                }
              </Picker>
            </View>

            <AppMapView
              initialValues={mapInitialValues}
              showsUserLocation={entity.status !== FINISHED}
              geometries={beachGeoJson}
              checkIntersections={true}
              isTracking={canTracking}
              handlePlay={handlePlay}
              handlePause={handlePause}
              handleStop={handleStop}

            ></AppMapView>


          </View>




        </TabView.Item>


        <TabView.Item style={{ width: '100%' }} pointerEvents={isTracking || entity.status === null ? "none" : "auto"}>

          <ScrollView keyboardShouldPersistTaps="handled">

            {entity && entity.postErrors &&
              <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text style={Styles.formErrorHeader}>Erros de validação!</Text>
                  {Object.entries(entity.postErrors).map((item, i) => <Text key={i} style={Styles.formErrors}>{`${modelKeys.hasOwnProperty(item[0]) ? modelKeys[item[0]] : item[0]}: ${item[1]}`}</Text>)}
                </View>
              </Card>
            }

            <Formik
              innerRef={formRef}
              initialValues={{
                finished: entity.finished,
                notFinishedJustification: entity.notFinishedJustification,
                observation: entity.observation
              }}
              enableReinitialize={true}
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
                    errors && errors.message ?
                    <Text>{errors.message}</Text>
                    :null
                  }

                  <View style={{ flex: 1 }}>


                    {errors && errors.beachId ?

                      <Text style={{
                        color: '#DB1F48',
                        fontSize: 14,
                        fontFamily: 'UbuntuLight',
                        width: '100%',
                        paddingLeft: 15
                      }} >{errors.beachId}</Text>
                      :null
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
                    values && !values.finished &&

                    <FormInput
                      value={values.notFinishedJustification}
                      onChangeText={handleChange('notFinishedJustification')}
                      placeholder="Justificativa não finalizado"
                      returnKeyType="next"
                      errorMessage={errors && errors.notFinishedJustification}
                      multiline
                      numberOfLines={2}
                    />
                  }

                  <FormInput
                    value={values.observation}
                    onChangeText={handleChange('observation')}
                    placeholder="Observação"
                    returnKeyType="next"
                    errorMessage={errors && errors.observation}
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
                    disabled={isSubmitting || isTracking || entity.status === null}
                  />
                </View>

              )}

            </Formik>

            {/* <AppMapView coordinate={location} ></AppMapView> */}

          </ScrollView>
        </TabView.Item>
      </TabView>
    </>


  );
};

export default TrackingForm;