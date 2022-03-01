import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/HomeScreen';
import TrackingList from '../screens/Tracking/List';
import TrackingForm from '../screens/Tracking/Form';
import { useAuth } from '../services/AuthService';

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const { signed, user, Logout } = useAuth();
  
  return (    
      <NavigationContainer>
        <Stack.Navigator initialRouteName={signed === true ? "HomeScreen" : "LoginScreen"}>

          {signed !== true ?

            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{
                headerShown: false
              }}
            />
            :
            <>
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                  title: 'Registro de Usuários',
                  headerStyle: styles.headerStyle,                  
                  headerTitleStyle: styles.headerTitleStyle,
                  headerTintColor: '#fff',
                }}
              />

              <Stack.Screen
                name="Tracking"
                component={TrackingList}
                options={{
                  title: 'Tracking',
                  headerStyle: styles.headerStyle,
                  headerTitleStyle: styles.headerTitleStyle,
                  headerTintColor: '#fff',
                }}
              />

              <Stack.Screen
                name="TrackingForm"
                component={TrackingForm}
                options={{
                  title: 'Tracking',
                  headerStyle: styles.headerStyle,
                  headerTitleStyle: styles.headerTitleStyle,
                  headerTintColor: '#fff',
                }}
              />
            </>
          }
        </Stack.Navigator>
      </NavigationContainer>    
  );
};

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: '#05445E',
    },
    headerTitleStyle: {
        fontWeight: 'bold',
        color: '#fff'
    }
})

export default Navigator;