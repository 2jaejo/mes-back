import { WebSocketServer } from "ws";
import OPCUAClientModule from './opcuaClientModule.js';  

class WebSocketManager {
  constructor(server) {
    // 클라이언트 관리
    this.clients = [];
    // 클라이언트 구독 관리
    this.subscriptions = new Map();
    // 센서 데이터 예시 (임의 데이터)
    this.sensorData = {
      "sensor1": 0.1,
      "sensor2": 0.2,
      "sensor3": 0.3,
    };

    this.wss = new WebSocketServer({ server });

    // OPC UA 클라이언트 싱글톤 인스턴스 생성
    this.opcuaClient = OPCUAClientModule.getInstance();

    this.wss.on("connection", (ws) => {
      console.log("New client connected");

      const interval = setInterval( () => {
        // 센서 데이터 읽기
        this.subscriptions.forEach( (sensors, client) => {
          if (client.readyState === WebSocket.OPEN) {
            const dataToSend = {};
            sensors.forEach( (sensor) => {
              const value = this.sensorData[sensor];
              if (value !== null && value !== undefined) {
                dataToSend[sensor] = value;
              }
            });
            // 클라이언트에 센서 데이터 전송
            client.send(JSON.stringify({ sensors: dataToSend }));
          }
        });

      }, 3000); 

      ws.on("message", (message) => {
        console.log(`Received: ${message}`);

        const data = JSON.parse(message);
        if (data.action && data.action === "subscribe") {
          // 클라이언트의 구독 요청 처리
          this.subscriptions.set(ws, data.sensors); // 예: { action: 'subscribe', sensors: ['sensor1', 'sensor3'] }
          ws.send(JSON.stringify({ status: 'subscribed', sensors: data.sensors }));
        }
      });

      ws.on("error", (error) => {
        console.log(`error: ${error}`);
      });

      ws.on("close", () => {
        console.log("Client disconnected");
        this.subscriptions.delete(ws);
        clearInterval(interval);
      });
    });


  }

}

export default WebSocketManager;
