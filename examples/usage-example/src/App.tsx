import React from 'react';
import { RoutesWrapper } from './Routing';
import Notifications from 'react-notify-toast';
import './App.css';

function App() {
  return <>
    <Notifications />
    <RoutesWrapper />
  </>;
}

export default App;
