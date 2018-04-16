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
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';


class HomeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fabActive: false,
    };

    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
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

      const user = await GoogleSignin.currentUserAsync();
      this.setState({user});

    } catch (error) {
      console.log('Play services error', error.code, error.message);
    }
  }
  
  

  handleSignIn() {
    GoogleSignin.signIn()
      .then((user) => {
        console.log(user);
        this.setState({ user: user });
      })
      .catch((err) => {
        console.log('WRONG SIGNIN', err);
      });
  }

  handleSignOut() {
    GoogleSignin.signOut()
      .then(() => {
        console.log('out');
        this.setState({ user: '' });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const user = this.state.user;

    return (
      <Container>
        {
          user ? (
            <Header>
              <Left />
              <Body>
                <Title>Walleter</Title>
              </Body>
              <Right>
                <Button transparent onPress={this.handleSignOut}>
                  <Text>Sign Out</Text>
                </Button>
              </Right>
            </Header>
            <View style={styles.container}>
              <Text>Hello, {user.givenName} ({user.id})</Text>
              <Fab
                active={this.state.fabActive}
                direction='up'
                style={{ backgroundColor: '#5067ff'}}
                position='bottomRight'
                onPress={() => this.setState({fabActive: !this.state.fabActive})}
              >
                { this.state.fabActive ? <Icon name='close' /> : <Icon name='plus' /> }

                <Button 
                  onPress={() => this.props.navigation.navigate('Expense')}
                  style={{ backgroundColor: '#dd5144'}}>
                  <Icon color='#fff' name='beer' />
                </Button>

                <Button 
                  onPress={() => this.props.navigation.navigate('Income')}
                  style={{ backgroundColor: '#34a34f'}}>
                  <Icon color='#fff' name='money' />
                </Button>

              </Fab>
            </View>
          ) : (
            <GoogleSigninButton
              style={{ width: 312, height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={this.handleSignIn}
              // onPress={() => GoogleSignin.signIn().then((user) => this.setState({ user: user }))}
            />
          )
        }
        
      </Container>


      // <View style={styles.container}>
      //   {
      //     user ? (
      //       <View>
      //         <Text>
      //           Hello, {user.givenName}
      //         </Text>
      //         <View style={styles.btnContainer}>
      //             <Button
      //                 title='Add Income'
      //                 onPress={() => this.props.navigation.navigate('Income')}
      //             />
      //         </View>
      //         <View style={styles.btnContainer}>
      //             <Button
      //                 title='Add Expense'
      //                 onPress={() => this.props.navigation.navigate('Expense')}
      //             />
      //         </View>
      //         <Button title='Sign Out' onPress={this.handleSignOut} />
      //       </View>
      //     ) : (
      //       <GoogleSigninButton
      //         style={{ width: 312, height: 48 }}
      //         size={GoogleSigninButton.Size.Wide}
      //         color={GoogleSigninButton.Color.Light}
      //         // onPress={this.handleSignIn}
      //         onPress={() => GoogleSignin.signIn().then((user) => this.setState({ user: user }))}
      //       />
      //     ) 
      //   }
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default HomeScreen;