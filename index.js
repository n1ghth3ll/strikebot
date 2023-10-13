(async()=>{
    // default imports
    const events = require('events');
    const { exec } = require("child_process")
    const logs = require("discord-logs")
    const Discord = require("discord.js")
    const { 
        MessageEmbed, 
        MessageButton, 
        MessageActionRow, 
        Intents, 
        Permissions, 
        MessageSelectMenu 
    }= require("discord.js")
    const fs = require('fs');
    let process = require('process');
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // block imports
    let https = require("https")
    const Database  = require("easy-json-database")
    
    // define s4d components (pretty sure 90% of these arnt even used/required)
    let s4d = {
        Discord,
        fire:null,
        joiningMember:null,
        reply:null,
        player:null,
        manager:null,
        Inviter:null,
        message:null,
        notifer:null,
        checkMessageExists() {
            if (!s4d.client) throw new Error('You cannot perform message operations without a Discord.js client')
            if (!s4d.client.readyTimestamp) throw new Error('You cannot perform message operations while the bot is not connected to the Discord API')
        }
    };

    // check if d.js is v13
    if (!require('./package.json').dependencies['discord.js'].startsWith("^13.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord.js'] = '^13.16.0'
      fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
      exec('npm i')
      throw new Error("Seems you arent using v13 please re-run or run `npm i discord.js@13.16.0`");
    }

    // check if discord-logs is v2
    if (!require('./package.json').dependencies['discord-logs'].startsWith("^2.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord-logs'] = '^2.0.0'
      fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
      exec('npm i')
      throw new Error("discord-logs must be 2.0.0. please re-run or if that fails run `npm i discord-logs@2.0.0` then re-run");
    }

    // create a new discord client
    s4d.client = new s4d.Discord.Client({
        intents: [
            Object.values(s4d.Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)
        ],
        partials: [
            "REACTION", 
            "CHANNEL"
        ]
    });

    // when the bot is connected say so
    s4d.client.on('ready', () => {
        console.log(s4d.client.user.tag + " is alive!")
    })

    // upon error print "Error!" and the error
    process.on('uncaughtException', function (err) {
        console.log('Error!');
        console.log(err);
    });

    // give the new client to discord-logs
    logs(s4d.client);

    // pre blockly code
    s4d.database = new Database('./database.json')

    // blockly code
    var member_xp, member_level;
    
    
    await s4d.client.login('MTE2MjUxNDE4MjM5MDk0Mzc0NA.GJtpp0.H-pUHoc1zbzYBb9iMGD623mo6m6L9VXeu56Gfs').catch((e) => {
            const tokenInvalid = true;
            const tokenError = e;
            if (e.toString().toLowerCase().includes("token")) {
                throw new Error("An invalid bot token was provided!")
            } else {
                throw new Error("Privileged Gateway Intents are not enabled! Please go to https://discord.com/developers and turn on all of them.")
            }
        });
    
    s4d.client.on('messageCreate', async (s4dmessage) => {
      if (!((s4dmessage.author).bot)) {
        member_xp = s4d.database.get(String(('xp-' + String(s4dmessage.member.id))));
        member_level = s4d.database.get(String(('level-' + String(s4dmessage.member.id))));
        if (!member_xp) {
          member_xp = 0;
        } else if (!member_level) {
          member_level = 0;
        }
        s4d.database.set(String(('xp-' + String(s4dmessage.member.id))), (member_xp + 1));
        member_xp = member_xp + 1;
        if (member_xp > 100) {
          s4d.database.set(String(('xp-' + String(s4dmessage.member.id))), 0);
          s4d.database.set(String(('level-' + String(s4dmessage.member.id))), (member_level + 1));
          member_level = member_level + 1;
          s4dmessage.channel.send({content:String((['Congratulations, ',s4dmessage.author,'you jumped to level ',member_level,'!!'].join('')))});
        }
        if ((s4dmessage.content) == '!level') {
          s4dmessage.channel.send({content:String(([s4dmessage.author,', you are currently level: ',member_level].join('')))});
        } else if ((s4dmessage.content) == '!xp') {
          s4dmessage.channel.send({content:String(([s4dmessage.author,', you need ',100 - member_xp,' to jump to level ',member_level + 1].join('')))});
        }
      }
    
    });
    
    return s4d
})();
