import { StyleSheet } from 'react-native';

export const Colors = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107'   
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
        borderRadius: 4,
    },
});

export const Styles = StyleSheet.create({
    card:{
		backgroundColor:'rgba(56, 172, 236, 1)',
		borderWidth:0,
		borderRadius:5
	},	
	notes: {
		fontSize: 18,
		color:'#fff',
		textTransform:'capitalize'
	}
});