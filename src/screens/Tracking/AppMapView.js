import React, { useState, useEffect, useRef } from 'react';
import AppCircleButton from '../../components/AppCircleButton';
import { SvgXml } from "react-native-svg";
import * as geolib from 'geolib';
import moment from 'moment';
import { useTracking } from '../../services/TrackingService';

import { Colors } from '../../components/Styles';

import {
    View,    
    StyleSheet,    
} from 'react-native';

import {
    Text,    
    Button,    
} from 'react-native-elements';

import MapView, {
    Polyline,
    Marker,
    Geojson,
} from 'react-native-maps';


/// Zoom values for the MapView
const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;

const AppMapView = ({
    initialValues,
    showsUserLocation,
    isTracking,
    geometries,
    checkIntersections,
    handlePlay,
    handlePause,
    handleStop
}) => {

    const [tracking, setTracking] = useState([]);
    const [isRuning, setIsRuning] = useState(null);
    const [time, setTime] = useState(null);
    const [startLocation, setStartLocation] = useState();
    const [endLocation, setEndLocation] = useState();
    const [mapGeometries, setMapGeometries] = useState([]);
    const [followsUserLocation, setFollowUserLocation] = useState(true);
    const [mapScrollEnabled, setMapScrollEnabled] = useState(false);
    const [mapCenter, setMapCenter] = useState(null);
    const [trackingDuration, setTrackingDuration] = useState(0);

    const {
        permission,
        location,
        startTracking,
        stopTracking,
        watch
    } = useTracking();

    useEffect(() => {
        if (initialValues.startLocation)
            setStartLocation(initialValues.startLocation);

        if (initialValues.endLocation)
            setEndLocation(initialValues.endLocation)

        if (initialValues.tracking) {
            setTracking(initialValues.tracking);
        }

        if (initialValues.trackingLog && initialValues.trackingLog.length > 0) {
            let total = 0;

            initialValues.trackingLog.map((item) => {
                let d1 = moment(new Date(item.end));
                let d2 = moment(new Date(item.start));
                let duration = moment.duration(d1.diff(moment(d2)));
                total += duration.asMilliseconds();
            });
            
            setTrackingDuration(total);
        }

        if (showsUserLocation)
            watch();
    }, [])

    useEffect(() => {
        setMapGeometries(geometries);
    }, [geometries])

    useEffect(() => {
        checkGeometryIntersections(tracking);
    }, [mapGeometries, tracking])

    useEffect(() => {
        if (!location) return;

        if (isRuning) {
            if (isTracking)
                setTracking(previous =>
                    [
                        ...previous,
                        { latitude: location.latitude, longitude: location.longitude }
                    ]);

            checkGeometryIntersections([location]);

            if (!startLocation) setStartLocation(location);
            if (!time) setTime(location.timestamp);
        }

        setMapCenter({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    }, [location])

    const handlePlayButton = () => {
        if (isRuning) {
            stopTracking();
            handlePause(location);
        } else {
            startTracking();
            handlePlay(location);
        }

        setIsRuning(!isRuning);
    }

    const handleStopButton = () => {
        stopTracking();
        handleStop(location);
        setIsRuning(false);
    }

    const createTimeLabel = () => {
        let td = 0;

        if (time && location) {
            let d1 = moment(new Date(location.timestamp));
            let d2 = moment(new Date(time));
            td = d1.diff(moment(d2)) + trackingDuration;
        }

        let duration = moment.duration(td);

        return (duration.hours() < 10 ? `0${duration.hours()}` : duration.hours()) +
            ':' + (duration.minutes() < 10 ? `0${duration.minutes()}` : duration.minutes()) +
            ':' + (duration.seconds() < 10 ? `0${duration.seconds()}` : duration.seconds());

    }

    

    const checkGeometryIntersections = (locations) => {

        if (checkIntersections === false) return false;

        let update = false;

        mapGeometries.map((item, i) => {
            locations.map((location) => {
                if (geolib.isPointInPolygon({ latitude: location.latitude, longitude: location.longitude }, item.properties.poly) &&
                    item.properties.isIntersects === false) {

                    item.properties.isIntersects = true;
                    update = true;

                }
            })
        });

        if (update)
            setMapGeometries([...mapGeometries]);

        return update;
    }

    /// Map pan/drag handler.
    const onMapPanDrag = () => {
        setFollowUserLocation(false);
        setMapScrollEnabled(true);
    }

    /** TODO: ver onde colocar a mensagem de permissão do gps */
    /*
    
    {
              (permission.has === false) &&
              <Card containerStyle={[Styles.card, { backgroundColor: Colors.danger }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={Styles.notes}>{permission.message ? permission.message : 'APP WITHOUT LOCATION PERMISSION'}</Text>
                </View>
              </Card>
            }

    
    */


    return (
        <View style={{ flex: 1, flexDirection: "column" }}>

            <View style={styles.container}>

                <MapView
                    loadingEnabled
                    showsUserLocation={showsUserLocation}
                    region={followsUserLocation ? mapCenter : null}
                    followsUserLocation={followsUserLocation}
                    onPanDrag={onMapPanDrag}
                    scrollEnabled={mapScrollEnabled}
                    showsMyLocationButton={false}
                    showsPointsOfInterest={false}
                    showsScale={false}
                    showsTraffic={false}
                    style={styles.map}
                    toolbarEnabled={false}>

                    <Polyline
                        key="polyline"
                        coordinates={tracking}
                        geodesic={true}
                        strokeColor='rgba(41,146,196, 0.6)'
                        strokeWidth={4}
                        zIndex={0}
                    />

                    {
                        startLocation &&
                        <Marker
                            coordinate={
                                {
                                    latitude: startLocation.latitude,
                                    longitude: startLocation.longitude
                                }
                            }
                            pinColor="green" />
                    }

                    {
                        endLocation &&
                        <Marker
                            coordinate={
                                {
                                    latitude: endLocation.latitude,
                                    longitude: endLocation.longitude
                                }
                            } />
                    }

                    {
                        mapGeometries.length > 0 &&

                        mapGeometries.map((item, i) =>
                            <Geojson key={i}
                                geojson={item}
                                strokeColor={item.properties && item.properties.isIntersects === true ? "rgba(0,128,0,0.3)" : "rgba(255,0,0,0.3)"}
                                fillColor={item.properties && item.properties.isIntersects === true ? "rgba(0,128,0,0.2)" : "rgba(255,0,0,0.2)"}
                                strokeWidth={2}
                            />
                        )
                    }
                </MapView>


                <Button
                    type="clear"
                    onPress={() => { setFollowUserLocation(true) }}
                    containerStyle={{ width: 60, bottom: 10, right: 10 }}
                    icon={
                        <SvgXml width="45" height="45" xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0,0H24V24H0Z" data-name="Path 3737"/><path fill="#6e78aa" d="M1161.3,251.5h-.956a7.8,7.8,0,0,1-6.844,6.843v.957a.9.9,0,1,1-1.8,0v-.957a7.8,7.8,0,0,1-6.844-6.843h-.956a.9.9,0,1,1,0-1.8h.957a7.8,7.8,0,0,1,6.843-6.844V241.9a.9.9,0,1,1,1.8,0v.957a7.8,7.8,0,0,1,6.844,6.843h.956a.9.9,0,0,1,0,1.8Zm-4.5-1.8h1.725a6,6,0,0,0-5.025-5.027V246.4a.9.9,0,1,1-1.8,0v-1.725a6,6,0,0,0-5.027,5.025h1.727a.9.9,0,1,1,0,1.8h-1.725a6,6,0,0,0,5.026,5.027V254.8a.9.9,0,1,1,1.8,0v1.727a6,6,0,0,0,5.025-5.027H1156.8a.9.9,0,0,1,0-1.8Zm-4.2,1.8a.9.9,0,1,1,.9-.9A.9.9,0,0,1,1152.6,251.5Z" data-name="TARGET" transform="translate(-1140.6 -238.6)"/></svg>`} />
                    }
                />

            </View>

            {
                isTracking &&
                <View style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    paddingHorizontal: 1
                }}>
                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <SvgXml width="22" height="22" xml={`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="#ffffff"><path d="M16 32c8.822 0 16-7.178 16-16S24.822 0 16 0 0 7.178 0 16s7.178 16 16 16zm0-31c8.271 0 15 6.729 15 15s-6.729 15-15 15S1 24.271 1 16 7.729 1 16 1z"/><path d="M20.061 21.768a.498.498 0 0 0 .708 0 .5.5 0 0 0 0-.707L16 16.293V9.319a.5.5 0 0 0-1 0V16.5c0 .133.053.26.146.354l4.915 4.914z"/><circle cx="4" cy="16" r="1"/><circle cx="28" cy="16" r="1"/><circle cx="16" cy="4" r="1"/><circle cx="16" cy="28" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="24" cy="24" r="1"/><circle cx="25" cy="8" r="1"/><circle cx="8" cy="24" r="1"/></g></svg>`} />
                            <Text style={styles.infoText}>{`${location && time ? createTimeLabel() : '00:00:00'}`}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <SvgXml width="24" height="24" xml={`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" x="0" y="0" version="1.1" viewBox="0 0 52 52" xml:space="preserve"><path fill="#ffffff" d="M42.263 46.631a1 1 0 0 1-.707-1.707A21.855 21.855 0 0 0 48 29.368c0-5.876-2.289-11.4-6.444-15.556S31.876 7.368 26 7.368s-11.401 2.289-15.557 6.444S4 23.492 4 29.368a21.856 21.856 0 0 0 6.443 15.556 1 1 0 1 1-1.414 1.414A23.84 23.84 0 0 1 2 29.368a23.84 23.84 0 0 1 7.03-16.97c4.533-4.533 10.56-7.03 16.97-7.03s12.438 2.497 16.971 7.03A23.84 23.84 0 0 1 50 29.368c0 6.41-2.497 12.438-7.03 16.97a.997.997 0 0 1-.707.293z"/><path fill="#ffffff" d="M25.997 24.37c-1.71 0-3.23.87-4.13 2.18-.37.55-.64 1.17-.77 1.84-.07.32-.1.65-.1.98 0 2.75 2.25 5 5 5 2.76 0 5-2.25 5-5 0-2.76-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3 0-.42.08-.81.24-1.17a2.985 2.985 0 0 1 2.76-1.83c1.66 0 3 1.34 3 3 0 1.65-1.34 3-3 3z"/><path fill="#ffffff" d="M28.997 29.37c0 1.65-1.34 3-3 3-1.65 0-3-1.35-3-3 0-.42.08-.81.24-1.17a2.985 2.985 0 0 1 2.76-1.83c1.66 0 3 1.34 3 3z"/><path fill="#ffffff" d="M22.313 28.818c-.13 0-.26-.026-.387-.078L9.969 23.71a1 1 0 01.775-1.843l11.957 5.028a1 1 0 01-.388 1.922zM8 30.369H3a1 1 0 110-2h5a1 1 0 110 2zM13.272 17.64a.997.997 0 01-.707-.293l-3.536-3.535a1 1 0 111.414-1.414l3.536 3.535a1 1 0 01-.707 1.707zM26 12.368a1 1 0 01-1-1v-5a1 1 0 112 0v5a1 1 0 01-1 1zM38.729 17.64a1 1 0 01-.707-1.707l3.535-3.535a1 1 0 111.414 1.414l-3.535 3.535a.997.997 0 01-.707.293zM49 30.369h-5a1 1 0 110-2h5a1 1 0 110 2zM42.264 46.632a.997.997 0 01-.707-.293l-3.536-3.535a1 1 0 111.415-1.414l3.535 3.535a1 1 0 01-.707 1.707zM9.736 46.632a1 1 0 01-.707-1.707l3.536-3.535a1 1 0 111.414 1.414l-3.536 3.535a.997.997 0 01-.707.293z"/></svg>`} />
                            <Text style={styles.infoText}>{`${location && isRuning ? (location.speed * 3.6).toFixed(1) : '0.0'} km/h`}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <SvgXml width="35" height="35" xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#ffffff" d="M2.252,44.093a1,1,0,0,1-.641-1.768L15.019,31.146a1,1,0,0,1,1.1-.123l4.753,2.428,4.245-4.091a1,1,0,0,1,.694-.28H28.5l4.984-8.671a1,1,0,0,1,.772-.5,1.017,1.017,0,0,1,.852.34L44.5,31.1l3.95-3.179a1,1,0,0,1,1.378.118L62.5,42.432A1,1,0,1,1,61,43.754L48.962,30.083l-3.956,3.184a1,1,0,0,1-1.383-.124l-9.11-10.517L29.94,30.578a1,1,0,0,1-.867.5H26.209l-4.467,4.306a1,1,0,0,1-1.149.171l-4.8-2.453L2.892,43.861A1,1,0,0,1,2.252,44.093Z"/><path fill="#ffffff" d="M35.266 42.831a1 1 0 0 1-.463-1.887l9.072-4.73L48.2 28.228a1 1 0 1 1 1.758.953l-4.472 8.255a1 1 0 0 1-.417.41l-9.343 4.872A1 1 0 0 1 35.266 42.831zM17.837 43.347a1 1 0 0 1-1-1.1l.487-4.921-2.558-4.954a1 1 0 1 1 1.777-.918l2.694 5.217a1 1 0 0 1 .107.557l-.217 2.187 6.332-7.025a1 1 0 0 1 1.627.2l2.254 4.265 2.315-5.146 1.7-10.959a1 1 0 0 1 1.977.307l-1.72 11.092a.962.962 0 0 1-.076.257l-3.21 7.137a1 1 0 0 1-.88.589.961.961 0 0 1-.916-.532l-2.541-4.811L18.58 43.017A1 1 0 0 1 17.837 43.347z"/><path fill="#ffffff" d="M38.3,38.3a1,1,0,0,1-.622-1.784L43.758,31.7A1,1,0,1,1,45,33.271l-6.076,4.816A1,1,0,0,1,38.3,38.3Z"/></svg>`} />
                            <Text style={styles.infoText}>{`${location && isRuning ? location.altitude.toFixed(1) : '0.0'} m`}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <SvgXml width="28" height="28" xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0,0H24V24H0Z" data-name="Path 3737"/><path fill="#ffffff" d="M1161.3,251.5h-.956a7.8,7.8,0,0,1-6.844,6.843v.957a.9.9,0,1,1-1.8,0v-.957a7.8,7.8,0,0,1-6.844-6.843h-.956a.9.9,0,1,1,0-1.8h.957a7.8,7.8,0,0,1,6.843-6.844V241.9a.9.9,0,1,1,1.8,0v.957a7.8,7.8,0,0,1,6.844,6.843h.956a.9.9,0,0,1,0,1.8Zm-4.5-1.8h1.725a6,6,0,0,0-5.025-5.027V246.4a.9.9,0,1,1-1.8,0v-1.725a6,6,0,0,0-5.027,5.025h1.727a.9.9,0,1,1,0,1.8h-1.725a6,6,0,0,0,5.026,5.027V254.8a.9.9,0,1,1,1.8,0v1.727a6,6,0,0,0,5.025-5.027H1156.8a.9.9,0,0,1,0-1.8Zm-4.2,1.8a.9.9,0,1,1,.9-.9A.9.9,0,0,1,1152.6,251.5Z" data-name="TARGET" transform="translate(-1140.6 -238.6)"/></svg>`} />
                            <Text style={styles.infoText}>{`${location && isRuning ? location.accuracy.toFixed(1) : '0.0'} m`}</Text>
                        </View>
                    </View>
                </View>
            }

            {isTracking &&

                <View style={{
                    justifyContent: 'center',
                    flexDirection: "row",
                    marginVertical: 10
                }}>

                    <AppCircleButton
                        customClick={handlePlayButton}
                        iconName={isRuning ? "pause" : "play"}
                        iconSize={35}
                        style={{
                            width: 70,
                            height: 70,
                        }}
                    />

                    <AppCircleButton
                        visible={isRuning !== null || trackingDuration > 0}
                        color="danger"
                        customClick={handleStopButton}
                        iconName="stop"
                        iconSize={35}
                        style={{
                            width: 70,
                            height: 70,
                            marginHorizontal: 15
                        }}
                    />

                </View>
            }



        </View>
    );
}

export default AppMapView;

const styles = StyleSheet.create({
    container: {
        flex: 1, //the container will fill the whole screen.
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        marginTop: 20
    },
    infoContainer: {
        width: '50%',
        borderWidth: 1,
        backgroundColor: Colors.primary,
        borderColor: 'rgba(110, 120, 170, 1)',
    },

    infoText: {
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'UbuntuLight',
        marginVertical: 2,
        marginHorizontal: 10
    },

    infoItem: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
});