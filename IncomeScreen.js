import React from 'react';
import { StyleSheet, View, TouchableHighlight } from 'react-native';
import t from 'tcomb-form-native';
import firebase from 'react-native-firebase';
import { GoogleSignin } from 'react-native-google-signin';
import moment from 'moment';
import {
    Container,
    Header,
    Content,
    Left,
    Right,
    Body,
    Title,
    Button,
    Text,
    Toast,
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';

import { addUserIncome } from './firebaseController';

const Form = t.form.Form;
moment().locale('ID');

const IncomeRecord = t.struct({
    description: t.refinement(t.String, (s) => s.length >= 3),
    amount: t.refinement(t.Number, (n) => n >= 100),
    recordDate: t.Date,
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
        description: {
            multiline: true,
            stylesheet: {
                ...Form.stylesheet,
                textbox: {
                    ...Form.stylesheet.textbox,
                    normal: {
                        ...Form.stylesheet.textbox.normal,
                        height: 150,
                        textAlignVertical: 'top',
                    },
                    error: {
                        ...Form.stylesheet.textbox.error,
                        height: 150,
                        textAlignVertical: 'top',
                    },
                },
            },
            error: 'Description must contain at least 3 characters',
        },
        amount: {
            error: 'Amount must be greater than 100',
        },
    }
};

class IncomeScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.navigation.state.params.user,
            formValues: '',
            incomeAccountsEnum: '',
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
    }

    // async getUser() {
    //     try {
    //         const user = await GoogleSignin.currentUserAsync();
    //         this.user = user;
    //         this.userCol = firebase.firestore().collection(user.id);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    handleFormChange(value) {
        this.setState({
            formValues: value,
        });
    }

    handleSave() {
        const value = this.refs.form.getValue();
        if (value) {
            // console.log(value);

            addUserIncome(firebase.database(), this.state.user.uid, {
                description: value.description,
                amount: value.amount,
                recordDate: value.recordDate,
            }).then(() => {
                Toast.show({
                    text: 'The income record has been added!',
                    duration: 3000,
                    type: 'success',
                });
                this.setState({ formValues: '' });
            });
        }
    }
    render() {
        return(
            <Container>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack(null)}>
                            <Icon style={{ color: '#fff', fontSize: 23 }} name='arrow-left' />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ fontSize: 23 }} >Add New Income</Title>
                    </Body>
                </Header>
                <Content contentContainerStyle={{ flex: 1, flexGrow: 1 }}>
                    <View style={styles.container}>
                        <Form
                            ref="form"
                            type={IncomeRecord}
                            value={this.state.formValues}
                            options={IncomeOptions}
                        />
                        <Button primary rounded block iconLeft onPress={this.handleSave}>
                            <Icon style={{ color: '#fff', fontSize: 23 }} name='save' />
                            <Text> Save </Text>
                        </Button>
                    </View>
                </Content>
            </Container>
        );
    }

    componentDidMount() {
        // this.getUser();
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
