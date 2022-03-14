import React from 'react';
import PropTypes from 'prop-types';
import { Colors, ButtonStyle } from './Styles';
import {Button,  Icon} from 'react-native-elements';

const AppIconButton = (props) => {
  const bg = {
    backgroundColor: (props.style.backgroundColor ? props.style.backgroundColor : Colors[props.color])
  };

  const style = {
    ...props.style, 
    ...bg,
    ...ButtonStyle.iconButton
  }

  return (
    <Button
      icon={<Icon
        type={props.iconType}
        name={props.iconName}
        size={props.iconSize}
        color={props.iconColor}
      />}
      buttonStyle={style}
      onPress={props.customClick}
      disabled={props.disabled}
      containerStyle={{borderRadius:0}}
    />

  );
};

AppIconButton.propTypes = {
  iconColor: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  iconName: PropTypes.string,
  iconType: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
};
AppIconButton.defaultProps = {
  iconColor: '#ffffff',
  size: 18,
  color: 'primary',
  style: {},
  iconName: '',
  iconType: 'font-awesome',
  iconSize: 20,
  iconColor: '#ffffff',  
};

export default AppIconButton;