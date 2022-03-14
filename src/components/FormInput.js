import React from 'react';
import { Text, Input } from 'react-native-elements';

const FormInput = (props) => {
    const { icon, refInput, ...otherProps } = props;

    return (
        <>

            {!otherProps.value ? null :
                <Text style={{
                    color: '#7384B4',
                    fontSize: 16,
                    fontFamily: 'UbuntuLight',
                    marginHorizontal: 10,
                    paddingLeft: 5,
                }} >{otherProps.placeholder}</Text>
            }

            <Input
                {...otherProps}
                ref={refInput}
                inputContainerStyle={
                    {
                        borderColor: 'rgba(110, 120, 170, 1)',
                        height: otherProps.multiline ? undefined : 40,
                    }
                }
                inputStyle={
                    {
                        paddingLeft: 10,
                        borderColor: 'rgba(110, 120, 170, 1)',
                        height: otherProps.multiline ? undefined : 40,
                        marginVertical: otherProps.multiline ? undefined : 10,
                        fontSize: 18,
                    }
                }
                autoFocus={false}
                autoCapitalize="none"
                keyboardAppearance="dark"
                errorStyle={
                    {
                        color: '#DB1F48',
                        fontSize: 14,
                        fontFamily: 'UbuntuLight',
                        width: '100%',
                    }
                }
                autoCorrect={false}
                blurOnSubmit={false}
                placeholderTextColor="#7384B4"
            />

        </>
    );
};

export default FormInput;