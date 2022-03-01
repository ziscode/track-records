import React from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import ImageButton from '../components/ImageButton';
import PostDataService from '../services/PostDataService';
import { useAuth } from '../services/AuthService';

const HomeScreen = ({ navigation }) => {
  
  const { postTracking } = PostDataService();
  const { Logout } = useAuth();

  const sendData = async () => {
    const result = await postTracking();
    let message = 'Não há dados para enviar.';
    let messageList = ['AAAAAAAAAAAA'];

    if (result) {
      if (result.success > 0) {
        messageList.push(result.success+' registros foram salvos com sucesso.');
      }

      if (result.errors > 0) {
        messageList.push(result.success+' registros apresentaram erros durante a validação.');
      }

      if (result.isUpdatePost === false || result.isUpdateErrors === false) {
        messageList.push('Ocorreu um erro durante a atualização dos dados no aplicativo mobile!');
      }

      message = messageList.join('\n\n');
    }

    Alert.alert(
      'Success',
      message
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>

          <ImageButton
              title="Monitoramentos"
              btnColor='#2992C4'
              btnIcon="map-marker"
              customClick={() => navigation.navigate('Tracking')}
          />

          <ImageButton
              title="Enviar Dados"
              btnColor='#2992C4'
              btnIcon="rocket"
              customClick={sendData}
          />

          <ImageButton
              title="Sair"
              btnColor='#2992C4'
              btnIcon="sign-out"
              customClick={Logout}
          />
           
          </View>
        </View>


      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;