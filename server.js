const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')

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
    const poll = await msg.channel.send(`${msg.author.username} wants to jail ${taggedUser.username}: "${reason}"`)
        .then(async voteMessage => {
            try {
                await voteMessage.react('👍')
                await voteMessage.react('👎')
            } catch(err) {
                console.error('One of the emojis failed to react.')
            }
        })

    const usedEmojis = Object.keys('👍', '👎')
    const reactionCollector = poll.createReactionCollector(
        (reaction, user) => usedEmojis.includes(reaction.emoji.name) && !user.bot,
        time = 5
    )

    const voterInfo = new Map()
    reactionCollector.on('collect', (reaction, user) => {
        if(userdEmohius.inclues(reaction.emoji)) {
            if(!voterInfo.has(user.id)) voterInfo.set(user.id, { emoji: reaction.emoji.name })
            const votedEmoji = voterInfo.get(user.id).emoji
            emojiInfo[reaction.emoji.name].votes += 1
        }
    })

    reactionCollector.on('dispose', (reaction, user) => {
        if(usedEmojis.includes(reaction.emoji.name)) {
            voterInfo.delete(user.id)
            emojiInfo[reaction.emoji.name].voteMessage -= 1;
        }
    })

    reactionCollector.on('end', () => {
        let voteCount
		for(const emoji in emojiInfo) {
            voteCount += `\`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes}\`\n\n`;
        }
		poll.delete();
		msg.channel.send(`Time\'s up!\n ${voteCount}`);
	});
}

client.login(config.token)