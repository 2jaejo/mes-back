import { OPCUAClient, AttributeIds, TimestampsToReturn } from 'node-opcua';

class OPCUAClientModule {
  constructor() {
    if (OPCUAClientModule.instance) {
      return OPCUAClientModule.instance; // 이미 인스턴스가 있으면 기존 인스턴스를 반환
    }
    OPCUAClientModule.instance = this; // 인스턴스를 static 속성으로 저장

    this.client = OPCUAClient.create({
      endpointMustExist: false,
    });
    this.session = null;
    this.subscription = null;
    
  }

  // 싱글톤 인스턴스를 반환하는 메서드
  static getInstance() {
    if (!OPCUAClientModule.instance) {
      OPCUAClientModule.instance = new OPCUAClientModule();
    }
    return OPCUAClientModule.instance;
  }

  async connect(endpoint) {
    try {
      if (!this.session) {
        await this.client.connect(endpoint);
        this.session = await this.client.createSession();
        console.log("OPC UA 서버에 연결되었습니다.");
      }
    } catch (error) {
      console.error("OPC UA 서버 연결 실패:", error);
    }
  }

  async readNode(nodeId) {
    try {
      if (!this.session) {
        throw new Error("OPC UA 세션이 없습니다. 먼저 connect()를 호출해야 합니다.");
      }

      const dataValue = await this.session.read({
        nodeId: nodeId,
        attributeId: AttributeIds.Value,
      });
      return dataValue.value.value;
    } catch (error) {
      console.error("노드 읽기 실패:", error);
    }
  }

  async createSubscription() {
    try {
      if (!this.session) {
        throw new Error("OPC UA 세션이 없습니다. 먼저 connect()를 호출해야 합니다.");
      }

      this.subscription = await this.session.createSubscription2({
        requestedPublishingInterval: 2000,
        requestedLifetimeCount: 100,
        requestedMaxKeepAliveCount: 10,
        maxNotificationsPerPublish: 10,
        publishingEnabled: true,
        priority: 10,
      });

      this.subscription.on("started", () => {
        console.log("구독이 시작되었습니다.");
      });

      this.subscription.on("terminated", () => {
        console.log("구독이 종료되었습니다.");
      });

    } catch (error) {
      console.error("구독 생성 실패:", error);
    }

  }

  async addSubscriptionListener(nodeId, callback = null) {
    if (!this.subscription) {
      throw new Error("구독이 없습니다. 먼저 createSubscription()을 호출해야 합니다.");
    }

    const itemToMonitor = {
        nodeId: nodeId,
        attributeId: AttributeIds.Value
    };

    const parameters = {
        samplingInterval: 2000,  // 2초마다 데이터 확인
        discardOldest: true,
        queueSize: 10
    };

    const monitoredItem = await this.subscription.monitor(itemToMonitor, parameters, TimestampsToReturn.Both);

    monitoredItem.on("changed", (dataValue) => {
      if (callback instanceof Function) {
        callback(nodeId, dataValue.value.value);
      }else{
        console.log("노드 데이터 변경:", nodeId, dataValue.value.value);
      }
    });
  }

  async close() {
    if (this.session) {
      await this.session.close();
      this.session = null;
      console.log("세션이 종료되었습니다.");
    }
    await this.client.disconnect();
    console.log("OPC UA 클라이언트가 종료되었습니다.");
  }
}

export default OPCUAClientModule;
