# Serverless WatchNext

To implement this project, you need to implement the WatchNext application using AWS Lambda and Serverless framework. 

The `client` folder contains a web application that can use the API.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

Run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless WatchNext application.