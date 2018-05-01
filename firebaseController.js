import React from 'react';
import firebase from 'react-native-firebase';

// firebase.initializeApp({
//     apiKey: 'AIzaSyDkkQ_0pARyTcVs-s60zEs-V1oJjaF3060',
//     authDomain: 'finance-rn.firebaseapp.com',
//     databaseURL: 'https://finance-rn.firebaseio.com',
//     storageBucket: 'finance-rn.appspot.com',
// })

// const db = firebase.database();

export function addUserIncome(db, userId, recordData) {

    const newKey = db.ref('users/' + userId + '/').child('incomes').push().key;

    let updates = {};

    updates['/users/' + userId + '/income/' + newKey] = recordData;
    
    return db.ref().update(updates);
}

export function addUserExpense(db, userId, recordData) {
    
    const newKey = db.ref('users/' + userId + '/').child('expenses').push().key;

    let updates = {};

    updates['/users/' + userId + '/expense/' + newKey] = recordData;
    
    return db.ref().update(updates);
}

export function getTotalIncome(db, userId, startDate, endDate) {
    return db.ref('users/' + userId + '/income/').orderByChild('recordDate').startAt(startDate).endAt(endDate);
}

export function getTotalExpense(db, userId, startDate, endDate) {
    return db.ref('users/' + userId + '/expense/').orderByChild('recordDate').startAt(startDate).endAt(endDate);
}
