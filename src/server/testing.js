// CSCI2720 & ESTR2106
// Group 32,
// Group menbers:
// WEN Ruizhe 1155141547,
// XIE Junjie 1155141613,
// YU Sihong 1155141630,
// GU Zhehao 1155141578,
// YU Heyang 1155141480,
// CHEN Weiyu 1155141421.

// We have read this article carefully:
// http://www.cuhk.edu.hk/policy/academichonesty.

// handle requests from login interface

const express = require("express");
const router = express.Router();

const cors = require('cors');
router.use(cors());

const parseString = require('xml2js').parseString;

// if your cookie is not admin, return warning!
router.all("/*", (req, res, next) => {
    console.log('login process');
    res.set('Content-Type', 'plain/text');
    next();
})

    //console.log('Admin Connecting')
    router.post('/test', (req, res) => {

        username = req.body['username'];
        userpwd = req.body['userpwd'];
        alert(username);
    })

module.exports = router;