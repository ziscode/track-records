import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors, ButtonStyle } from './Styles';

const AppIconButton = (props) => {

  const style = {
    ...props.style, 
    ...{
      backgroundColor: (props.style.backgroundColor ? props.style.backgroundColor : Colors[props.color])
    }
  }

  return (
    <TouchableOpacity
      style={{ ... ButtonStyle.iconButton, ...style}}
      onPress={props.customClick}>

      <Icon name={props.btnIcon} size={props.size} color={props.iconColor} />

    </TouchableOpacity>
  );
};

AppIconButton.propTypes = {
  iconColor: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string
};
AppIconButton.defaultProps = {
  iconColor: '#ffffff',
  size: 18,
  color: 'primary',
  style: {},
};

export default AppIconButton;