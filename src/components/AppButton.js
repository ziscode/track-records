import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const btnColors = {
  primary: '#0d6efd',
  success: '#198754',
  danger: '#dc3545',
  warning: '#ffc107'
}

const AppButton = (props) => {
  
  if (!props.visible) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={props.disabled ? 0.1 : 1}
      disabled={props.disabled}
      style={props.buttonStyle ? [props.buttonStyle, { backgroundColor: btnColors[props.backgroundColor] }] : [styles.button, { backgroundColor: btnColors[props.backgroundColor] }]}
      onPress={props.customClick}>

      <Text style={props.labelStyle ? props.labelStyle : styles.text}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    color: '#ffffff',
    padding: 10,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
    borderRadius: 5,
  },
  text: {
    color: '#ffffff',
  },
});


Mybutton.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  customClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  styles: PropTypes.object,
  labelStyle: PropTypes.object
};
Mybutton.defaultProps = {
  disabled: false,
  visible: true,
  customClick: (event) => {},
  backgroundColor: 'primary',
  buttonStyle: null,
  labelStyle: null
};

export default AppButton;