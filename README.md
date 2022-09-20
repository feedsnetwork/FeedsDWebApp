# Feeds - A decentralized social platform

Feeds is a new, decentralized social platform where users remain in full control of generated data. The platform is fully complying with concept of web5 vision on three pillars: 

- Elastos decentralized identifier (Decentralized Identifier, DID) to sign in applications and therefore fully control the ownership of application data
- Verifiable credentials (Verfiable Credentials, VC) to reprent user social graph with sepcial formats and data model for cryptographic representation and verification of assertions
- Decentralized web nodes (DWN) with Hive network and blockchain to store generated data to communicate between users and applications as well.

Currently we have two types of Feeds applications:

- Feeds mobile application (Android & iOS)
- Feeds web application

Here is the repository of Feeds web application. Users need to use `Essentials` wallet to signin the application with #Elastos DID.  **Ownship of your data is happening here**.



## Features 

Feeds is still on the first stage of developing features with the following list:

- [x]  Sign-in with DID
- [x]  Basic channel features (post/comment/like/subscription)
- [x]  Make posts to Twitter/Reddit from Feeds
- [ ]  Improvement on social graph content
- [x]  Pin post
- [x]  Repost 
- [x]  Feeds channel exploring service
- [ ]  NFT collectible integration
- [ ]  ElaDomain integration
- [ ]  Decentralized mechanism for reporting spam/illegal content 
- [ ]  Credenitals/Badge for channel customization 
- [ ]  Tipping post
- [ ]  Ads mechanism integration
- [ ]  Topic trend management
- [ ]  More ... 



## Run web App

Prepared that `Nodejs`need to be installed on your local device, then clone  the repository with the commands:

```shell
$ git clone https://github.com/feedsnetwork/feeds-web-dapp
$ cd feeds-web-dapp
```

### Build

Clone the repository on your local device, and enter this project directory.

```
$ npm install
$ npm start
```

Then run the command above to start running the app in `developement` mode, and then open http://localhost:3000 to view it in your browser.

**Notice:** *The page will reload when you make changes, and you may also see any lint errors in the console*

### Deploy to run

```
$ npm run build
```

Builds the app for production to the `build` folder.  It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready to be deployed!

***Notice: You also can choose to use `yarn` command to build or deploy the web application instead of using `npm` package tools.***



## Contribution

Any contributions  to this project would be highly appreciated, including

- Building docs
- Report bug and bugfix
- UI/UX improvement
- Suggestion or advices

The contribution acitivities can be either by creating an issue or pushing a pull request.



## License

This project is licensed under the terms of the [MIT license](https://github.com/feedsnetwork/feeds-web-dapp/blob/main/LICENSE).
