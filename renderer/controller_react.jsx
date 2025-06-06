import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, teamsLightTheme, teamsDarkTheme } from '@fluentui/react-components';
import './controller.css';
import App from './controller';

var fluent_theme = teamsLightTheme;
try{
    if(window.electron_apis.nativeTheme.shouldUseDarkColors){
        fluent_theme = teamsDarkTheme;
    };
}catch(e){
    console.log(e);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <FluentProvider
        theme={fluent_theme}
        style={{height: '100vh',width: '100vw'}}
    >
        <App />
    </FluentProvider>
);