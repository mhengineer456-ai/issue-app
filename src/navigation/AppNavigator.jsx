import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LotListScreen from '../screens/LotListScreen';
import TodoIssueScreen from '../screens/TodoIssueScreen';
import ExecutiveSummaryScreen from '../screens/ExecutiveSummaryScreen';
import TodoListScreen from '../screens/TodoListScreen';
import CompletedLotScreen from '../screens/CompletedLotScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LotList" component={LotListScreen} />
      <Stack.Screen name="TodoList" component={TodoListScreen} />
      <Stack.Screen name="TodoIssue" component={TodoIssueScreen} />
      <Stack.Screen name="ExecutiveSummary" component={ExecutiveSummaryScreen} />
      <Stack.Screen name="CompletedLot" component={CompletedLotScreen} />
    </Stack.Navigator>
  );
}


