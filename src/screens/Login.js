import React, { useState } from 'react';
import { Dimensions, View, ScrollView, Text } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import { Formik } from "formik";
import * as Yup from 'yup';
import { useAuth } from '../services/AuthService';
import { LoginStyle } from '../components/Styles';

const LoginScreen = ({ navigation }) => {

    const { Login, user } = useAuth();

    const [initialValues, setInitialValues] = useState({
        username: 'tiagozis@gmail.com',
        password: '123456789'
    });

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .email('Formato de email inválido')
            .required('Informe o email'),
        password: Yup.string()
            .required('Informe a senha')
    });

    return (


        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, actions) => {
                let result = await Login(values);

                if (result.message) {
                    actions.setErrors(result);
                }

                actions.setSubmitting(false);
            }}
        >

            {({ handleChange, handleBlur, handleSubmit, isSubmitting, values, errors }) => (
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={LoginStyle.container}
                >
                    <Text style={LoginStyle.signUpText}>Login</Text>

                    <View style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
                        {
                            errors.message &&
                            <Text style={LoginStyle.errorText}>{errors.message}</Text>
                        }

                        <FormInput
                            icon="envelope"
                            value={values.username}
                            onChangeText={handleChange('username')}
                            placeholder="Email"
                            keyboardType="email-address"
                            returnKeyType="next"
                            errorMessage={errors.username}
                        />

                        <FormInput
                            icon="lock"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            placeholder="Senha"
                            secureTextEntry
                            returnKeyType="next"
                            errorMessage={errors.password}
                        />

                    </View>

                    <Button
                        loading={isSubmitting}
                        title="Entrar"
                        containerStyle={{ flex: -1, marginLeft: 'auto', marginRight: 'auto' }}
                        buttonStyle={LoginStyle.signUpButton}
                        titleStyle={LoginStyle.signUpButtonText}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    />

                </ScrollView>

            )}

        </Formik>



    );
};

export const FormInput = (props) => {
    const { icon, refInput, ...otherProps } = props;

    return (
        <Input
            {...otherProps}
            ref={refInput}
            inputContainerStyle={LoginStyle.inputContainer}
            leftIcon={
                <Icon name={icon} type={'simple-line-icon'} color="#7384B4" size={22} />
            }
            inputStyle={LoginStyle.inputStyle}
            autoFocus={false}
            autoCapitalize="none"
            keyboardAppearance="dark"
            errorStyle={LoginStyle.errorInputStyle}
            autoCorrect={false}
            blurOnSubmit={false}
            placeholderTextColor="#7384B4"
        />
    );
};

export default LoginScreen;
