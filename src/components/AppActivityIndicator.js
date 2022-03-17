import React, { createContext, useState, useContext } from 'react';
import { ActivityIndicatorStyle } from './Styles';
import { ActivityIndicator } from 'react-native';

const AppActivityIndicatorData = {
  visible: true,
  show: () => { console.log('A') },
  hide: () => { },
}

const AppActivityIndicatorContext = createContext(AppActivityIndicatorData);

export const AppActivityIndicatorProvider = ({ children }) => {

  const [visible, setVisible] = useState(false);

  function show() {
    setVisible(true);
  }

  function hide() {
    setVisible(false)
  }

  return (
    <AppActivityIndicatorContext.Provider
      value={{ visible, show, hide }}
    >
      <>
        {children}
        {visible &&
          <ActivityIndicator
            animating={visible}
            color='#000'
            size="large"
            style={ActivityIndicatorStyle.container} />
        }
      </>
    </AppActivityIndicatorContext.Provider>

  );
};

export function useIndicator() {
  const context = useContext(AppActivityIndicatorContext);

  return context;
}