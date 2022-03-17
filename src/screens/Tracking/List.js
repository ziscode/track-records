import React, { useState, useEffect } from 'react';
import { FlatList, Alert, View, SafeAreaView } from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import AppIconButton from '../../components/AppIconButton';
import AppCircleButton from '../../components/AppCircleButton';
import { DatabaseConnection } from '../../database/database-connection';
import moment from 'moment';
import TrackingModel from '../../models/Tracking';
import { Styles } from '../../components/Styles';
import AlertAsync from "react-native-alert-async";
import Icon from 'react-native-vector-icons/FontAwesome';

const db = DatabaseConnection.getConnection();

const TrackingList = ({ navigation }) => {
    let [flatListItems, setFlatListItems] = useState([]);
    let unsubscribeFocus = null;

    const { list, find, logicalRemove } = TrackingModel();


    useEffect(() => {
        updateList();

        unsubscribeFocus = navigation.addListener('focus', () => {
            updateList();
        });

        return () => {
            unsubscribeFocus && unsubscribeFocus();
        }
    }, [navigation]);

    const updateList = async () => {
        let l = await list();
        setFlatListItems(l);
    }

    const editTracking = async (id) => {
        let model = await find(id);

        if (model) {
            navigation.navigate('TrackingForm', { data: model });
        }
    }

    const requestRemovePermission = (id) => {
        Alert.alert(
            'Alerta!',
            `Tem certeza que deseja remover o monitoramento (ID: ${id})?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => { removeTracking(id) }
                }
            ],
            { cancelable: true }
        );
    }

    const removeTracking = async (id) => {
        let res = await logicalRemove(id);

        if (res) {
            updateList();

            await AlertAsync(
                'Sucesso',
                'O registro foi removido com sucesso!',
                [
                    {
                        text: 'OK'
                    }
                ],
                { cancelable: true }
            );
        }
    }

    let listItemView = (item) => {
        return (

            <Card containerStyle={Styles.card}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={[Styles.notes, { fontSize: 24 }]}>Código: {item.id}</Text>
                        {(item.postErrors || item.formErrors) && <Icon name={'warning'} size={20} color={'#FEDA15'} style={{ paddingLeft: 10, paddingTop:7 }} />}
                    </View>


                    <View style={{ flexDirection: "row"}}>
                        {
                            item.status == 'paused' &&

                            <AppCircleButton
                                iconName="play"
                                style={{ backgroundColor: '#05445E', maxWidth: 37, maxHeight: 37 }}
                                iconSize={16}
                                customClick={() => editTracking(item.id)}
                            />
                        }

                        {
                            item.status == 'finished' &&

                            <AppIconButton
                                iconName={"pencil"}
                                style={{
                                    marginLeft: 10,
                                    minWidth: 38,
                                    backgroundColor: '#05445E'
                                }}
                                customClick={() => editTracking(item.id)}
                            />
                        }

                        <AppIconButton
                            iconName={"trash"}
                            color="danger"
                            style={{
                                marginLeft: 10,
                                minWidth: 38,
                            }}
                            customClick={() => requestRemovePermission(item.id)}
                        />

                    </View>
                </View>

                <Divider style={{ backgroundColor: '#dfe6e9', marginVertical: 10 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Praia</Text>
                    <Text style={Styles.notes}>{item.beach && item.beach.name}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Data início</Text>
                    <Text style={Styles.notes}>{moment(item.startDate).format("DD/MM/YYYY HH:mm")}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Data término</Text>
                    <Text style={Styles.notes}>{item.endDate && moment(item.endDate).format("DD/MM/YYYY HH:mm")}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={Styles.notes}>Situação</Text>
                    <Text style={Styles.notes}>
                        {
                            item.status === 'finished' ? 'Finalizado' :
                                (item.status === 'paused' ? 'Pausado' : item.status)
                        }
                    </Text>
                </View>


            </Card>

        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1 }}>

                    <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", marginHorizontal: 20, marginVertical: 10 }}>
                        <AppIconButton
                            iconName={"plus"}
                            iconSize={30}
                            style={{
                                minWidth: 50,
                            }}
                            customClick={() => navigation.navigate('TrackingForm')}
                        />
                    </View>

                    <Divider style={{ marginHorizontal: 20, backgroundColor: '#000000' }}></Divider>

                    <FlatList
                        style={{ marginTop: 10 }}
                        data={flatListItems}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => listItemView(item)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};


export default TrackingList;