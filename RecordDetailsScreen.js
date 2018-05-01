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
moment().locale('ID');

export default class RecordDetailsScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.navigation.state.params.user,
            records: this.props.navigation.state.params.records,
        }

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.deleteRow = this.deleteRow.bind(this);
    }

    deleteRow(secId, rowId, rowMap) {
        rowMap[`${secId}${rowId}`].props.closeRow();
        const newData = [...this.state.records];
        // do delete operations
        newData.splice(rowId, 1);
        this.setState({ records: newData });
    }

    render() {
        const items = this.state.records;
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
                                <ListItem>
                                    <Body>
                                        <Text>Rp. {item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                                        <Text> { moment(new Date(item.recordDate)).format('LL') } </Text>
                                        <Text note > {item.description} </Text>
                                    </Body>
                                </ListItem>
                            }
                            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                <Button full danger onPress={() => this.deleteRow(secId, rowId, rowMap) }>
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
