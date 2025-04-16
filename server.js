// const express = require("express");
// const cors = require("cors");
// const cookieParser = require('cookie-parser');
// const bodyParser = require("body-parser");
// const PORT = require('./config/serverConfig').DEFAULT_PORT;
// // import WebSocket from 'ws';
// const authenticateToken = require('./utils/authToken');
// const WebSocketManager = require('./utils/webSocketManager');
// // const OPCUAClientModule = require('./utils/opcuaClientModule');
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { DEFAULT_PORT } from './config/serverConfig.js';  
import authenticateToken from './utils/authenticateToken.js';  

import WebSocketManager from './utils/webSocketManager.js';  
import OPCUAClientModule from './utils/opcuaClientModule.js';  

// 라우트 연결
// const indexRouter = require('./routes/index');
// const loginRouter = require('./routes/login');
// const userRouter = require('./routes/user');
// const itemRouter = require('./routes/item');
import indexRouter from './routes/index.js';
import loginRouter from './routes/login.js';
import userRouter from './routes/user.js';
import itemRouter from './routes/item.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = DEFAULT_PORT;

// Middleware 설정
app.use(cors({
  credentials: true
})); // CORS, 서버는 클라이언트가 보낸 쿠키를 포함한 요청을 수락하도록 허용
app.use(cookieParser());
app.use(bodyParser.json()); // JSON 요청 본문 파싱
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 요청 본문 파싱
app.use(authenticateToken.unless({
  path: [
    { url: '/auth/login', methods: ['POST'] }, 
    { url: '/auth/join', methods: ['POST'] },
  ]
})); // 인증 제외

// 서버 실행
const server = app.listen(PORT, () => {
  const address = server.address();
  const host = address.address === "::" ? "localhost" : address.address; // IPv6 처리
  const port = address.port;

  console.log(`Server running at http://${host}:${port}/`);
});

app.use('/', indexRouter);
app.use('/auth', loginRouter);
app.use('/users', userRouter);
app.use('/api/items', itemRouter);
app.use('/api', apiRouter);


// WebSocketManager 생성
const wsm = new WebSocketManager(server);

// OPC UA 클라이언트 싱글톤 인스턴스 생성
const opcuaClient = OPCUAClientModule.getInstance();
// OPC UA 서버의 엔드포인트 URL
const endpointUrl = "opc.tcp://localhost:8004/abhopcua/server/"; // 예시 서버 주소
// OPC UA 클라이언트 연결
await opcuaClient.connect(endpointUrl);
// OPC UA 클라이언트 구독 생성
await opcuaClient.createSubscription();

// 구독 이벤트 콜백 함수
const callback = (id, val) => {
  wsm.sensorData[id] = val;
};

// 구독 리스너 추가
await opcuaClient.addSubscriptionListener('ns=2;i=5', callback);
await opcuaClient.addSubscriptionListener('ns=2;i=6', callback);




// 종료 시 클라이언트 연결 해제
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await opcuaClient.close();
  process.exit(0);
});  



