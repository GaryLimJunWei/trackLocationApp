import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import {AsyncStorage} from 'react-native';
import {navigate} from '../navigationRef';

const authReducer = (state, action) => {
    switch (action.type) {
        case 'add_error': 
            return { ...state,errorMessage: action.payload };
        case 'signin':
            return { errorMessage: '',token:action.payload};
        case 'clear_error_message':
            return { ...state,errorMessage:'' };
        case 'signout':
            return {token:null,errorMessage:''};
        default:
            return state;
    }
};

const tryLocalSignin = dispatch => async() => {
    const token = await AsyncStorage.getItem('token');
    if(token) {
        dispatch({type:'signin',payload:token});
        navigate('TrackList');
    } else {
        navigate('Signup');
    }
};

const clearErrorMessage = dispatch => () => {
    dispatch({ type:'clear_error_message' });
};

// make API request to sign up with that email and password
// IF we sign up, we have to modify our states,
// and say that we are authenticated.
// IF signing up Fails, we probably need to reflect an error message somewhere

const signup = dispatch => async ({email,password}) => {
        try {
            const response = await trackerApi.post('/signup',{email,password});
            await AsyncStorage.setItem('token',response.data.token);
            dispatch({type: 'signin',payload: response.data.token});
            navigate('TrackList');
        } catch(err) {
            console.log(err);
            dispatch({ type: 'add_error',payload: 'Something went wrong with sign up' 
            });
        }
    };


/**
 * Try to Sign in
 * Handle success by updating state
 * handle failure
 */

const signin = (dispatch) => async ({email,password}) => {
        try{
            const response = await trackerApi.post('/signin',{email,password});
            await AsyncStorage.setItem('token',response.data.token);
            dispatch({type:'signin',payload: response.data.token});
            navigate('TrackList');
        }catch(err) {
            dispatch({
                type: 'add_error',
                payload: 'Something went wrong with sign in'
            });
            console.log(err.message);
        }
    };


const signout = dispatch => async() => {
        await AsyncStorage.removeItem('token');
        dispatch({type:'signout'});
        navigate('loginFlow');
    };


export const {Provider,Context} = createDataContext(
    authReducer,
    {signin,signup,signout,clearErrorMessage,tryLocalSignin},
    { token: null, errorMessage: '' }
);