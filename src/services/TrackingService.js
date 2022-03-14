import React, {
    useState,
    useEffect
} from 'react';

import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';

const TrackingService = (initialData = null) => {

    const STOP = 'stop';
    const TRACKING = 'tracking';
    const GPS_MESSAGE = 'Sem permissão de uso do GPS!';

    const [coordinates, setCoordinates] = useState([]);
    
    const [permission, setPermission] = useState({
        has:false,
        message: null,
    });
    
    const [location, setLocation] = useState(null);
    
    const [trackingData, setTrackingData] = useState({
        startDate: null,
        tracking: [],
        trackingInfo: [],
        status: null,                
    });

    const [unsubscribe, setUnsubscribe] = useState({
        'watchId': null
    });

    useEffect(() => {

        if (initialData && initialData.tracking.length > 0) {
            let loc = initialData.tracking[initialData.tracking.length - 1];

            setLocation({...{
                timestamp: loc.timestamp,
                latitude: loc.latitude,
                longitude: loc.longitude,            
                speed: loc.speed,
                altitude: loc.altitude,
                accuracy: loc.accuracy,
                heading: loc.heading,
                time: createTimeLabel(initialData.startDate, loc.timestamp),                
            }})

            setCoordinates([...initialData.tracking]);
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
            setPermission({...permission});
        
    }

    const startTracking = () => {
        
        if (permission.has && unsubscribe.watchId == null) {
            let watchId = Geolocation.watchPosition(
                position => {
                    let location = position.coords;
                    location['timestamp'] = position.timestamp;
                    updateLocation(TRACKING, location);
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

        } else {
            //TODO app without geo position
        }

    }

    const stopTracking = async () => {
        await unsubscribeGeolocation();

        if (trackingData.tracking.length > 0) {
            updateLocation(STOP, trackingData.tracking[trackingData.tracking.length - 1]);
        }
    }

    const unsubscribeGeolocation = async () => {
        if (unsubscribe && unsubscribe.watchId !== null) {
            Geolocation.clearWatch(unsubscribe.watchId);
            setUnsubscribe({
                'watchId': null
            });

            return true;
        }

        return false;
    }

    const updateLocation = (status, location) => {
        let coordinate = { latitude: location.latitude, longitude: location.longitude };       
        
        if (status === TRACKING && !trackingData.startDate) {
            trackingData.startDate = location.timestamp;
        }

        if (trackingData.status !== status) {
            trackingData.trackingInfo.push({
                date: location.timestamp,
                point: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                status: status
            });

            trackingData.status = status;
        }
                
        trackingData.tracking.push(location);

        setLocation({...{
            timestamp: location.timestamp,
            latitude: location.latitude,
            longitude: location.longitude,            
            speed: location.speed,
            altitude: location.altitude,
            accuracy: location.accuracy,
            heading: location.heading,
            time: createTimeLabel(trackingData.startDate, location.timestamp),
            
        }})

        setCoordinates(prev => [...prev, coordinate]);        
        setTrackingData({...trackingData});
    }

    const createTimeLabel = (startDate, endDate) => {
        if (!startDate || !endDate)
            return '00:00:00';

        let d1 = moment(new Date(endDate));
        let d2 = moment(new Date(startDate));
        let duration = moment.duration(d1.diff(moment(d2)));

        return (duration.hours() < 10 ? `0${duration.hours()}` : duration.hours()) + 
            ':' + (duration.minutes() < 10 ? `0${duration.minutes()}` : duration.minutes()) + 
            ':' + (duration.seconds() < 10 ? `0${duration.seconds()}` : duration.seconds());
    }

    const getTrackingData = () => {
        return trackingData;
    }

    return {
        coordinates,
        location,
        permission,
        startTracking,
        stopTracking,
        getTrackingData,
    }

}

export default TrackingService;