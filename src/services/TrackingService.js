import React, {
    useState,
    useEffect
} from 'react';

import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

const TrackingService = () => {

    const INITIALIZED = 'initialized';
    const PAUSED = 'paused';
    const STOPED = 'stoped';
    const TRACKING = 'tracking';

    const [ currentStatus, setCurrentStatus] = useState(null);
    const [ currentLocation, setCurrentLocation ] = useState({});
    const [ permission, setPermission ] = useState(null);
    const [ errorMessage, setErrorMessage ] = useState(null);
    
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
        'watchId': null
    });

    useEffect(()=> {

        (async function loadPosition() {
            const result = requestMultiple(
                [
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
                ]).then(
                    (statuses) => {
                        const statusFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
                        const statusBack = statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION];
                        
                        if (Platform.Version < 29) {
                            if (statusFine == 'granted') {
                                return true;
                            } else {
                                setErrorMessage('User did not accept GPS usage request!');
                            }
                        }
                        
                        if (statusFine == 'granted' && statusBack == 'granted') {
                            return true;
                        } else {
                            setErrorMessage('User did not accept GPS usage request!');
                        }
                    },
                );

            setPermission(result);
        })()

    }, []);

    const startTracking = () => {
        console.log('start called')
        console.log(permission)
        
        if (permission && unsubscribe.watchId == null) {
            setErrorMessage(null);

            let watchId = Geolocation.watchPosition(
                position => {
                    let location = position.coords;
                    location['timestamp'] = position.timestamp;

                    setCurrentLocation(location);
                    updatecurrentStatus(TRACKING, location);
                },
                error => {
                  setErrorMessage(error.message);
                  console.log(error);
                },
                {
                  enableHighAccuracy: true,
                  distanceFilter: 0,
                  interval: 3000,
                  fastestInterval: 1000,
                },
            );
    
            if (watchId !== null) {
                setUnsubscribe({'watchId':watchId})
            }

            console.log('WATCH ID ' +watchId)

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
        if (unsubscribe && unsubscribe.watchId !== null) {
            Geolocation.clearWatch(unsubscribe.watchId);
            setUnsubscribe({
                'watchId': null
            });
        }
    }

    return {
        currentStatus,
        currentLocation,
        data,
        permission,
        errorMessage,
        INITIALIZED,
        PAUSED,
        STOPED,
        TRACKING,        
        startTracking,
        pauseTracking,
        stopTracking,
    }
    
}

export default TrackingService;

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