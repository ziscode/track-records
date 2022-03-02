import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const Colors = {
    primary: '#2992C4',
    success: '#198754',
    danger: '#EB1E2B',
    warning: '#FEDA15'   
}

export const ButtonStyle = StyleSheet.create({
    circleButton: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      borderRadius: 100,
    },

    iconButton: {
        alignItems: 'center',
        color: '#ffffff',
        padding: 10,
        borderRadius: 0,
    },
});

export const Styles = StyleSheet.create({
    card:{
		backgroundColor:'#189AB4',
		borderWidth:0,
		borderRadius:0
	},	
	notes: {
		fontSize: 18,
		color:'#fff',
		textTransform:'capitalize'
	},
    formErrorHeader: {
        color: '#fff', 
        textAlign: 'center', 
        paddingBottom: 10, 
        fontFamily: 'UbuntuBold',
        fontSize: 22
    },
    formErrors: {
        color: '#fff', 
        paddingBottom: 5, 
        fontFamily: 'UbuntuBold',
        fontSize: 18,
    }
});

export const LoginStyle = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 20,
        paddingTop: 20,
        backgroundColor: '#05445E',
        width: '100%',
        height: SCREEN_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    errorText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'UbuntuLight',
        textAlign: 'center',
        backgroundColor: '#DB1F48',
        width: '100%',
        paddingVertical: 10,
        marginBottom: 10
    },

    signUpText: {
        color: 'white',
        fontSize: 28,
        fontFamily: 'UbuntuLight',
        textAlign: 'center',
    },

    inputContainer: {
        paddingLeft: 8,
        borderColor: 'rgba(110, 120, 170, 1)',
        height: 45,
        marginVertical: 10,
    },
    inputStyle: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
        fontFamily: 'UbuntuLight',
        fontSize: 18,
    },
    errorInputStyle: {
        marginTop: 0,
        textAlign: 'center',
        color: '#F44336',
        fontSize: 16,
    },
    signUpButtonText: {
        fontFamily: 'UbuntuBold',
        fontSize: 16,
    },
    signUpButton: {
        width: 200,
        borderRadius: Math.round(45 / 2),
        height: 45,
        backgroundColor: 'rgba(110, 120, 170, 1)',
    }
});

export const ActivityIndicatorStyle = StyleSheet.create ({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.5,
      backgroundColor: 'black',
    }
  })