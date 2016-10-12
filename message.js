var http = require('http');
var https = require('https');
var fn = require('./functions.js');

exports.cmds = (bot, msg) => {
    // Commands
    if(msg.content == '!commands'){
        var text = `List of Commands: \n
            !ping - Replys Pong \n
            !toast - Prints Toast\n
            !slap @user - Slaps all mentioned users\n
            !insult (@user - optional) - Insults the sender or @user.\n
            !cat - Random Cat\n
            !boom - Roast your fellow users\n
            !to_C <#> - Converts Fahrenheit to Celsius\n
            !to_F <#> - Converts Celsius to Fahrenheit\n
            !time <TIMEZONE> - Returns current time in zone. Ex: !time CST`;
        
        // If on Milhound's Server add the following commands
        if(msg.guild.id == "167693566267752449"){
            text +=
            `\n 
            !gamer to add/remove Gamer role.\n
            !programmer to add/remove Programmer role.`;
        }
        msg.channel.sendMessage(text);        
    }

    // Gamer Command
    if(msg.content === '!gamer' && msg.guild.id === "167693566267752449"){
        fn.toggleRole(msg, "235440340981514240");
    }

    // Programmer Command
    if(msg.content === '!programmer' && msg.guild.id === "167693566267752449"){
        fn.toggleRole(msg, "235562658877800448");
    }

    // Mute Command
    if(msg.content.startsWith('!mute') && msg.guild.member(msg.author).hasPermission("MUTE_MEMBERS")){
        for(mention of msg.mentions.users.array()){
            console.log(msg.author.username + " has muted " + mention.username);
            msg.guild.member(mention).setMute(true);
            msg.reply(mention + " has been globally muted!");
        }
    }
    // Mute Command
    if(msg.content.startsWith('!unmute') && msg.guild.member(msg.author).hasPermission("MUTE_MEMBERS")){
        for(mention of msg.mentions.users.array()){
            console.log(msg.author.username + " has unmuted " + mention.username);
            msg.guild.member(mention).setMute(false);
            msg.reply(mention + " has been unmuted!");
        }
    }

    // Ping Command
    if(msg.content === '!ping'){
        console.log(msg.author.username + ' as used the ping command');
        msg.channel.sendMessage('pong');
    }

    // Slap Command
    if(msg.content.indexOf('!slap') >= 0 && msg.mentions.users.array().length >= 0) {
        console.log(msg.author.username  + ' used the slap command');
        for (mentioned of msg.mentions.users.array()){
            msg.channel.sendMessage(mentioned + " You've been SLAPPED!");
        }
        msg.delete;
    }

    // Cat Command
    if(msg.content == '!cat'){
        console.log(msg.author.username + ' used the !cat command.');
        // Get random cat
        var request = http.get('http://random.cat/meow', (response) => {
            response.on('data', (data) => {
                var json = JSON.parse(data);
                // Reply with the url from the json under "file"
                msg.reply(json.file);
                // Delete user's message to reduce clutter
                msg.delete;
            });
        });
    }

    // Insult Command
    if(msg.content.startsWith('!insult')){
      console.log(msg.author.username + ' used the insult command');
      for (mentioned of msg.mentions.users.array()) {
        // GET request for Quandry Factory API
        http.get('http://quandyfactory.com/insult/json', (response) => {
          var data = '';
          response.on('data', (chunk) => {
            // Add chunk of data to data variable
              data += chunk
          });
          response.on('end', () => {
            var json = JSON.parse(data);
            msg.channel.sendMessage(mentioned + ' ' + json.insult);
            msg.delete;
          });
        });
      }
    }

    // Celsius to Fahrenheit
    if (msg.content.startsWith('!to_F')){
        var args = msg.content.split(' ');
        if(args[1] && !args[2]){
            var C = args[1];
            // Round to whole number
            var F = (C * 1.8 + 32).toFixed(0);
            msg.reply(F);
        }
        console.log(msg.author.username + " used Cel to Far.");
    }

    // Fahrenheit to Celsius
    if (msg.content.startsWith('!to_C')){
        var args = msg.content.split(' ');
        if(args[1] && !args[2]){
            var F = args[1];
            // Round to whole number
            var C = ((F -32) * (5/9)).toFixed(0);
            msg.reply(C);
        }
        console.log(msg.author.username + " used Far to Cel.");
    }

    // Time
    if (msg.content.startsWith('!time')){
        var args = msg.content.split(' ');
        // Variable to confirm all calculations suceeded
        var goodTime = true;
        var date = new Date();
        var hour = date.getUTCHours();

        switch (args[1].toLowerCase()){
            //United States
            case 'pdt':
            case 'california':
                hour = hour -7;
                break;

            case 'mdt':
                hour = hour -6;
                break;

            case 'cdt':
            case 'texas':
                hour = hour - 5;
                break;

            case 'edt':
                hour = hour - 4;
                break;

            //Europe
            case 'west':
            case 'cet':
                hour = hour + 1;
                break;

            case 'cest':
            case 'sweden':
            case 'eet':
            case 'germany':
            case 'austria':
                hour = hour + 2;
                break;

            case 'eest':
            case 'finland':
                hour = hour + 3;
                break;

            case 'uk':
            default:
                // Allow users to do custom GMT/UTC timezones with GMT+1 as an example
                if(args[1].startsWith('GMT') || args[1].startsWith('UTC')){
                    if(args[1].startsWith('GMT')){
                        modifier = args[1].replace('GMT', '');
                    }else if(args[1].startsWith('UTC')){
                        modifier = args[1].replace('UTC', '');
                    }
                    // Grab the + or - from properly formated command
                    switch(modifier.slice(0,1)){
                        case '+':
                            hour = hour +  parseInt(modifier.slice(1));
                            break;
                        case '-':
                            hour = hour - parseInt(modifier.slice(1));
                            break;
                        default:
                        console.log('Incorrect format for time command used  ' + modifier);
                    }
                } else
                // Check if UK was passed
                if (args[1].toLowerCase() == 'uk') {
                    hour = hour;
                }else {
                    // All other checks failed, its is not a timezone currently in code.
                    msg.reply('Unknown Timezone.');
                    goodTime = false;
                    // Log passed timezone for a potential addition
                    console.log('Timezone not avaliable yet: ' + args[1]);
                }
        }
        if (hour < 0){
            hour = 12 + hour;
        }
        if (hour > 24){
            hour = hour - 24;
        }
        if (hour < 10){
            hour = "0" + hour;
        }
        var minutes = date.getUTCMinutes();
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        // Confirm all tasks are complete by adding a slight delay.
        setTimeout(()=>{
            if (goodTime){
                msg.reply(hour + ":" + minutes);
            }
        }, 500);
    }

    // Toast
    if (msg.content == '!toast'){
        msg.channel.sendMessage(`\`\`\`\n
        Toast!
              ______
         ____((     )_
        |\'->==))   (= \\
        |  \\ ||_____|_ \\
        |[> \\___________\\
        | | |            |                                    |
         \\  |            |             .--.                   |
          \\ |            |)---.   .---\'    \`-.         .----(]|
           \\|____________|     \`-'            \`.     .\'       |
                                                \`---\'         |
        \`\`\`
        `);
        msg.delete;
    }

    // Boom
    if(msg.content == '!boom'){
        var x = Math.floor(Math.random()*5+1);
        console.log(msg.author.username + ' used the boom command. (boom' + x + '.jpeg)');
        msg.channel.sendFile('./img/boom' + x + '.jpeg');
    }
}
