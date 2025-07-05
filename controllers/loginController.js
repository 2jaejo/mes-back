// require('dotenv').config();
// const pool = require('../config/db');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

import 'dotenv/config';  // dotenv를 ES 모듈 방식으로 import
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

import userService from '../services/userService.js';

// 토큰생성
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.user_id, name:user.user_nm }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
  const refreshToken = jwt.sign({ id: user.user_id, name:user.user_nm }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES});
  return { accessToken, refreshToken };
};


// 비밀번호 검증
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    console.error("Error comparing passwords:", err);
  }
};

const loginController = {
  validate: (req, res) => {
    console.log("validate");
    // 미들웨어 authenticateToken 에서 토큰 검증후 처리됨
    res.status(200).send();
   
  },
  
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      // 비밀번호 해시
      // const hashedPassword = await bcrypt.hash(password, 10);
      const params = [email];
      const user = await pool.query(
        `SELECT 
          a.*	
          , COALESCE(b.color, '#000000') as color 	
          , COALESCE(b.bg_color , '#ffffff') as bg_color 
        FROM public.tb_user as a 
        left join react.public.tb_theme b  on a.user_id = b.user_id 
        WHERE a.user_id = $1`
      , params);

      // 로그인 기록 수집
      const chk_pw = await comparePassword(password ,user.rows[0].user_pw);
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
      const agent = req.headers['user-agent'];
      const data = [user.rows[0].user_id, ip, agent, chk_pw];
       
      // 로그인 기록
      await userService.insertLog(data);

      console.log(user.rows[0]);
      console.log(chk_pw);

      if (chk_pw) {
        const { accessToken, refreshToken } = generateTokens(user.rows[0]);
        const result = {token: accessToken, user:user.rows[0]};

        // HTTP-Only 쿠키에 리프레시 토큰 저장
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,       // JavaScript로 접근 불가
          // secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 사용
          // sameSite: 'strict',   // SameSite 설정
          // maxAge: 7 * 24 * 60 * 60 * 1000 // 7일간 유효
        });


        res.status(200).json(result);
      }
      else{
        throw new Error("비밀번호를 확인하세요.");
      }
      
    } catch (error) {
      res.status(400).json(error.message);
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('refreshToken'); // 리프레시 토큰 쿠키 제거
      return res.status(200).json({ message: '로그아웃 성공.' });
    } catch (error) {
      res.status(400).json(error.message);
    }
  },

  join: async (req, res) => {
    try {

      // 비밀번호 해시
      // const hashedPassword = await bcrypt.hash(password, 10);

      const result = await userService.addUser(req);
      res.status(200).json(result);
      
      res.status(200).json();
      
    } catch (error) {
      res.status(400).json(error.message);
    }
  },
}

export default loginController;
