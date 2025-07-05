import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { DEFAULT_PORT } from './config/serverConfig.js';  
import authenticateToken from './utils/authenticateToken.js';  

import WebSocketManager from './utils/webSocketManager.js';  
import OPCUAClientModule from './utils/opcuaClientModule.js';  

// 라우트 연결
import indexRouter from './routes/index.js';
import loginRouter from './routes/login.js';
import userRouter from './routes/user.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = DEFAULT_PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);import cors from 'cors';
// 정적 파일 제공 (public 폴더 내부의 파일들)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware 설정
app.use(cors({
  credentials: true
})); // CORS, 서버는 클라이언트가 보낸 쿠키를 포함한 요청을 수락하도록 허용
app.use(cookieParser());
app.use(bodyParser.json({ limit: '3mb' })); // JSON 요청 본문 파싱
app.use(bodyParser.urlencoded({ extended: true, limit: '3mb'  })); // URL-encoded 요청 본문 파싱

// 인증 제외
app.use(authenticateToken.unless({
  path: [
    { url: '/', methods: ['GET'] }, 
    { url: '/auth/login', methods: ['POST'] }, 
    { url: '/auth/join', methods: ['POST'] },
  ]
})); 

app.use('/', indexRouter);
app.use('/auth', loginRouter);
app.use('/users', userRouter);
app.use('/api', apiRouter);

// 서버 실행
const server = app.listen(PORT, () => {
  const address = server.address();
  const host = address.address === "::" ? "localhost" : address.address; // IPv6 처리
  const port = address.port;

  console.log(`Server running at http://${host}:${port}/`);
});



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

// // 구독 리스너 추가
await opcuaClient.addSubscriptionListener('ns=2;i=5', callback);
await opcuaClient.addSubscriptionListener('ns=2;i=6', callback);


// 종료 시 클라이언트 연결 해제
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await opcuaClient.close();
  process.exit(0);
});  



