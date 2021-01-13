const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/jailbot', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection

db.on('error', console.error.bind(console, 'db connection error:'))

let Prison
db.once('open', function () {
    console.log('Successfully connected to database')
    var prisonerSchema = mongoose.Schema({
        userid: String,
        username: String,
        jails: Number,
        versionKey: false
    })
    Prison = mongoose.model('Prison', prisonerSchema)
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', msg => {
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return; // exit out early
    
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    if(command === `jail`) {
        if (!msg.mentions.users.size) { // ensure a user is tagged
            return msg.reply('you need to tag a user in order to vote on them! \n use the following syntax: !jail <user> <reason>')
        } else if(msg.mentions.users.size > 1){ // ensure only one user is tagged
            return msg.reply('you can only vote on one user at a time! \n use the following syntax: !jail <user> <reason>')
        } else if (!args[0].match(/<@![0-9]*>/)) { // ensure tagged user matches correct format
            return msg.reply('first argument must be a user in this server! \n use the following syntax: !jail <user> <reason>')
        } else {
            sendVoteMessage(msg, args)
        }
    }
})

async function sendVoteMessage(msg, args) {
    const taggedUser = msg.mentions.users.first();
    var reason = ''
    for(i = 1; i < args.length - 1; i++) {
        reason += args[i] + ' '
    }
    reason += args[args.length - 1]
    await msg.channel.send(`${msg.author} wants to jail ${taggedUser}\u0060\u0060\u0060CS\n# Reason: \n'${reason}'\n// This vote will end in ${config.timeout} milliseconds.\n\u0060\u0060\u0060@here`)
        .then(async poll => {
            try {
                await poll.react('👍')
                await poll.react('👎')
                const filter = (reaction) => {
                    return reaction.emoji.name === '👍' || reaction.emoji.name === '👎'
                }
                poll.awaitReactions(filter, { time: config.timeout })
                    .then(collected => {
                        console.log(`Collected ${collected.size} reactions`)
                        if(collected.size > 0) {
                            var thumbsUp = 0
                            var thumbsDown = 0
                            if(collected.get('👍') != null) thumbsUp = collected.get('👍').count
                            if(collected.get('👎') != null) thumbsDown = collected.get('👎').count
                            if(thumbsUp > thumbsDown) {
                                jailUser(taggedUser)
                                poll.channel.send(`${taggedUser.username} has been jailed!`)
                            } else {
                                poll.channel.send(`${taggedUser.username} has not been jailed.`)
                            }
                        }
                    })
                    .catch(console.error)
            } catch(err) {
                console.error('One of the emojis failed to react.')
            }
        })
}

async function jailUser(user) {
    console.log(`Jailing user: ${user.username}`)
    let docs = await Prison.find({userid: userid }).countDocuments().then(docs => { docs; })
    console.log(docs)
    // var newPrisoner = new Prisoner({ userid: user.userid, username: user.username, jails: 1})
    // newPrisoner.save(function (err, prisoner) {
    //     if(err) return console.error(err)
    //     console.log(`Jailed user: ${prisoner.username}`)
    // })
}

client.login(config.token)