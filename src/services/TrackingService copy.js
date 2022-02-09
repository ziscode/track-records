import React, {
    useState,
    useEffect
} from 'react';
import RNLocation from 'react-native-location';

import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

RNLocation.configure({
    distanceFilter: 0, // Meters
    desiredAccuracy: {
        ios: 'best',
        android: 'highAccuracy',
    },
    interval: 1000,
    maxWaitTime: 1000,
});

const TrackingServiceCopy = () => {

    const INITIALIZED = 'initialized';
    const PAUSED = 'paused';
    const STOPED = 'stoped';
    const TRACKING = 'tracking';

    const [ currentStatus, setCurrentStatus] = useState(null);
    const [ currentLocation, setCurrentLocation ] = useState({});
    const [ permission, setPermission ] = useState(null);


    const [errorMsg, setErrorMsg] = useState(null); // será utilizado para armazenar alguma mensagem de erro, caso ocorra
    const [coords, setCoords] = useState(null);   //vai armazenar a localização atual
    
    const [data, setData] = useState({
        id: null,
        startDate: null,
        endDate: null,
        startPoint: null,
        endPoint: null,
        status: null,    
        tracking: [],
        trackingInfo: []
    });

    const [unsubscribe, setUnsubscribe] = useState({
        'unsub': null
    });

    useEffect(()=> {

        (async function loadPosition() {
            const result = requestMultiple(
                [
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
                ]).then(
                    (statuses) => {
                        const statusFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];  //pegamos a autorização que o usuário selecionou para uso do GPS e para obter localização em primeiro plano
                        const statusBack = statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION];
                        
                        if (Platform.Version < 29) {
                            if (statusFine == 'granted') {
                                return true;
                            } else {
                                setErrorMsg('Usuário não aceitou solicitação de uso do GPS');
                            }
                        }
                        
                        if (statusFine == 'granted' && statusBack == 'granted') {
                            return true;
                        } else {
                            setErrorMsg('Usuário não aceitou solicitação de uso do GPS');
                        }
                    },
                );
            setPermission(result);
        })()



        
        // RNLocation.requestPermission({
        //     ios: "whenInUse",
        //     android: {
        //         detail: "fine",
        //         rationale: {
        //             title: "We need to access your location",
        //             message: "We use your location to show where you are on the map",
        //             buttonPositive: "OK",
        //             buttonNegative: "Cancel"
        //         }
        //     }
        // }).then(granted => {
        //     console.log(granted)
        //     setPermission(granted);
        // });

    }, []);

    const watchLocation = () => {
        let _watchId = Geolocation.watchPosition(
            position => {
              console.log(position)
            },
            error => {
              console.log(error);
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 0,
              interval: 5000,
              fastestInterval: 2000,
            },
          );

        console.log('WATCH ID ' +_watchId)
    }

    const startTracking = () => {
        console.log('start called')
        console.log(permission)
        if (permission) {

            const unsub = RNLocation.subscribeToLocationUpdates(
                locations => {
                    let location = { ...locations[0] };

                    if (location.timestamp) {
                        setCurrentLocation(location);
                        updatecurrentStatus(TRACKING, location);
                    }
                }
            );

            setUnsubscribe({
                'unsub': unsub
            });

        } else {
            console.log('APP WITHOUT LOCATION PERMISSION')
        }

    }

    const pauseTracking = () => {
        console.log('pause called')

        if (data.tracking.length > 0) {
            updatecurrentStatus(PAUSED, data.tracking[data.tracking.length - 1]);
        }

    }

    const stopTracking = () => {
        console.log('stop called')

        if (data.tracking.length > 0) {            
            updatecurrentStatus(STOPED, data.tracking[data.tracking.length - 1]);
        }
    }

    const updatecurrentStatus = (status, location) => {

        if (status == INITIALIZED) {

            status = TRACKING;

        } else if (status == PAUSED) {

            unsubscribeGeolocation();            

        } else if (status == STOPED) {

            data.endDate = location.timestamp;
            data.endPoint = {
                latitude: location.latitude,
                longitude: location.longitude
            };   

            unsubscribeGeolocation();                     

        } else if (status == TRACKING) {

            if (data.tracking.length == 0) {

                data.startDate = location.timestamp;
                
                data.startPoint = {
                    latitude: location.latitude,
                    longitude: location.longitude
                };
            
            }

            data.tracking.push(location);

        }

        if (data.status != status) {
            console.log("Change status to: " + status);
            setCurrentStatus(status);

            data.status = status;
            data.trackingInfo.push({
                date: location.timestamp,
                point: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                status: status
            });

        }

        
        setData(data);        

    }

    const unsubscribeGeolocation = () => {
        if (unsubscribe && unsubscribe.unsub) {
            unsubscribe.unsub();
            setUnsubscribe({
                'unsub': null
            });
        }
    }

    return {
        currentStatus,
        currentLocation,
        data,
        permission,
        INITIALIZED,
        PAUSED,
        STOPED,
        TRACKING,        
        startTracking,
        pauseTracking,
        stopTracking,
    }
    
}

export default TrackingServiceCopy;

  /**
   * TESTS
   * 
   * Iniciar mt e voltar (Salva o registro com status final pausa)
   * Iniciar mt pausar e voltar (Salva o registro com status final pausa)
   * Iniciar mt parar e voltar  (Salva o registro com status final parado)
   * Iniciar mt pausar, parar e voltar  (Salva o registro com status final parado)
   * Iniciar mt pausar, iniciar e voltar (Salva o registro com status final pausa)
   * Iniciar mt pausar, iniciar, pausar e voltar (Salva o registro com status final pausa)
   * Iniciar mt pausar, iniciar, parar e voltar (Salva o registro com status final parado)
   * Iniciar mt pausar, iniciar, pausar, parar e voltar (Salva o registro com status final parado)
   * Iniciar mt parar e salvar (Salva o registro com status final finalizado)
   * Iniciar mt pausar, parar e salvar (Salva o registro com status final finalizado)
   * Iniciar mt pausar, iniciar, parar e salvar (Salva o registro com status final finalizado)
   * 
   * Os mesmos testes podem ser aplicados para registros que estão com o status pausa.
   * 
   * Registros finalizados não podem ativar o traking, apenas atualizar os demais campos preenchidos manualmente.
   * 
   */