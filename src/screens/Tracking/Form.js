import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  BackHandler,
  StyleSheet
} from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import Mytextinput from '../../components/Mytextinput';
import Mybutton from '../../components/Mybutton';
import { DatabaseConnection } from '../../database/database-connection';
import TrackingService from '../../services/TrackingService';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';

const db = DatabaseConnection.getConnection();

const TrackingForm = ({ navigation }) => {

  const {    
    currentStatus,
    currentLocation,
    data,
    permission,
    errorMessage,
    PAUSED,
    STOPED,
    TRACKING,
    startTracking,
    pauseTracking,
    stopTracking
  } = TrackingService();

  const CONTINUE_TITLE = 'Continue';
  const PAUSE_TITLE = 'Pause';
  const FINISHED = 'finished';

  let [userName, setUserName] = useState('');
  let [userContact, setUserContact] = useState('');
  let [userAddress, setUserAddress] = useState('');
  let unsubscribeBackListener = null;

  let register_user = () => {
    console.log(userName, userContact, userAddress);

    if (!userName) {
      alert('Por favor preencha o nome !');
      return;
    }
    if (!userContact) {
      alert('Por favor preencha o contato');
      return;
    }
    if (!userAddress) {
      alert('Por favor preencha o endereço !');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_user (user_name, user_contact, user_address) VALUES (?,?,?)',
        [userName, userContact, userAddress],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Sucesso',
              'Usuário Registrado com Sucesso !!!',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('TrackingList'),
                },
              ],
              { cancelable: false }
            );
          } else alert('Erro ao tentar Registrar o Usuário !!!');
        }
      );
    });

  };

  useEffect(() => {

    unsubscribeBackListener = navigation.addListener('beforeRemove', handleBackButton);
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      console.log('unmount')
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      unsubscribeBackListener && unsubscribeBackListener();
    };

  }, [navigation, currentStatus]);

  const handleBackButton = (event) => {

    if (currentStatus === TRACKING) {
      pauseTracking();
    }

    if (currentStatus !== null && data.status !== STOPED) {
      saveTracking({ ...data }, true);

      Alert.alert(
        'Alert',
        'Tracking is incomplete, the record has been saved for future changes.'
      );
    }

  }

  const finishTracking = () => {
    stopTracking();
    save();
  }

  const save = () => {
    // data.status = FINISHED;
    console.log('save record')
    console.log(data.startDate, data.endDate)
    saveTracking(data);
  }

  const saveTracking = (data, isStoreData = false) => {

    let sql = '';
    let message = '';
    let json = JSON.stringify(data);

    if (data.id === null) {
      sql = 'INSERT INTO tracking (data) VALUES (?)'
      message = 'Tracking created!'
    } else {
      sql = 'UPDATE tracking SET data = ?';
      message = 'Tracking updated!'
    }

    let e = db.transaction(function (tx) {
      tx.executeSql(
        sql,
        [json],
        (tx, results) => {
          console.log('Results', results.rowsAffected);

          if (results.rowsAffected > 0) {
            if (!isStoreData) {
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
          } else {
            return console.log('Erro ao salvar o registro!!!');
          }
        }

      );

    });

  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, justifyContent: 'space-between' }}>

              {/*<Mytextinput
                placeholder="Entre com o Nome"
                onChangeText={
                  (userName) => setUserName(userName)
                }
                style={{ padding: 10 }}
              />
              <Mytextinput
                placeholder="Entre com o Telefone"
                onChangeText={
                  (userContact) => setUserContact(userContact)
                }
                maxLength={10}
                keyboardType="numeric"
                style={{ padding: 10 }}
              />
              <Mytextinput
                placeholder="Entre com o Endereço"
                onChangeText={
                  (userAddress) => setUserAddress(userAddress)
                }
                maxLength={225}
                numberOfLines={5}
                multiline={true}
                style={{ textAlignVertical: 'top', padding: 10 }}
              />
              <Mybutton title="Salvar" customClick={register_user} />
              */}


              <View style={styles.row}>              
              <Icon name="rocket" size={30} color="#900" />
                <Mybutton title="Start" buttonStyle={styles.button} labelStyle={styles.buttonLabel} visible={currentStatus === null} disabled={currentStatus !== null || permission == false} customClick={startTracking} />
                <Mybutton title={currentStatus === TRACKING ? PAUSE_TITLE : CONTINUE_TITLE} buttonStyle={styles.button} labelStyle={styles.buttonLabel} visible={currentStatus === TRACKING || currentStatus === PAUSED} disabled={currentStatus !== TRACKING && currentStatus !== PAUSED} customClick={currentStatus === TRACKING ? pauseTracking : startTracking} />
                <Mybutton title="Stop" buttonStyle={styles.button} labelStyle={styles.buttonLabel} visible={currentStatus === TRACKING || currentStatus === PAUSED}  disabled={currentStatus !== TRACKING && currentStatus !== PAUSED} backgroundColor={'danger'} customClick={finishTracking} />
                {/*<Mybutton title="Save" buttonStyle={styles.button} labelStyle={styles.buttonLabel} visible={currentStatus === STOPED} disabled={currentStatus !== STOPED} backgroundColor={'success'} customClick={save} />*/}

              </View>

              {
                (permission === false || errorMessage) && 
                <Card containerStyle={[styles.card, { backgroundColor: '#dc3545' }]}>
                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>{errorMessage ? errorMessage : 'APP WITHOUT LOCATION PERMISSION'}</Text>                    
                  </View>
                </Card>
              }

              <Card containerStyle={styles.card}>              

                <View style={{ flex: 1 }}>
                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>Date/Time: </Text>
                    <Text style={styles.notes}>{currentLocation.timestamp && moment(currentLocation.timestamp).format("YYYY-MM-DD HH:mm:ss")}</Text>
                  </View>

                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>Location: </Text>
                    <Text style={styles.notes}>{currentLocation.latitude && `Lat ${currentLocation.latitude.toFixed(4)} - Lng ${currentLocation.longitude.toFixed(4)}`}</Text>
                  </View>

                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>Speed: </Text>
                    <Text style={styles.notes}>{currentLocation.speed}</Text>
                  </View>

                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>Accuracy: </Text>
                    <Text style={styles.notes}>{currentLocation.accuracy}</Text>
                  </View>

                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.notes}>Altitude: </Text>
                    <Text style={styles.notes}>{currentLocation.altitude}</Text>
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

const styles = StyleSheet.create({
    textheader: {
        color: '#111',
        fontSize: 12,
        fontWeight: '700',

    },
    textbottom: {
        color: '#111',
        fontSize: 18,
    },

  card:{
    backgroundColor:'rgba(56, 172, 236, 1)',
    borderWidth:0,
    borderRadius:20
  },
  time:{
    fontSize:38,
    color:'#fff'
  },
  notes: {
    fontSize: 18,
    color:'#fff',
    textTransform:'capitalize'
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 3,
    alignSelf: "flex-start",
    marginHorizontal: "4%",
    marginBottom: 6,
    marginTop: 15,
    textAlign: "center",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});

export default TrackingForm;