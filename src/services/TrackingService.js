import React, {
    useState,
    useEffect
} from 'react';

import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

const TrackingService = (record = null) => {

    const PAUSED = 'paused';
    const FINISHED = 'finished';
    const TRACKING = 'tracking';

    const [ trackingStatus, setTrackingStatus] = useState(null);
    const [ lastLocation, setLastLocation ] = useState({});
    const [ permission, setPermission ] = useState(null);
    const [ errorMessage, setErrorMessage ] = useState(null);
    
    const [data, setData] = useState({
        tracking: [],
        trackingInfo: []
    });

    const [unsubscribe, setUnsubscribe] = useState({
        'watchId': null
    });

    useEffect(()=> {
        
        if (record) {
            setTrackingStatus(record.status);
            setLastLocation(record.tracking[record.tracking.length-1]);
            data.tracking = record.tracking,
            data.trackingInfo = record.trackingInfo;
            setData(data);
        }

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
        
        if (permission && unsubscribe.watchId == null) {
            setErrorMessage(null);

            let watchId = Geolocation.watchPosition(
                position => {
                    let location = position.coords;
                    location['timestamp'] = position.timestamp;

                    setLastLocation(location);
                    data.tracking.push(location);
                    updateStatus(TRACKING, location);
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
        unsubscribeGeolocation();     

        if (data.tracking.length > 0) {
            updateStatus(PAUSED, data.tracking[data.tracking.length - 1]);
        }

    }

    const stopTracking = () => {
        console.log('stop called')
        unsubscribeGeolocation();     

        if (data.tracking.length > 0) {            
            updateStatus(FINISHED, data.tracking[data.tracking.length - 1]);
        }
    }

    const updateStatus = (status, location) => {
        if (data.status === status) {
            return;
        }
        
        console.log("Change status to: " + status);
        setTrackingStatus(status);

        data.status = status;
        data.trackingInfo.push({
            date: location.timestamp,
            point: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            status: status
        });

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