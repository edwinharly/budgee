import React from 'react';
import { 
    StyleSheet, 
    View, 
    TouchableHighlight, 
    KeyboardAvoidingView,
    ScrollView,
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
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import t from 'tcomb-form-native';
import moment from 'moment';

const Form = t.form.Form;
moment().locale('ID');

const BankEnum = t.enums({
    1234: 'BNI',
    2345: 'BCA',
    CASH: 'CASH',
})

const ExpenseRecord = t.struct({
    recordDate: t.Date,
    retailer: t.refinement(t.String, (s) => s.length >= 3),
    total: t.refinement(t.Number, (n) => n >= 100),
    payment: BankEnum,
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
        retailer: {
            error: 'Retailer length must be at least 3'
        },
        total: {
            error: 'Total must be greater than 100'
        },
        payment: {
            error: 'Payment method is required'
        }
    }
};

class ExpenseScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            photos: [],
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleAddPhoto = this.handleAddPhoto.bind(this);
    }

    handleSave() {
        const value = this.refs.form.getValue();
        if (value)
            console.log(value);
    }

    handleAddPhoto() {
        
    }

    render() {
        return(
            <Container>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack(null)}>
                            <Icon style={{ color: '#fff' }} name='arrow-left' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Add New Expense</Title>
                    </Body>
                </Header>
                <Content>
                    <View style={styles.container}>
                        <KeyboardAvoidingView behavior='padding'>
                            <Form
                                ref="form"
                                type={ExpenseRecord}
                                options={ExpenseOptions}
                            />
                            <Button success rounded block iconLeft onPress={this.handleSave}>
                                <Icon style={{ color: '#fff', fontSize: 23 }} name='save' />
                                <Text> Save </Text>
                            </Button>
                        </KeyboardAvoidingView>
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

export default ExpenseScreen;