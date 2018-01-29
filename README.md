# mysoil-sample-app

This app started as a clone of the [iRecord App](https://github.com/NERC-CEH/irecord-app) v2.0.0. The build instructions are the same, copied.

## Configuration

App configuration is hosted in multiple places. **Note:** config changes should be done *before* building the code.

* **Main configuration** in `src/common/config.js`.
* App version/build is set in the package.json
* Cordova config is `config/cordova/cordova.xml`
* [Environmental variables](https://wiki.archlinux.org/index.php/environment_variables) like *INDICIA_API_KEY* can optionally be placed in `.env` file


## Building

- Install [NodeJS](http://nodejs.org/) ( > 4.5)

- Get a copy of the code by running:

```bash
git clone git://github.com/NERC-CEH/mysoil-sample-app.git
```

- Enter the `irecord-app` directory and install the npm build dependencies:

```bash
cd mysoil-sample-app
```
```bash
npm install
```

### Web app

If you are building for the web platform only:

`Production`

```bash
npm run build
```

`Development`

```bash
npm run build:dev
```

This will create a `dist` folder with the app code and its dependencies.


#### Running app locally

- [Express](http://expressjs.com/) framework is provided for a quick
launch of a web server.

```bash
npm start
```

- Open the app on a browser [http://localhost:8000](http://localhost:8000)


### Cordova app

- Initialize the project:

```bash
npm run build:cordova
```

- This will create a `dist/cordova` folder with the cordova project

- *(optionally)* Update Cordova project with new web pages if you have initialized
 but have made some source code changes (ie. only replaces the www folder contents)

```bash
npm run build:cordova:update
```

- **Android build**:

```bash
npm run build:cordova:android
```

- **iOS build** open `dist/cordova/platforms/ios/iRecord App.xcodeproj` in XCode

