import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors, ButtonStyle } from './Styles';

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
    <TouchableOpacity
      activeOpacity={props.disabled ? 0.1 : 1}
      disabled={props.disabled}

      style={{ ... ButtonStyle.circleButton, ...style}}
      onPress={props.customClick}>

      <Icon name={props.btnIcon} size={props.size} color={props.iconColor} />

    </TouchableOpacity>
  );
};

AppCircleButton.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  iconColor: PropTypes.string,
  size: PropTypes.number,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  customClick: PropTypes.func,
  style: PropTypes.object
};
AppCircleButton.defaultProps = {
  disabled: false,
  visible: true,
  iconColor: '#ffffff',
  size: 20,
  color: 'primary',  
  style: {
    maxWidth: 36,
    maxHeight: 36,
  },
  customClick: (event) => {},
};

export default AppCircleButton;