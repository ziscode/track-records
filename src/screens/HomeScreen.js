import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView } from 'react-native';
import MyImageButton from '../components/MyImageButton';
import { DatabaseConnection } from '../database/database-connection';
const db = DatabaseConnection.getConnection();


const HomeScreen = ({ navigation }) => {
  
  useEffect(() => {
    
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            console.log("AA")
            txn.executeSql('DROP TABLE IF EXISTS table_user', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name VARCHAR(20), user_contact INT(10), user_address VARCHAR(255))',
              []
            );
          }
        }
      );


      

    });

  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>

          <MyImageButton
              title="Tracking"
              btnColor='#2992C4'
              btnIcon="map-marker"
              customClick={() => navigation.navigate('Tracking')}
          />
           
          </View>
        </View>


      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;