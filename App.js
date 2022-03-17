import 'react-native-gesture-handler';
import * as React from 'react';
import { AuthProvider } from './src/services/AuthService';
import Navigator from './src/components/Navigator';
import { AppActivityIndicatorProvider } from './src/components/AppActivityIndicator';

const App = () => {
  return (
    <AuthProvider>
      <AppActivityIndicatorProvider>
      <Navigator></Navigator>
      </AppActivityIndicatorProvider>      
    </AuthProvider>
  );
};

export default App;