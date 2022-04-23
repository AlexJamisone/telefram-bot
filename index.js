const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./optionce')
const sequelize = require('./db')
const UserModel = require('./models');
const User = require('./models');

const token = '5338589596:AAGVeZKGId78XBOhFt7_klE7p2nU5GWvbV8';
const bot = new TelegramApi(token, {polling: true})

const chats = {};



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадвай', gameOptions)
}

const start = async () => {


    try {

        await sequelize.authenticate()
        await sequelize.sync()

    } catch (e) {
        console.log('Поднлючение к бд сломалось', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветсиве'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра в угадай число'},
    ])
    
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id

        try {

            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.jpg')
                return bot.sendMessage(chatId, `Добро пожаловать в телеграмм бот Jamison`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ответов ${user.wrong}`)
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз')
            
        } catch (error) {
            return bot.sendMessage(chatId, `Произошла какая то ошибка`)
        }
        
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
             return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if(data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю ты отгадал, бот загадал цифру ${chats[chatId]}, в игре у тебя правильных ответов ${user.right}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `К сожелению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start()