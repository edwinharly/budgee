/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  Text,
  View
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './HomeScreen';
import IncomeScreen from './IncomeScreen';
import ExpenseScreen from './ExpenseScreen';
import RecordDetailsScreen from './RecordDetailsScreen';
import { Root } from 'native-base';

const RootStack = StackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Income: {
    screen: IncomeScreen,
  },
  Expense: {
    screen: ExpenseScreen,
  },
  RecordDetails: {
    screen: RecordDetailsScreen,
  }
});

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {
  render() {
      return  (
        <Root>
            <RootStack />
        </Root>
      );
  }
}
