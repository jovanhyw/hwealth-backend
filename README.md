# HWealth - Backend

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Built Using](#built_using)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

This project aims to comply to good information security practices while bringing out a functional application.

HWealth is a platform where users can find "Pro-bono" services provided by medical professionals. Medical professionals go through a verification process done by us before being allowed to provide their services on the platform.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

You will need to have the following installed on your local machine in order for the code to run in your local environment.

| Required | Link                                              |
| -------- | ------------------------------------------------- |
| NodeJS   | https://nodejs.org/en/                            |
| MongoDB  | https://www.mongodb.com/download-center/community |

### Installing

Clone this repository to your desired directory.

```bash
cd hwealth-backend

# installing node dependencies
npm install
```

Rename the `.env.example` file to `.env` and enter the relevant values into the appropriate fields.

```bash
# Rename this file to .env
# Enter the values into the appropriate fields

# Database Connection String
DB_CONN =

# JWT Secret
JWT_SECRET =

# SendGrid API Key
SENDGRID_API_KEY =

# API Host Name
# https://hwealth.me
API_HOST_NAME =

# FRONTEND Host Name
FRONTEND_HOST_NAME =

# Google Captcha
CAPTCHA_ANDROID_SECRET_KEY =

################
# IMPORTANT!!! #
################

# The keys below here are in hex form and must be generated from
# the encryptionUtil.js method `getKeyFromPassword`
#
# Generate a salt using the `genSalt()` method and 
# supply the salt and a password to `getKeyFromPassword()`
# You will receive a Buffer, call a .toString('hex') to the
# buffer to receive the hex key.

# Encryption Key for 2FA Secret
ENC_KEY_TFA =

# Encryption Key for 2FA Recovery Code
ENC_KEY_TFA_REC_CODE =

# Encryption Key for JWT
ENC_KEY_JWT =

# Encryption Key for Messages
ENC_KEY_MESSAGE =
```

Run your MongoDB before proceeding to the next step. Once MongoDB is running, proceed.

Run development script.

```bash
# nodemon for development purposes to watch for code changes
npm run dev
```

The server should be up and running on http://localhost:3000 and you will be able to hit the API endpoints with Postman / Insomnia / Other API tools.

## 🚀 Deployment <a name = "deployment"></a>

Add additional notes about how to deploy this on a live system.

## ⛏️ Built Using <a name = "built_using"></a>

- [MongoDB](https://www.mongodb.com/) - Database
- [NodeJS](https://nodejs.org/en/) - Server Environment
- [Express](https://expressjs.com/) - Server Framework

## ✍️ Authors <a name = "authors"></a>

- SIT ICT IS SE - Class of 2021 ICT3X01 Team 9
