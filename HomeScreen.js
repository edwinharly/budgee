import React from 'react';
import { 
    StyleSheet, 
    View, 
    DatePickerAndroid,
    AsyncStorage,
    ToastAndroid,
} from 'react-native';
import firebase from 'react-native-firebase';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import { 
  Container, 
  Header, 
  Footer, 
  Content, 
  Button, 
  Fab, 
  Title, 
  Text,
  Left,
  Body,
  Right,
  H3,
  H2,
  H1,
  Card,
  CardItem,
  Toast,
  Icon,
} from 'native-base';
import {
    Col,
    Row,
    Grid,
} from 'react-native-easy-grid';
import t from 'tcomb-form-native';
import moment from 'moment';
import { getTotalIncome, getTotalExpense, deleteExpenseRecord, deleteIncomeRecord } from './firebaseController';

moment().locale('ID');

const Form = t.form.Form;

const DateFilterForm = t.struct({
    startDate: t.Date,
    endDate: t.Date,
});
const dateFormDefaultValues = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
};
const DateFilterFormOptions = {
    fields: {
        startDate: {
            error: 'Date is required',
            mode: 'date',
            config: {
                format: (date) => moment(date).format('LL')
            },
            blurOnSubmit: true,
        },
        endDate: {
            error: 'Date is required',
            mode: 'date',
            config: {
                format: (date) => moment(date).format('LL')
            },
            blurOnSubmit: true,
        },
    }
};

// const storedStartDate = await AsyncStorage.getItem('startDate');
// const storedEndDate = await AsyncStorage.getItem('endDate');


class HomeScreen extends React.Component {

  // hide react-navigation header
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      fabActive: false,
      totalIncome: 0,
      totalExpense: 0,
      currentIncome: '',
      currentExpense: '',
    };

    this.currentDates = dateFormDefaultValues;
    // this.currentDates = this.fetchDatesFromStorage() || dateFormDefaultValues;

    this.configureGoogleSignIn = this.configureGoogleSignIn.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleNavigate = this.handleNavigate.bind(this);
    this.handleDateUpdate = this.handleDateUpdate.bind(this);
    this.fetchDatesFromStorage = this.fetchDatesFromStorage.bind(this);
    this.storeDatesToStorage = this.storeDatesToStorage.bind(this);
    this.handleDeleteExpenseRecord = this.handleDeleteExpenseRecord.bind(this);
    this.handleDeleteIncomeRecord = this.handleDeleteIncomeRecord.bind(this);
  }
  
  componentDidMount() {
    this.configureGoogleSignIn();
  }

  // FIX: need fix
  async fetchDatesFromStorage() {
      try {
        const start = await AsyncStorage.getItem('startDate');
        const end = await AsyncStorage.getItem('endDate');
        if (start && end) {
            console.log(start);
            console.log(end);
            const startDate = new Date(start);
            const endDate = new Date(end);
            console.log('fetched startDate & endDate: ' + startDate + ' ' + endDate);
            return {
                startDate: startDate,
                endDate: endDate,
            };
        } else {
            return undefined;
        }
      } catch(err) {
        console.log('error fetching dates from storage');
        return undefined;
      }
  }

  async storeDatesToStorage(start, end) {
      try {
        await AsyncStorage.setItem('startDate', start + '');
        await AsyncStorage.setItem('endDate', end + '');
      } catch(err) {
          console.log('error storing dates to storage: ' + err);
      }
  }

  async configureGoogleSignIn() {
    try {
        await GoogleSignin.hasPlayServices({ autoResolve: true });
        await GoogleSignin.configure({
            webClientId: '1092976674214-6vh5n12cnulkjr2gvoupflm6g83c3opb.apps.googleusercontent.com',
            offlineAccess: true,
        });

        const data = await GoogleSignin.currentUserAsync();
        const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
        const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
        const userObj = currentUser.user.toJSON();
        this.setState({ 
            user: {
                displayName: userObj.displayName,
                email: userObj.email,
                emailVerified: userObj.emailVerified,
                isAnonymous: userObj.isAnonymous,
                phoneNumber: userObj.phoneNumber,
                photoURL: userObj.photoURL,
                providerId: userObj.providerId,
                uid: userObj.uid,
            }
        });
        this.handleDateUpdate();
    } catch (error) {
      console.log('Play services error', error.code, error.message);
    }
  }

  async handleSignIn() {
    try {
        const data = await GoogleSignin.signIn();
        const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
        const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
        const userObj = currentUser.user.toJSON();
        this.setState({ 
            user: {
                displayName: userObj.displayName,
                email: userObj.email,
                emailVerified: userObj.emailVerified,
                isAnonymous: userObj.isAnonymous,
                phoneNumber: userObj.phoneNumber,
                photoURL: userObj.photoURL,
                providerId: userObj.providerId,
                uid: userObj.uid,
            }
        });
        this.handleDateUpdate();
    } catch(e) {
        console.error(e);
    }
  }


    handleDateUpdate() {
        const formValue = this.refs.form.getValue();
        // console.log(value);
        if (formValue) {
            // get dates from form
            const start = new Date(formValue.startDate).getTime();
            const end = new Date(formValue.endDate).getTime();
            this.storeDatesToStorage(start, end);

            getTotalIncome(firebase.database(), this.state.user.uid, start, end)
                .on('value', (snapshot) => {
                    
                    const obj = snapshot.val();
                    if (obj) {
                        const income = Object.entries(obj).reduce((total, pair) => {
                            const [key, val] = pair;
                            return total + val['amount'];
                        }, 0);
                        
                        this.setState({
                            currentIncome: obj,
                            totalIncome: income,
                        });
                    } else {
                        this.setState({
                            currentIncome: '',
                            totalIncome: 0,
                        });
                    }
                    ToastAndroid.show('Total incomes has been updated!', ToastAndroid.LONG);
                });

            getTotalExpense(firebase.database(), this.state.user.uid, start, end)
                .on('value', (snapshot) => {

                    const obj = snapshot.val();
                    if (obj) {
                        const expense = Object.entries(obj).reduce((total, pair) => {
                            const [key, val] = pair;
                            return total + val['amount'];
                        }, 0);

                        this.setState({
                            currentExpense: obj,
                            totalExpense: expense,
                        });
                    } else {
                        this.setState({
                            currentExpense: '',
                            totalExpense: 0,
                        });
                    }
                    ToastAndroid.show('Total expenses has been updated!', ToastAndroid.LONG);
                });
        }
        
    }

  handleSignOut() {
    GoogleSignin.signOut()
      .then(() => {
        console.log('out');
          this.setState({ 
              user: '',
              fabActive: false,
              totalIncome: 0,
              totalExpense: 0,
              currentIncome: '',
              currentExpense: '',
          });
      })
      .catch((err) => console.log(err));
  }

  handleNavigate(screenName, data) {
    this.props.navigation.navigate(screenName, data);
    this.setState({
      fabActive: false,
    });
  }

  handleDeleteIncomeRecord(recordData) {
    deleteIncomeRecord(firebase.database(), this.state.user.uid, recordData)
        // .on('value', (snapshot) => {
        //     console.log(snapshot.val());
        // })
  }
  handleDeleteExpenseRecord(recordData) {
    deleteIncomeRecord(firebase.database(), this.state.user.uid, recordData)
        // .on('value', (snapshot) => {
        //     console.log(snapshot.val());
        // })
  }

  render() {
    const user = this.state.user;
    const sum = this.state.totalIncome - this.state.totalExpense;
    return (
        user ? (
        <Container>

            <Header>
                <Body>
                  <Title style={{fontSize: 23}}>BUDGEE</Title>
                </Body>
                <Right>
                  <Button transparent onPress={this.handleSignOut}>
                    <Icon style={{ color: '#fff', fontSize: 23 }} name='md-log-out' />
                  </Button>
                </Right>
            </Header>
            <Content style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{
                        fontSize: 22,
                        marginBottom: 10,
                        alignSelf: 'center',
                    }}>
                        Hello, <Text style={{color: '#4286f4', fontSize: 22, fontWeight: 'bold'}}>{user.displayName}</Text>!
                    </Text>
                    <Card style={{ borderWidth: 0, flexGrow: 0 }}>
                        <CardItem bordered >
                            <Body>
                                <Form
                                    ref="form"
                                    type={DateFilterForm}
                                    value={this.currentDates}
                                    options={DateFilterFormOptions}
                                    onChange={(value) => this.currentDates = value}
                                />
                                <Button block style={{ padding: 10, marginBottom: 10 }} iconLeft onPress={() => this.handleDateUpdate()}>
                                    <Icon style={{ color: '#fff', fontSize: 23 }} name='refresh' />
                                    <Text> REFRESH </Text>
                                </Button>
                            </Body>
                        </CardItem>
                        <CardItem 
                            bordered 
                            button 
                            onPress={() => this.handleNavigate('RecordDetails', { 
                                                                    user: this.state.user, 
                                                                    records: this.state.currentIncome, 
                                                                    deleteHandler: this.handleDeleteIncomeRecord, 
                                                                    type: 'INCOME',
                                                                })}
                        >
                            <Body>
                                <H3>Incomes</H3>
                                <Text
                                    style={{
                                        color: '#00ce0a',
                                        fontSize: 26,
                                    }}
                                >Rp {this.state.totalIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                            </Body>
                        </CardItem>
                        <CardItem 
                            bordered 
                            button 
                            onPress={() => this.handleNavigate('RecordDetails', { 
                                                                user: this.state.user, 
                                                                records: this.state.currentExpense, 
                                                                deleteHandler: this.handleDeleteExpenseRecord,
                                                                type: 'EXPENSE',
                                                            })}
                        >
                            <Body>
                                <H3>Expenses</H3>
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: 26,
                                    }}
                                >Rp {this.state.totalExpense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                            </Body>
                        </CardItem>
                        <CardItem 
                            bordered 
                            button 
                            onPress={() => this.handleNavigate('RecordDetails', 
                                                { user: this.state.user, 
                                                    records: { ...this.state.currentExpense, ...this.state.currentIncome },
                                                    type: 'ALL',
                                                })}
                        >
                            <Body>
                                <H2>Summary</H2>
                                <Text
                                    style={{
                                        color: '#4286f4',
                                        fontSize: 30,
                                    }}
                                >Rp {sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                                { /*
                                    sum < 1 ? (
                                        <Text
                                            style={{
                                                color: 'red',
                                                fontSize: 30,
                                            }}
                                        >Rp {sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                                    ) : (
                                        <Text
                                            style={{
                                                color: '#4286f4',
                                                fontSize: 30,
                                            }}
                                        >Rp {sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                                    ) */
                                }
                            </Body>
                        </CardItem>
                    </Card>
            </Content>
                    <Fab
                      active={this.state.fabActive}
                      direction='up'
                      style={{ backgroundColor: '#5067ff'}}
                      position='bottomRight'
                      onPress={() => this.setState({fabActive: !this.state.fabActive})}
                    >
                      { this.state.fabActive ? <Icon name='md-close' /> : <Icon name='md-add' /> }

                      <Button 
                        onPress={() => this.handleNavigate('Expense', { user: this.state.user })}
                        style={{ backgroundColor: '#dd5144'}}>
                        <Icon color='#fff' name='md-cart' />
                      </Button>

                      <Button 
                        onPress={() => this.handleNavigate('Income', { user: this.state.user })}
                        style={{ backgroundColor: '#34a34f'}}>
                        <Icon color='#fff' name='md-cash' />
                      </Button>

                    </Fab>
        </Container>
        ) : (
            <Container style={{alignItems: 'center', justifyContent: 'center' }}>
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: '#4286f4',
                        marginTop: 'auto',
                    }}
                >
                    BUDGEE
                </Text>
                <GoogleSigninButton
                    style={{ 
                        width: 312, height: 48,
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Light}
                  onPress={this.handleSignIn}
                />
            </Container>
        )
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default HomeScreen;
