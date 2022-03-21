import 'react-native-gesture-handler';
import * as React from 'react';
import { AuthProvider } from './src/services/AuthService';
import Navigator from './src/components/Navigator';
import { AppActivityIndicatorProvider } from './src/components/AppActivityIndicator';
import { TrackingServiceProvider } from './src/services/TrackingService';
const App = () => {
  return (
    <AuthProvider>

      <TrackingServiceProvider>
        <AppActivityIndicatorProvider>
          <Navigator></Navigator>
        </AppActivityIndicatorProvider>
      </TrackingServiceProvider>

    </AuthProvider>
  );
};

export default App;