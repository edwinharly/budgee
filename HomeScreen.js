import React from 'react';
import { 
  StyleSheet, 
  View, 
  DatePickerAndroid 
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
  H2,
  H1,
} from 'native-base';
import {
    Col,
    Row,
    Grid,
} from 'react-native-easy-grid';
import Icon from 'react-native-vector-icons/FontAwesome';
import t from 'tcomb-form-native';
import moment from 'moment';
import { getTotalIncome, getTotalExpense } from './firebaseController';

moment().locale('ID');

const Form = t.form.Form;

const DateFilterForm = t.struct({
    startDate: t.Date,
    endDate: t.Date,
});
const DateFilterFormOptions = {
    fields: {
        startDate: {
            error: 'Date is required',
            mode: 'date',
            config: {
                format: (date) => moment(date).format('LL')
            },
        },
        endDate: {
            error: 'Date is required',
            mode: 'date',
            config: {
                format: (date) => moment(date).format('LL')
            },
        },
    }
};
const dateFormDefaultValues = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
};

class HomeScreen extends React.Component {

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

    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleNavigate = this.handleNavigate.bind(this);
    this.handleDateUpdate = this.handleDateUpdate.bind(this);
  }
  
  componentDidMount() {
    this.configureGoogleSignIn();
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
        console.log(this.state.user);
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
        console.log(this.state.user);
    } catch(e) {
        console.error(e);
    }
  }


    handleDateUpdate() {
        const value = this.refs.form.getValue();
        // console.log(value);
        if (value) {
            const start = value.startDate;
            const end = value.endDate;
            getTotalIncome(firebase.database(), this.state.user.uid, start, end)
                .on('value', (snapshot) => {
                    console.log(snapshot, null, 4);
                    // const value = snapshot.map((s) => s.val());
                    // const totalIncome = value.reduce((acc, i) => {
                    //     acc += i.amount;
                    // }, 0);
                    // this.setState({
                    //     currentIncome: value,
                    //     totalIncome: totalIncome,
                    // });
                });
            getTotalExpense(firebase.database(), this.state.user.uid, start, end)
                .on('value', (snapshot) => {
                    // console.log('expense snapshot: ' + snapshot);
                    // const value = snapshot.map((s) => s.val());
                    // const totalExpense = value.reduce((acc, i) => {
                    //     acc += i.amount;
                    // }, 0);
                    // this.setState({
                    //     currentExpense: value,
                    //     totalExpense: totalExpense,
                    // });
                });
        }
        
    }

  handleSignOut() {
    GoogleSignin.signOut()
      .then(() => {
        console.log('out');
        this.setState({ user: '' });
      })
      .catch((err) => console.log(err));
  }

  handleNavigate(screenName) {
    this.props.navigation.navigate(screenName, { user: this.state.user });
    this.setState({
      fabActive: false,
    });
  }

  render() {
    const user = this.state.user;
    return (
        user ? (
        <Container>

            <Header>
                <Body>
                  <Title style={{fontSize: 23}}>Walleter</Title>
                </Body>
                <Right>
                  <Button transparent onPress={this.handleSignOut}>
                    <Icon style={{ color: '#fff', fontSize: 23 }} name='sign-out' />
                  </Button>
                </Right>
            </Header>
            <Content contentContainerStyle={{ flex: 1, flexGrow: 1 }}>
                <View style={styles.container}>

                  <Form
                    ref="form"
                    type={DateFilterForm}
                    value={dateFormDefaultValues}
                    options={DateFilterFormOptions}
                  />
                    <Button style={{ padding: 10 }} iconLeft onPress={this.handleDateUpdate}>
                        <Icon style={{ color: '#fff', fontSize: 23 }} name='refresh' />
                        <Text> REFRESH </Text>
                    </Button>

                <H2>Summary</H2>
                <H1>{this.state.totalIncome - this.state.totalExpense}</H1>

                <Fab
                  active={this.state.fabActive}
                  direction='up'
                  style={{ backgroundColor: '#5067ff'}}
                  position='bottomRight'
                  onPress={() => this.setState({fabActive: !this.state.fabActive})}
                >
                  { this.state.fabActive ? <Icon name='close' /> : <Icon name='plus' /> }

                  <Button 
                    onPress={() => this.handleNavigate('Expense')}
                    style={{ backgroundColor: '#dd5144'}}>
                    <Icon color='#fff' name='beer' />
                  </Button>

                  <Button 
                    onPress={() => this.handleNavigate('Income')}
                    style={{ backgroundColor: '#34a34f'}}>
                    <Icon color='#fff' name='money' />
                  </Button>

                </Fab>

                </View>
            </Content>
            </Container>
          ) : (
            <GoogleSigninButton
              style={{ width: 312, height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={this.handleSignIn}
            />
          )
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default HomeScreen;
