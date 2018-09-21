## React

This is a React/Cordova project which was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Build requirements

The following versions were used when creating this app:

 - node (6.11.3)
 - npm (5.7.1)

## To run on your local machine:

### `npm install`

To install app dependencies specified in the package.json

### `npm start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `npm run cycle`

Builds the app for production.


First it will run ESlint and prettier which will display any issues in the terminal. It will prettify the code where it can. Currently only makes changes to the `src` folder - see the `.eslintignore` file for the folders/files which are ignored. See the `.eslintrc.js` file for the specific ESlint setup/options.  
  
If ESlint finds any code style errors then the `npm run cycle` script will stop running.  
  
  In the npm scripts:  

&& as meaning "only run this next command if the last one doesn't error."  
`;` would mean "run this next command no matter what happens to the last one."  
`||` would mean "run the next command only if the last one errors."  
   


If the ESlinting shows no errors then the `build` react script will be run, building the app for production and updating the `build` folder  
Then finally the contents of the `build` folder will be copied over into the `www` folder, as Cordova looks for files in the `www` folder.  
  
  
Now push the changes to the Git repo and build the Cordova app via the Red Hat MAP.
