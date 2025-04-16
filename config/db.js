// require('dotenv').config();
// postgreSQL 사용
// const { Pool } = require('pg');

import 'dotenv/config';  // dotenv를 ES 모듈 방식으로 import
import pkg from 'pg'; // CommonJS 모듈을 default import로 가져옴
const { Pool } = pkg; // Pool을 구조 분해 할당
// import { Pool } from 'pg';

// PostgreSQL 연결 풀 설정
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,  // 최대 연결 수 (옵션)
  idleTimeoutMillis: 30000,  // 연결이 유휴 상태일 때 종료되는 시간 (옵션)
  connectionTimeoutMillis: 2000,  // 연결할 때까지 기다리는 시간 (옵션)
});

export default pool;

// MY SQL 사용
// const mysql = require('mysql2');
// // MySQL 연결 풀 설정
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',  // MySQL 사용자
//   password: 'yourpassword',  // MySQL 비밀번호
//   database: 'react',  // 데이터베이스 이름
//   waitForConnections: true,
//   connectionLimit: 20,  // 최대 연결 수
//   queueLimit: 0  // 큐에 대기할 수 있는 연결 수
// });
// // pool.query 사용을 위한 promise 반환 설정
// const promisePool = pool.promise();
// module.exports = promisePool;