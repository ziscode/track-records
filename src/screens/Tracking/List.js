import React, { useState, useEffect } from 'react';
import { FlatList, View, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Card, Divider } from 'react-native-elements';
import Mybutton from '../../components/Mybutton';
import { DatabaseConnection } from '../../database/database-connection';
import moment from 'moment';


const db = DatabaseConnection.getConnection();

const TrackingList = ({ navigation }) => {
    let [flatListItems, setFlatListItems] = useState([]);
    let unsubscribeFocus = null;

    useEffect(() => {

        updateList();

        unsubscribeFocus = navigation.addListener('focus', () => {
            updateList();
        });

        return () => {
            unsubscribeFocus && unsubscribeFocus();
        }
    }, [navigation]);

    const updateList = () => {
        console.log('UPDATE LIST')

        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM tracking',
                [],
                (tx, results) => {
                    
                    var temp = [];

                    for (let i = 0; i < results.rows.length; ++i) {
                        let item = results.rows.item(i);

                        let data = JSON.parse(item.data);
                        data['id'] = item.id;

                        temp.push(data);
                    }

                    setFlatListItems(temp);
                }
            );
        });
    }

    const deleteAllRows = () => {
        console.log('DELETE ALL ROWS')
        db.transaction(function (tx) {
            tx.executeSql(
                'DELETE FROM tracking',
                [],
                (tx, results) => {

                    if (results.rowsAffected > 0) {
                        setFlatListItems([]);
                        console.log('Rows deleted', results.rowsAffected);
                    } else console.log('Delete tracking error !!!');
                }
            );
        });
    }

    let listItemView = (item) => {
        return (
            <Card containerStyle={styles.card}>
				<Text style={styles.notes}>Tracking ID: {item.id}</Text>
				
				<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:20}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>Start date</Text>
					<Text style={styles.notes}>{moment(item.startDate).format("YYYY-MM-DD HH:mm:ss")}</Text>
				</View>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>End date</Text>
					<Text style={styles.notes}>{item.endDate && moment(item.endDate).format("YYYY-MM-DD HH:mm:ss")}</Text>
				</View>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>Status</Text>
					<Text style={styles.notes}>{item.status}</Text>
				</View>
			</Card>



            
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1 }}>
                    <Mybutton title="New" customClick={() => navigation.navigate('TrackingForm')} />
                    <Mybutton title="Delte all" backgroundColor='danger' customClick={deleteAllRows} />

                    <FlatList
                        style={{ marginTop: 30 }}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        data={flatListItems}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => listItemView(item)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    textheader: {
        color: '#111',
        fontSize: 12,
        fontWeight: '700',

    },
    textbottom: {
        color: '#111',
        fontSize: 18,
    },

    card:{
		backgroundColor:'rgba(56, 172, 236, 1)',
		borderWidth:0,
		borderRadius:20
	},
	time:{
		fontSize:38,
		color:'#fff'
	},
	notes: {
		fontSize: 18,
		color:'#fff',
		textTransform:'capitalize'
	}
});


export default TrackingList;


{/*<View
                key={item.id}
                style={{ backgroundColor: '#EEE', marginTop: 20, padding: 30, borderRadius: 10 }}>

                <Text style={styles.textheader}>Código</Text>
                <Text style={styles.textbottom}>{item.id}</Text>

                <Text style={styles.textheader}>Data início</Text>
                <Text style={styles.textbottom}>{item.startDate}</Text>

                <Text style={styles.textheader}>Data término</Text>
                <Text style={styles.textbottom}>{item.endDate}</Text>

                <Text style={styles.textheader}>Situação</Text>
                <Text style={styles.textbottom}>{item.status}</Text>

            </View>*/}