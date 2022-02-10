import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import { DatabaseConnection } from '../../database/database-connection';
import TrackingService from '../../services/TrackingService';
import moment from 'moment';
import TrackingModel from '../../models/Tracking';
import AppCircleButton from '../../components/AppCircleButton';
import { Styles } from '../../components/Styles';

const db = DatabaseConnection.getConnection();

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

  const { model, save } = TrackingModel();
  const [ entity, setEntity ] = useState(model)
  
  const CONTINUE_TITLE = 'Continue';
  const PAUSE_TITLE = 'Pause';  
  
  let unsubscribeBackListener = null;

  useEffect(() => {
    if (route.params && route.params.data) {
      setEntity(route.params.data)
    }

    unsubscribeBackListener = navigation.addListener('beforeRemove', handleBackButton);

    return () => {
      console.log('unmount')
      unsubscribeBackListener && unsubscribeBackListener();
    };

  }, [navigation, trackingStatus]);

  const handleBackButton = (event) => {

    if (trackingStatus === TRACKING) {
      pauseTracking();
    }

    if (trackingStatus !== null && data.status !== FINISHED) {
      saveEntity(trackingStatus === TRACKING ? PAUSED : null);

      Alert.alert(
        'Alert',
        'Tracking is incomplete, the record has been saved for future changes.'
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
      let message = 'Tracking created!';
    
      if (d.id !== null) {
        message = 'Tracking updated!';
      }
      
      Alert.alert(
        'Success',
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

              <View style={{flexDirection: "row", flexWrap: "wrap", marginHorizontal: 20, marginVertical: 10}}>

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
              
              <Divider style={{marginHorizontal:20, backgroundColor:'#000000'}}></Divider>

              {
                (permission === false || errorMessage) &&
                <Card containerStyle={[Styles.card, { backgroundColor: '#dc3545' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>{errorMessage ? errorMessage : 'APP WITHOUT LOCATION PERMISSION'}</Text>
                  </View>
                </Card>
              }

              <Card containerStyle={Styles.card}>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Date/Time: </Text>
                    <Text style={Styles.notes}>{lastLocation.timestamp && moment(lastLocation.timestamp).format("YYYY-MM-DD HH:mm:ss")}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Location: </Text>
                    <Text style={Styles.notes}>{lastLocation.latitude && `Lat ${lastLocation.latitude.toFixed(4)} - Lng ${lastLocation.longitude.toFixed(4)}`}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Speed: </Text>
                    <Text style={Styles.notes}>{lastLocation.speed}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Accuracy: </Text>
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