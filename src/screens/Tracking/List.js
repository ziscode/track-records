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

    const editTracking = async ( id ) => {
        let model = await find(id);

        if (model) {
            navigation.navigate('TrackingForm', {data:model});
        }
    }

    const requestRemovePermission = (id) => {
        Alert.alert(
            'Success',
            `Are you sure you want to remove the tracking (ID: ${id})!`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
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
                'Success',
                'Record was successfully removed!',
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

                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <Text style={[Styles.notes, {fontSize:22}]}>Tracking ID: {item.id}</Text>

                    <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                    {
                        item.status == 'paused' && 
                        <AppCircleButton
                            btnIcon="play"  
                            style={{backgroundColor: '#05445E', maxWidth:36, maxHeight:35}}                          
                            size={15}
                            customClick={() => editTracking(item.id)}
                        />
                    }                    

                    <AppIconButton                    
                        btnIcon={"trash"}
                        color="danger"
                        size={14}
                        style={{
                            marginLeft: 10,
                            minWidth: 38
                        }}   
                        customClick={() => requestRemovePermission(item.id)}
                    />     

                    </View>
				</View>                
				
				<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:10}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={Styles.notes}>Start date</Text>
					<Text style={Styles.notes}>{moment(item.startDate).format("YYYY-MM-DD HH:mm:ss")}</Text>
				</View>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={Styles.notes}>End date</Text>
					<Text style={Styles.notes}>{item.endDate && moment(item.endDate).format("YYYY-MM-DD HH:mm:ss")}</Text>
				</View>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={Styles.notes}>Status</Text>
					<Text style={Styles.notes}>{item.status}</Text>
				</View>
			</Card>
            
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1 }}>

                    <View style={{flexDirection: "row-reverse", flexWrap: "wrap", marginHorizontal: 20, marginVertical: 10}}>
                        <AppIconButton                    
                            btnIcon={"plus"}
                            size={25}
                            style={{
                                minWidth: 50,                                
                            }}
                            customClick={() => navigation.navigate('TrackingForm')}
                        />
                    </View>

                    <Divider style={{marginHorizontal:20, backgroundColor:'#000000'}}></Divider>
                    
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