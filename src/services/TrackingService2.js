import React, {
    useState,
    useEffect
} from 'react';

import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

const TrackingService2 = () => {

    const GPS_MESSAGE = 'Sem permissão de uso do GPS!';

    const [permission, setPermission] = useState({
        has: null,
        message: null,
    });

    const [location, setLocation] = useState(null);

    const [unsubscribe, setUnsubscribe] = useState({
        'watchId': null
    });

    useEffect(() => {        
        
    }, []);

    useEffect(() => {
        return () => {
            unsubscribeGeolocation();
        }
    }, [unsubscribe])

    const loadPosition = async () => {
        const result = await requestMultiple(
            [
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
            ]).then(
                (statuses) => {
                    const statusFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
                    const statusBack = statuses[PERMISSIONS.
                        ANDROID.ACCESS_BACKGROUND_LOCATION];

                    if (Platform.Version < 29) {
                        if (statusFine == 'granted') {
                            return true;
                        }

                        return false;
                    }

                    if (statusFine == 'granted' && statusBack == 'granted') {
                        return true;
                    }

                    return false;
                },
            );

        permission.has = result;
        permission.message = result === false ? GPS_MESSAGE : null;
        setPermission({ ...permission });

        if (result === true && unsubscribe.watchId == null) {
            watch();
        }

    }

    const watch = () => {
        let watchId = Geolocation.watchPosition(
            position => {
                let location = position.coords;
                location['timestamp'] = position.timestamp;
                setLocation({...location})

                console.log(location.timestamp)
            },
            error => {
                permission.message = error.message;
                setPermission({ ...permission });
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 3000,
                fastestInterval: 1000,
            },
        );

        if (watchId !== null) {
            setUnsubscribe({ 'watchId': watchId })
        }
    }

    const startTracking = () => {
        loadPosition();
    }

    const stopTracking = async () => {
        unsubscribeGeolocation();
    }

    const unsubscribeGeolocation = () => {
        if (unsubscribe && unsubscribe.watchId !== null) {
            Geolocation.clearWatch(unsubscribe.watchId);
            setUnsubscribe({
                'watchId': null
            });

            return true;
        }

        return false;
    }

    return {
        location,
        permission,
        startTracking,
        stopTracking,
        unsubscribeGeolocation
    }

}

export default TrackingService2;