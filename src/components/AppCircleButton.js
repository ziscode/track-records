import React from 'react';
import PropTypes from 'prop-types';
import { Colors, ButtonStyle } from './Styles';
import {Button,  Icon} from 'react-native-elements';

const AppCircleButton = (props) => {
  if (!props.visible) {
    return null;
  }

  const style = {
    ...props.style,
    ...{
      backgroundColor: (props.style.backgroundColor ? props.style.backgroundColor : Colors[props.color])
    }
  }

  return (
    <Button
      icon={<Icon
        type={props.iconType}
        name={props.iconName}
        size={props.iconSize}
        color={props.iconColor}
      />}
      buttonStyle={{ ...ButtonStyle.circleButton, ...style }}
      onPress={props.customClick}
      disabled={props.disabled}
    />
  );
};

AppCircleButton.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  customClick: PropTypes.func,
  style: PropTypes.object,
 
  iconName: PropTypes.string,
  iconType: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,

};
AppCircleButton.defaultProps = {
  disabled: false,
  visible: true,
  
  
  color: 'primary',
  style: {
    maxWidth: 36,
    maxHeight: 36,
  },
  customClick: (event) => { },

  iconName: '',
  iconType: 'font-awesome',
  iconSize: 20,
  iconColor: '#ffffff',  
  
};

export default AppCircleButton;