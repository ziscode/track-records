import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import TrackingService from '../../services/TrackingService';
import moment from 'moment';
import TrackingModel from '../../models/Tracking';
import AppCircleButton from '../../components/AppCircleButton';
import { Styles, Colors } from '../../components/Styles';

const TrackingForm = ({ route, navigation }) => {

  const {
    trackingStatus,
    lastLocation,
    data,
    permission,
    errorMessage,
    PAUSED,
    FINISHED,
    TRACKING,
    startTracking,
    pauseTracking,
    stopTracking
  } = TrackingService(route.params && route.params.data);

  const { model, modelKeys, save } = TrackingModel();
  const [entity, setEntity] = useState(model)

  let unsubscribeBackListener = null;

  useEffect(() => {
    if (route.params && route.params.data) {
      setEntity(route.params.data)
    }

    unsubscribeBackListener = navigation.addListener('beforeRemove', handleBackButton);

    return () => {
      unsubscribeBackListener && unsubscribeBackListener();
    };

  }, [navigation, trackingStatus]);

  const handleBackButton = (event) => {

    if (trackingStatus === TRACKING) {
      pauseTracking();
    }

    if (trackingStatus !== null && trackingStatus !== FINISHED) {
      saveEntity(trackingStatus === TRACKING ? PAUSED : null);

      Alert.alert(
        'Monitoramento incompleto!',
        'O registro será salvo para alterações futuras.'
      );
    }

  }

  const finishTracking = () => {
    stopTracking();
    saveEntity(FINISHED);
  }

  const saveEntity = async (status = null) => {
    let d = { ...entity };
    d.tracking = data.tracking;
    d.trackingInfo = data.trackingInfo;
    d.status = status ? status : trackingStatus;
    let res = await save(d);

    if (status === FINISHED && res) {
      let message = 'Registro criado!';

      if (d.id) {
        message = 'Registro atualizado!';
      }

      Alert.alert(
        'Sucesso',
        message,
        [
          {
            text: 'Ok',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, justifyContent: 'space-between' }}>

              {entity && entity.status !== 'finished' &&

                <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: 20, marginVertical: 10 }}>

                  <AppCircleButton
                    disabled={permission == false}
                    btnIcon={trackingStatus === TRACKING ? "pause" : "play"}
                    size={25}
                    style={{
                      maxWidth: 60,
                      maxHeight: 60,
                    }}
                    customClick={trackingStatus === TRACKING ? pauseTracking : startTracking}
                  />

                  <AppCircleButton
                    visible={trackingStatus === TRACKING || trackingStatus === PAUSED}
                    disabled={trackingStatus !== TRACKING && trackingStatus !== PAUSED}
                    btnIcon="stop"
                    color="danger"
                    size={25}
                    style={{
                      maxWidth: 60,
                      maxHeight: 60,
                      marginHorizontal: 15
                    }}
                    customClick={finishTracking}
                  />

                </View>
              }

              <Divider style={{ marginHorizontal: 20, backgroundColor: '#000000' }}></Divider>

              {
                (permission === false || errorMessage) &&
                <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>{errorMessage ? errorMessage : 'APP WITHOUT LOCATION PERMISSION'}</Text>
                  </View>
                </Card>
              }

              {entity && entity.postErrors &&
                <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>                    
                    <Text style={Styles.formErrorHeader}>Erros de validação!</Text>
                    {Object.entries(entity.postErrors).map((item, i) => <Text key={i} style={Styles.formErrors}>{`${ modelKeys.hasOwnProperty(item[0]) ? modelKeys[item[0]] : item[0]  }: ${item[1]}`}</Text>)}
                  </View>
                </Card>
              }

              <Card containerStyle={Styles.card}>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Data/Hora: </Text>
                    <Text style={Styles.notes}>{lastLocation.timestamp && moment(lastLocation.timestamp).format("YYYY-MM-DD HH:mm:ss")}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Localização: </Text>
                    <Text style={Styles.notes}>{lastLocation.latitude && `Lat ${lastLocation.latitude.toFixed(4)}/Lng ${lastLocation.longitude.toFixed(4)}`}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Velocidade: </Text>
                    <Text style={Styles.notes}>{lastLocation.speed}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Precisão: </Text>
                    <Text style={Styles.notes}>{lastLocation.accuracy}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Altitude: </Text>
                    <Text style={Styles.notes}>{lastLocation.altitude}</Text>
                  </View>

                </View>


              </Card>


            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrackingForm;