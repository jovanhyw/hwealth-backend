const axios = require('axios');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const commons = require('../utils/commons')


const tfaService = {};

// get username from auth JWT - not implmenented

// get user account details
function getUserDetails(){
  var userDetails = commons.usersObject.find(function(user) {
    return user.username == "testuser"; // hardcode testuser
  });
  return userDetails
}

function addUser(){
  commons.usersObject.push({
      username: 'fuckyou',
      tfa: ''
  })
}

function deleteTfa(){
  for(var i in commons.usersObject){
    if (commons.usersObject[i].username == "testuser"){ // hardcode testuser
      delete commons.usersObject[i].tfa;
      return true;
    }
  }
  return false; 
}

function getTfaTempSecret(){
  tempSecret = null;
  for(var i in commons.usersObject){
    if (commons.usersObject[i].username == "testuser"){ // hardcode testuser
      tempSecret = commons.usersObject[i].tfa.tempSecret
      return tempSecret;
    }
  }
  return tempSecret; 
}

tfaService.addUser = async (req, res) => {
  addUser();
  console.log(commons);
}

tfaService.setup = async (req, res) => {

    //find username from jwt token req
    
    //get user details
  var userDetails = getUserDetails();
  console.log(getUserDetails());
    
  const secret = speakeasy.generateSecret({
    length: 20,
    name: userDetails.username,
    issuer: 'Hweath Corporation v0.1'
  });


  var url = speakeasy.otpauthURL({
    secret: secret.base32,
    label: userDetails.username,
    issuer: 'Hweath Corporation v0.1',
    encoding: 'base32'
  });

  QRCode.toDataURL(url, (err, dataURL) => {
    // store secret into common object
    for(var i in commons.usersObject){
      if (commons.usersObject[i].username == userDetails.username){
        commons.usersObject[i].tfa = {
          secret: '',
          tempSecret: secret.base32,
          dataURL,
          tfaURL: url
        } 
      } else {
        res.status(400).send({
          error: true,
          message: 'unable to find user.'
        });
      }
      console.log(getUserDetails());
      res.status(200).send({
        error: false,
        message: 'TFA Auth needs to be verified',
        tempSecret: secret.base32,
        dataURL,
        tfaURL: url
      })      
    }
  })
}

tfaService.deleteTfa = async (req, res) => {
  console.log(`DEBUG: Received FETCH TFA request`);
  if(deleteTfa()){
    res.status(200).send({
      error: false,
      "message": "successfully deleted TFA."
    });
  } else {
    res.status(400).send({
      error: true,
      "message": "Failed to delete TFA."
    })
  }
}

tfaService.verifyTfa = async (req, res) => {
  //get tempsecret from commons
  //get username from jwt
  //get user details
  var tempSecret = getTfaTempSecret();
  if (tempSecret == null){
    return res.status(403).send({
      error: true,
      "message" : "tempSecret not found on user."
    })
  } else {
    let isVerified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: req.body.token
    });

    if (isVerified) {
      console.log(`DEBUG: TFA is verified to be enabled`);
      // push to DB
      console.log("Push to DB: ", tempSecret);
      return res.send({
          "status": 200,
          "message": "Two-factor Auth is enabled successfully"
      });
    }

    console.log(`ERROR: TFA is verified to be wrong`);

    return res.send({
        "status": 403,
        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
    });
  }
}



  

module.exports = tfaService;


