const { Op } = require('sequelize')
const { UserDetails, ServerError } = require('../utils/Utils')

const Users = require('../models').users
const Room = require('../models').rooms
const Message = require('../models').messages
const Problems = require('../models').problems

exports.CreateRoom = async (req, res) => {
    try {
        // const findAdmin = Users.findOne({ where: { role: 'admin' } })
        const { receiver } = req.body
        if (!receiver) return res.json({ status: 404, msg: 'Room ID is required.' })
        const msgsender = req.user
        let room, stat;
        const getRoom = await Room.findOne({
            where:
            {
                [Op.or]: [
                    { sender: msgsender, receiver: receiver, status:'active' },
                    { sender: receiver, receiver: msgsender, status:'active' },
                ]
            }
        })

        if (!getRoom) {
            room = await Room.create({ sender: msgsender, receiver, admin: receiver, status: 'active' }),
                stat = 'new'
        } else {
            room = getRoom,
                stat = 'exists'
        }
        return res.json({ status: 200, msg: stat === 'new' ? 'Room created successfully' : 'Room already exists', id: room.id, stat })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.DeleteRoom = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) return res.json({ status: 404, msg: 'Room ID is required.' })
        const FindChatId = await Room.findOne({ where: { id } })
        if (!FindChatId) return res.json({ status: 404, msg: 'This chat does not exist.' })
        const findUser = await Users.findOne({ where: { id: req.user } })
        if (!findUser) return res.json({ status: 404, msg: 'Unauthorized access' })
        await FindChatId.destroy()
        return res.json({ status: 200, msg: 'Room deleted successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.SendChat = async (req, res) => {
    try {
        const { content, roomid } = req.body
        if (!content || !roomid) return res.json({ status: 404, msg: 'Incomplete message request.' })
        const findroom = await Room.findOne({ where: { id: roomid } })
        if (!findroom) return res.json({ status: 404, msg: "Room doesn't exist" })
        await Message.create({ roomid, content, sender: req.user })
        return res.json({ status: 200, msg: 'message delivered successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.SendProbChat = async (req, res) => {
    try {
        const { firstname, lastname, issues, details, roomid } = req.body
        if (!firstname || !lastname || !issues || !roomid) return res.json({ status: 404, msg: 'Incomplete message request.' })
        const findroom = await Room.findOne({ where: { id: roomid } })
        if (!findroom) return res.json({ status: 400, msg: 'Room id not found' })
        await Problems.create({
            room: roomid,
            firstname,
            lastname,
            issues,
            details,
            sender: req.user
        })
        return res.json({ status: 200, msg: 'message sent successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.fetchProbChats = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) return res.json({ status: 404, msg: 'Room id is missing' })
        const prob = await Problems.findOne({ where: { room: roomid } })
        if (!prob) return res.json({ status: 404, msg: 'No details found' })
        return res.json({ status: 200, msg: 'fetched successfully', data: prob })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.fetchRoomChats = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) return res.json({ status: 404, msg: 'Please provide a room ID' })
        const findRoom = await Room.findOne({
            where: { id: roomid },
            include: [
                { model: Message, as: 'messages' }

            ],
        })

        let friend;
        if (findRoom.sender === req.user) {
            friend = findRoom.receiver
        } else {
            friend = findRoom.sender
        }
        const details = { ...findRoom.toJSON(), sender: friend }

        return res.json({ status: 200, msg: 'fetched successfully', data: details })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.fetchRooms = async (req, res) => {
    const excludes = ['password', 'last_login', 'reset_code', 'role', 'createdAt', 'updatedAt', 'email_verified', 'kyc_status']
    try {
        const findActiverooms = await Room.findAll({
            where: {sender:req.user, status: 'active' },
            include: [
                {
                    model: Users, as: 'friend', attributes: { exclude: excludes }
                }
            ]
        })
        if (!findActiverooms) return res.json({ status: 404, msg: 'Rooms not found' })
        return res.json({ status: 200, msg: 'rooms fetch successfully', data: findActiverooms })
    } catch (error) {
        ServerError(res, error)
    }
}
exports.fetchInactiveRooms = async (req, res) => {
    const excludes = ['password', 'last_login', 'reset_code', 'role', 'createdAt', 'updatedAt', 'email_verified', 'kyc_status']
    try {
        const findInativerooms = await Room.findAll({
            where: {sender:req.user, status: 'inactive' },
            include: [
                {
                    model: Users, as: 'friend', attributes: { exclude: excludes }
                }
            ]
        })
        if (!findInativerooms) return res.json({ status: 404, msg: 'Rooms not found' })
        return res.json({ status: 200, msg: 'rooms fetch successfully', data: findInativerooms })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.fetchUnreadmessages = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) return res.json({ status: 404, msg: 'Room ID is required' })
        const findroom = await Room.findOne({ where: { id: roomid } })
        if (!findroom) return res.json({ status: 404, msg: 'Room ID not found' })
        const findunread = await Message.findAll({ where: { status: 'unread', roomid: roomid } })
        if (!findunread) return res.json({ status: 404, msg: 'No unread messages found' })
        return res.json({ status: 200, msg: 'fetched successfully', data: findunread })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.TurnUnreadToread = async (req, res) => {
    try {
        const { roomid } = req.body
        if (!roomid) return res.json({ status: 404, msg: 'Room ID is required' })
        const findroom = await Room.findOne({ where: { id: roomid } })
        if (!findroom) return res.json({ status: 404, msg: 'Room ID not found' })
        const findunread = await Message.findAll({ where: { status: 'unread', roomid: roomid } })
        if (!findunread || findroom.length === 0) return res.json({ status: 404, msg: 'No unread messages found' })
        for (const msg of findunread) {
            msg.status = 'read';
            await msg.save()
        }
        return res.json({ status: 200, msg: 'All messages marked as read successfully', data: findunread })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.TurnChatsInactive = async (req, res) => {
    try {
        const { roomid } = req.body
        if (!roomid) return res.json({ status: 404, msg: 'Room ID is required' })
        const findRoom = await Room.findOne({ where: { id: roomid } })
        if (!findRoom) return res.json({ status: 404, msg: 'Room not found' })
        findRoom.status = 'inactive'
        await findRoom.save()
        return res.json({ status: 200, msg: 'Room inactivated successfully' })
    } catch (error) {
        ServerError(res, error)
    }
}
exports.getInactiveMessages = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            where: { status: 'inactive' },
            include: [
                {
                    model: Message, as: 'messages'
                }
            ]
        })
        return res.json({status:200, msg:'fetched successfully', data:rooms})
    } catch (error) {
        ServerError(res, error)
    }
}