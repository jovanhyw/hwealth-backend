# HWealth - Backend

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Built Using](#built_using)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

This project aims to comply to good information security practices while bringing out a functional application.

HWealth is a platform where users can find "Pro-bono" services provided by medical professionals on this platform. Medical professionals go through a verification process done by us before being allow to be on the platform.

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
- [Express](https://expressjs.com/) - Server Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

- SIT ICT IS SE - Class of 2021 ICT3X01 Team 9
