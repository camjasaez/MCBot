require('dotenv').config();
const Discord = require('discord.js');
const DisTube = require('distube');
const PREFIX = '!!';

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
});
const distube = new DisTube.default(client);
client.once('ready', () => {
  console.log(`${client.user.username} Logged in!`);

  distube.on('error', (channel, error) => {
    console.error(error);
    channel.send(`An error encoutered: ${error.slice(0, 1979)}`); // Discord limits 2000 characters in a message
  });
});

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'help' || command === 'h') {
    message.channel.send(
      `Hi! I'm ${client.user.username} this are the commands: \n
       .play or .p : to play music by url or searching it\n
       .stop or .s : to stop music and disconect bot\n`
    );
  }
  if (command === 'puto') {
    message.channel.send('Tu madre!');
  }

  if (command === 'play' || command === 'p') {
    args.length
      ? distube.play(message, args.join(' '))
      : message.channel.send('Enter a url or search pls!');
  }

  if (command === 'stop' || command === 's') {
    distube.stop(message);
    message.channel.send('Stopped!');
  }

  if (command === 'pause' || command === 'pp') {
    distube.pause(message);
    message.channel.send('Song paused!');
  }

  if (command === 'resume' || command === 'r') {
    distube.resume(message);
    message.channel.send('Restarting the song!');
  }

  if (command == 'skip' || command === 'ss') distube.skip(message);
});

client.login(process.env.DISCORD_BOT_TOKEN);
