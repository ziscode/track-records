import 'react-native-gesture-handler';
import * as React from 'react';
import { AuthProvider } from './src/services/AuthService';
import Navigator from './src/components/Navigator';

const App = () => {
  return (
    <AuthProvider>
      <Navigator></Navigator>
    </AuthProvider>
  );
};

export default App;