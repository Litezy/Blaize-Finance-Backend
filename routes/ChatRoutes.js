const { CreateRoom, DeleteRoom, SendChat, fetchRoomChats, fetchProbChats, SendProbChat, fetchRooms, fetchInactiveRooms, fetchUnreadmessages, TurnUnreadToread, TurnChatsInactive, getInactiveMessages } = require('../controllers/ChatsController');
const { userMiddleware } = require('../middleware/auth');

const router = require('express').Router()
router.post('/create-room', userMiddleware, CreateRoom)
router.post('/delete-room', userMiddleware, DeleteRoom)
router.get('/fetch-msgs/:roomid', userMiddleware, fetchRoomChats)
router.post('/send-chat', userMiddleware, SendChat)
router.get('/probs/:roomid', userMiddleware, fetchProbChats)
router.post('/send-prob', userMiddleware, SendProbChat)
router.get('/fetch-active-rooms', userMiddleware, fetchRooms)
router.get('/inactive-msgs', userMiddleware, getInactiveMessages)
router.get('/fetch-unread/:roomid', userMiddleware, fetchUnreadmessages)
router.get('/fetch-inactive-rooms', userMiddleware,fetchInactiveRooms)
router.post('/read', userMiddleware,TurnUnreadToread)
router.post('/inactivate-chats', userMiddleware, TurnChatsInactive)
module.exports = router;