import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/HomeScreen';
import TrackingList from '../screens/Tracking/List';
import TrackingForm from '../screens/Tracking/Form';
import { useAuth } from '../services/AuthService';
import AppIconButton from './AppIconButton';
import HeaderBackButton from './HeaderBackButton';

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const { signed } = useAuth();

  const headerOptions = {
    headerStyle: styles.headerStyle,
    headerTitleStyle: styles.headerTitleStyle,
    headerTintColor: '#fff',
    headerLeft: () => (
      <HeaderBackButton></HeaderBackButton>
    ),
    headerBackVisible: false,
  }

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
                ...headerOptions,
                ...{
                  title: 'Home',
                  headerLeft: null
                }
              }}
            />

            <Stack.Screen
              name="Tracking"
              component={TrackingList}
              options={{
                ...headerOptions,
                ...{
                  title: 'Monitoramento'
                }
              }}
            />

            <Stack.Screen
              name="TrackingForm"
              component={TrackingForm}
              options={{
                ...headerOptions,
                ...{
                  title: 'Monitoramento'
                }
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