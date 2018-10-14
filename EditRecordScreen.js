import React from 'react';
import { 
    StyleSheet, 
    View, 
    TouchableHighlight, 
    Image,
    ToastAndroid
} from 'react-native';
import {
    Container,
    Header,
    Left,
    Title,
    Body,
    Content,
    Button,
    Text,
    Toast,
    Icon,
} from 'native-base';
import PhotoUpload from 'react-native-photo-upload';
import t from 'tcomb-form-native';
import firebase from 'react-native-firebase';
import moment from 'moment';


import { updateUserExpense, updateUserIncome } from './firebaseController';

const Form = t.form.Form;
moment().locale('ID');

const ExpenseType = t.enums({
    CREDIT: 'Credit',
    CASH: 'Cash',
});

const ExpenseRecord = t.struct({
    description: t.refinement(t.String, (s) => s.length >= 3),
    amount: t.refinement(t.Number, (n) => n >= 100),
    type: t.refinement(ExpenseType, (t) => t === 'CREDIT' || t === 'CASH'),
    recordDate: t.Date,
});
const ExpenseOptions = {
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
            error: 'Total must be greater than 100',
            config: {
                format: (value) => value.toLocaleString()
            }
        },
        type: {
            error: 'Please pick one of the available types',
        },
    }
};

class EditRecordScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            formValues: this.props.navigation.state.params.oldRecord,
            photos: [],
        };

        this.user = this.props.navigation.state.params.user;
        this.recordId = this.props.navigation.state.params.recordId;
        this.oldRecord = this.props.navigation.state.params.oldRecord;
        this.type = this.props.navigation.state.params.type;

        console.log(this.oldRecord);
        /*
        {
            RECORDID1: {
                amount : AMOUNT,
                description: DESCRIPTION,
                recordDate: RECORDDATE,
            },
            RECORDID2: {
                ...
            }
        }
        */

        this.handleSave = this.handleSave.bind(this);
        this.handleAddPhoto = this.handleAddPhoto.bind(this);
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


    handleSave() {
        const value = this.refs.form.getValue();
        if (value) {

            updateUserExpense(firebase.database(), this.user.uid, this.recordId, value)
                .then(() => {
                    
                });

            addUserExpense(firebase.database(), this.state.user.uid, {
                description: value.description,
                amount: value.amount,
                recordDate: new Date(value.recordDate).getTime(),
                type: value.type,
            }).then(() => {
                this.setState({
                    formValues: '',
                });
                ToastAndroid.show('The expense record has been addded!', ToastAndroid.LONG);
                // Toast.show({
                //     text: 'The expense record has been added!',
                //     duration: 2000,
                //     type: 'success',
                // });
            });
        }
    }

    handleAddPhoto() {
        
    }

    render() {
        return(
            <Container>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack(null)}>
                            <Icon style={{ color: '#fff', fontSize: 23 }} name='md-arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ fontSize: 23 }}>Add New Expense</Title>
                    </Body>
                </Header>
                <Content contentContainerStyle={{ flex: 1, flexGrow: 1 }}>
                    <View style={styles.container}>
                        <Form
                            ref="form"
                            type={ExpenseRecord}
                            value={this.state.formValues}
                            options={ExpenseOptions}
                        />
                        <PhotoUpload>
                            <Image
                                source={require('./static/upload_icon.png')}
                            />
                        </PhotoUpload>
                        <Button primary rounded block iconLeft onPress={this.handleSave}>
                            <Icon style={{ color: '#fff', fontSize: 23 }} name='md-document' />
                            <Text> Save </Text>
                        </Button>
                    </View>
                </Content>
            </Container>
        );
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
        color: '#d10007',
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

export default EditRecordScreen;
