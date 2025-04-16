// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const { unless } = require('express-unless');

import 'dotenv/config';  // dotenv를 ES 모듈 방식으로 import
import jwt from 'jsonwebtoken';
import { unless } from 'express-unless';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.cookies?.refreshToken; // 리프레시 토큰은 보통 쿠키로 관리

  if (!token) {
    return res.status(401).json({ message: '엑세스토큰이 존재하지 않습니다.' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // 엑세스 토큰 만료 시
      if (err.name === 'TokenExpiredError' && refreshToken) {
        console.log("refreshToken");
        // 리프레시 토큰 검증
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr, decoded) => {
          if (refreshErr) {
            return res.status(402).json({ message: '리프레시토큰이 유효하지 않거나 만료되었습니다.' });
          }

          // 새 엑세스 토큰 발급
          const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: process.env.ACCESS_TOKEN_EXPIRES });

          // 새 토큰을 응답 헤더에 포함 (또는 클라이언트에 반환)
          res.setHeader('Authorization', `Bearer ${newAccessToken}`);

          // 사용자 정보를 요청 객체에 추가하고 계속 진행
          req.user = decoded;
          return next();
        });
      } else {
        console.log("accessToken");
        return res.status(403).json({ message: '토큰이 유효하지 않거나 만료되었습니다.' });
      }
    } else {
      // 엑세스 토큰이 유효할 경우
      req.user = user;
      next();
    }
  });
};

// 특정 경로를 제외
authenticateToken.unless = unless;
export default authenticateToken;
