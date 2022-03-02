import React, {
    useState,
    useEffect
} from 'react';

import { Platform } from 'react-native';
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

        loadPosition();

    }, []);

    const loadPosition = async () => {
        const result = await requestMultiple(
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
        
    }

    const startTracking = () => {
        
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

        } else {
            //TODO app without geo position
        }

    }

    const pauseTracking = () => {
        unsubscribeGeolocation();     

        if (data.tracking.length > 0) {
            updateStatus(PAUSED, data.tracking[data.tracking.length - 1]);
        }

    }

    const stopTracking = () => {
        unsubscribeGeolocation();     

        if (data.tracking.length > 0) {            
            updateStatus(FINISHED, data.tracking[data.tracking.length - 1]);
        }
    }

    const updateStatus = (status, location) => {
        if (data.status === status) {
            return;
        }
        
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