import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, SafeAreaView, Alert } from 'react-native';
import ImageButton from '../components/ImageButton';
import PostDataService from '../services/PostDataService';
import { useAuth } from '../services/AuthService';
import { ActivityIndicatorStyle } from '../components/Styles';

const HomeScreen = ({ navigation }) => {

  const { postTracking } = PostDataService();
  const { Logout } = useAuth();
  const [loading, setLoading] = useState(false)


  const sendData = async () => {
    setLoading(true);
    const result = await postTracking();
    let message = 'Não há dados para enviar.';
    let title = 'Aviso';
    let messageList = [];

    if (result) {
      title = 'Sucesso';

      if (result.success > 0) {
        messageList.push(result.success + ' registros foram salvos com sucesso.');
      }

      if (result.errors > 0) {
        messageList.push(result.errors + ' registros apresentaram erros durante a validação.');
      }

      if (result.isUpdatePost === false || result.isUpdateErrors === false) {
        messageList.push('Ocorreu um erro durante a atualização dos dados no aplicativo mobile!');
      }

      message = messageList.join('\n\n');
    }

    if (result === null || result)
      Alert.alert(
        title,
        message
      );

    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'white' }} pointerEvents={loading ? 'none' : 'auto'}>
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
        {
          loading &&
          <ActivityIndicator
            animating={loading}
            vis
            color='#000'
            size="large"
            style={ActivityIndicatorStyle.container} />
        }


      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;