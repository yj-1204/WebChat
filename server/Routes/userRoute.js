const express = require('express')
const {registerUser, loginUser, findUser,getUser} = require('../Controllers/useController')

const router = express.Router()

router.post('/register', registerUser);
router.post('/login',loginUser)
router.get('/find/:userId',findUser)
router.get('/',getUser)

module.exports = router;