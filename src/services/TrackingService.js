import React, { createContext, useState, useContext, useEffect } from 'react';

import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

const TrackingContextData = {
    location: null,
    permission: {
        has: null,
        message: null,
    },
    tracking: [],
    isTracking: false,
    startTracking: () => { },
    stopTracking: () => { },
    watch: () => { },
    watching: false
}

const TrackingContext = createContext(TrackingContextData);

export const TrackingServiceProvider = ({ children }) => {

    const GPS_MESSAGE = 'Sem permissão de uso do GPS!';

    const [permission, setPermission] = useState({
        has: null,
        message: null,
    });

    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [watching, setWatching] = useState(false);

    const [unsubscribe, setUnsubscribe] = useState({
        'watchId': null
    });

    useEffect(() => {
        return () => {
            stopTracking();
            unsubscribeGeolocation();
        }
    }, [unsubscribe])

    useEffect(() => {
        if (isTracking) 
            setTracking(previous => [...previous, location]);
            
    }, [location])

    const watch = async () => {
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
            setWatching(true);
            watchPosition();
        }

    }

    const watchPosition = () => {
        let watchId = Geolocation.watchPosition(
            position => {
                let location = position.coords;
                location['timestamp'] = position.timestamp;
                setLocation({ ...location });
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
            setUnsubscribe({ 'watchId': watchId })
        }
    }

    const startTracking = () => {
        setTracking([]);
        setIsTracking(true);
        watch();
    }

    const stopTracking = async () => {
        setIsTracking(false);
        unsubscribeGeolocation();
    }

    const unsubscribeGeolocation = () => {
        if (unsubscribe && unsubscribe.watchId !== null) {
            setWatching(false);
            Geolocation.clearWatch(unsubscribe.watchId);
            setUnsubscribe({
                'watchId': null
            });

            return true;
        }

        return false;
    }

    return (
        <TrackingContext.Provider
            value={
                { 
                    location, 
                    permission, 
                    tracking, 
                    isTracking, 
                    startTracking, 
                    stopTracking, 
                    watch, 
                    watching 
                }
            }
        >
            {children}
        </TrackingContext.Provider>
    );
}

export function useTracking() {
    return useContext(TrackingContext);
}