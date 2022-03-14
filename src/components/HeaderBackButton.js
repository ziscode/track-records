import React from 'react';
import AppIconButton from './AppIconButton';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

const HeaderBackButton = (props) => {

  const navigation = useNavigation();

  return (

<Icon
          name='arrow-back'
          type='MaterialIcons'
          onPress={(e) => navigation.goBack()} 
          color='#ffffff'
          size={25}
          style={{
            marginRight:20
          }}
          containerStyle={{
            backgroundColor:'transparent',
            marginRight:30
          }}
          
          />


    

  );
};


export default HeaderBackButton;