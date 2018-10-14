import React from 'react';
import { ListView } from 'react-native';
import {
    Container,
    Header,
    Content,
    List,
    ListItem,
    H3,
    Text,
    Icon,
    Button,
    Title,
    Left,
    Body,
} from 'native-base';
import moment from 'moment';
import firebase from 'react-native-firebase';
moment().locale('ID');

export default class RecordDetailsScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
        }

        this.user = this.props.navigation.state.params.user;
        this.records = this.props.navigation.state.params.records;
        this.deleteHanlder = this.props.navigation.state.params.deleteHandler;
        this.type = this.props.navigation.state.params.type;

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.deleteRow = this.deleteRow.bind(this);
        this.handleNavigate = this.handleNavigate.bind(this);
    }

    deleteRow(data) {
        this.deleteHandler(data);
    }

    handleNavigate(screenName, data) {
        if (this.type === 'INCOME' || this.type === 'EXPENSE')
            this.props.navigation.navigate(screenName, data);
    }

    render() {
        const unsortedItems = Object.entries(this.records);
        const items = unsortedItems.sort((a, b) => {
            // descending, b - a
            return b[1].recordDate - a[1].recordDate;
        });
        console.log(items);

        return (
            <Container>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack(null)}>
                            <Icon style={{ color: '#fff', fontSize: 23 }} name='md-arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ fontSize: 23 }} >Records Details</Title>
                    </Body>
                </Header>
                <Content>
                    { 
                        (items && 
                        <List 
                            dataSource={this.ds.cloneWithRows(items)}
                            renderRow={(item) =>
                                <ListItem onPress={() => this.handleNavigate('EditRecord', {
                                                                                            user: this.user,
                                                                                            recordId: item[0],
                                                                                            oldRecord: item[1],
                                                                                            type: this.type,
                                                                                        }
                                )}>
                                    <Body>
                                        <Text>Rp. {item[1].amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                                        <Text> { moment(new Date(item[1].recordDate)).format('LL') } </Text>
                                        <Text note > {item[1].description} </Text>
                                    </Body>
                                </ListItem>
                            }
                            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                <Button full danger onPress={() => this.deleteRow(data) }>
                                    <Icon active name='trash' />
                                </Button>
                            }
                            rightOpenValue={-75}
                            disableRightSwipe={true}
                        >
                        </List>) ||
                        <Text>You don't have any records yet</Text>
                    }
                </Content>
            </Container>
        );
    }
}
