import React from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight } from 'react-native';
import t from 'tcomb-form-native';
import firebase from 'react-native-firebase';
import { GoogleSignin } from 'react-native-google-signin';
import moment from 'moment';

const Form = t.form.Form;
moment().locale('ID');

const AccountEnum = t.enums({
    2420915660: 'BCA',
});


const IncomeRecord = t.struct({
    recordDate: t.Date,
    name: t.refinement(t.String, (s) => s.length >= 3),
    amount: t.refinement(t.Number, (n) => n >= 100),
    payment: AccountEnum,
});
const IncomeOptions = {
    fields: {
        recordDate: {
            error: 'Date is required',
            mode: 'date',
            config: {
                format: (date) => moment(date).format('LL')
            },
        },
        name: {
            error: 'Name length must be at least 3'
        },
        amount: {
            error: 'Amount must be greater than 100'
        },
        payment: {
            error: 'Payment method is required'
        }
    }
};

class IncomeScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            formValues: '',
            incomeAccountsEnum: '',
        }

        this.handlePress = this.handlePress.bind(this);
    }


    async getUser() {
        try {
            const user = await GoogleSignin.currentUserAsync();
            this.user = user;
            this.userCol = firebase.firestore().collection(user.id);
        } catch (err) {
            console.log(err);
        }
    }

    handlePress() {
        const formValues = this.state.formValues;
        if (formValues) {
            const timestamp = new Date().valueOf();
            this.userCol.add({
                [timestamp]: {
                    date: formValues.date,
                    name: formValues.name,
                    amount: formValues.amount,
                    payment: {
                        // bank: ,
                        // account: ,
                    }
                }
            })
        }
    }
    render() {
        return(
            <View style={styles.container}>
                <Text style={styles.title}>Add New Income</Text>
                <Form
                    ref="form"
                    type={IncomeRecord}
                    options={IncomeOptions}
                    onChange={this.handleFormChange}
                />
                <TouchableHighlight style={styles.button} onPress={this.handlePress} underlayColor='#99d9f4'>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableHighlight>
            </View>
        );
    }

    componentDidMount() {
        this.getUser();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'stretch',
        // justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#00d150',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center',
    },
    button: {
        height: 36,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
});

export default IncomeScreen;