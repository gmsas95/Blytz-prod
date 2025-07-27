import fs from 'fs';
import path from 'path';
import {theme} from './build/src/config/theme.js';

const appConfigPath = path.resolve(__dirname, 'app.json');
import appConfig from './app.json';

appConfig.expo.splash.backgroundColor = theme.colors.onPrimary;
appConfig.expo.android.adaptiveIcon.backgroundColor = theme.colors.onPrimary;

fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
