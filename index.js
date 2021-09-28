require('dotenv').config();
const { MessageEmbed, Client } = require('discord.js');
const DisTube = require('distube');
const PREFIX = '!!';

const client = new Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
});

const distube = new DisTube.default(client, { leaveOnStop: false });

client.once('ready', () => {
  console.log(`${client.user.username} Logged in!`);
  presence();
  distube.on('error', (channel, error) => {
    channel.send(`An error encoutered: ${error.message}`);
  });
});

/* 
!Todo : Valdiar cada comando para evitar crasheos del bot. Y validar distintos errores
!Todo: Agregar manejo de playlist:
!Todo: -Skip para las playlist
?Todo: Agregar sonido predeterminados por las acciones
!Todo: Abstraer logica del texto de ayuda para soportar distintos idiomas.
!Todo: Estilar con emojis los textos




*Todo: Agregar comnado para ver la queue
*Todo: Crear validaciones para utilizar el bot solo una vez inicializado en un canal especifico.
*Todo: Crear mensaje embebido que tenga la informacion de la cancion sonando.
*Todo: Creando mensajes embebidos para los comandos.
*Todo: Creando boilerplate para mensajes embebidos
*Todo: Agregar "estado de reproduccion" cuando suene una song, y cuando no suene nada dejar el texto de ayuda.
*/

const embedBoilerplate = ({
  title = '',
  description = '',
  color = '',
  footer = '',
}) => {
  const messageEmbed = new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter(footer);

  return { embeds: [messageEmbed] };

  // message.channel.send(
  //   embedBoilerplate({
  //     title: '',
  //     description: '',
  //     color: '',
  //     footer: `~${command}~`,
  //   })
  // );
};

const presence = (songName) => {
  songName
    ? client.user.setPresence({
        activities: [{ name: `${songName}` }],
        status: 'dnd',
      })
    : client.user.setPresence({
        activities: [{ name: `${PREFIX}help` }],
        status: 'online',
      });
};

let channelAuth = {
  id: '',
  auth: false,
};

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'auth' || command === 'a') {
    channelAuth = {
      id: message.channelId,
      auth: true,
    };

    await message.channel.send(
      embedBoilerplate({
        title: 'Comand: Auth!',
        description: `You autorized ${client.user.username}`,
        color: 'BLACK',
        footer: `~${command}~`,
      })
    );
  }

  if (message.channelId != channelAuth.id) {
    message.channel.send(`**The ${client.user.username} cannot be used here**`);
    return;
  }

  if (command === 'help' || command === 'h') {
    await message.channel.send(
      embedBoilerplate({
        title: `**Hi! I'm ${client.user.username} this are the commands: **`,
        description: `**${PREFIX}play** or **${PREFIX}p** : to play music by url or searching it\n
          **${PREFIX}stop** or **${PREFIX}s** : to stop music and disconect bot\n
          **${PREFIX}paus**e or **${PREFIX}pp** : to pause song\n
          **${PREFIX}resume** or **${PREFIX}r** : to resume song\n
          **${PREFIX}skip** or **${PREFIX}ss** : to skip song\n
          **${PREFIX}queue** or **${PREFIX}q** : to see the queue\n
          **${PREFIX}playing** or **${PREFIX}pl** : to watch the playback `,
        color: 'BLUE',
        footer: `~${command}~`,
      })
    );
  }

  if (command === 'puto')
    message.channel.send(`${message.author.username} es putooo`);

  //!todo: manejo de error para urls que no sirvan... *MEJORAR*
  if (command === 'play' || command === 'p') {
    try {
      args.length
        ? await distube.play(message, args.join(' '))
        : message.channel.send('Enter a url or search pls!');
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command === 'stop' || command === 's') {
    try {
      await distube.stop(message);

      await message.channel.send(
        embedBoilerplate({
          title: 'Comand: Stop!',
          description: 'Music stopped',
          color: 'RED',
          footer: `~${command}~`,
        })
      );
      presence();
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command === 'pause' || command === 'pp') {
    try {
      distube.pause(message);

      await message.channel.send(
        embedBoilerplate({
          title: 'Comand: Pause!',
          description: 'Music paused',
          color: 'YELLOW',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command === 'resume' || command === 'r') {
    try {
      distube.resume(message);
      await message.channel.send(
        embedBoilerplate({
          title: 'Comand: Resume!',
          description: 'Music resumed',
          color: 'GREEN',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command == 'skip' || command === 'ss') {
    try {
      await distube.skip(message);
      message.channel.send(
        embedBoilerplate({
          title: 'Comand: Skip!',
          description: 'Music Skipped',
          color: 'ORANGE',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command == 'queue' || command == 'q') {
    try {
      const queue = distube.getQueue(message);
      queue
        ? await message.channel.send(
            'Current queue:\n' +
              queue.songs
                .map(
                  (song, id) =>
                    `**${id + 1}**. [${song.name}](${song.url}) - \`${
                      song.formattedDuration
                    }\``
                )
                .join('\n')
          )
        : await message.channel.send(`**No current queue available**`);
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }

  if (command == 'playing' || command === 'pl') {
    try {
      const nameSong = await client.user.presence.activities.map(
        (activitie) => activitie.name
      );

      nameSong != `${PREFIX}help`
        ? await message.channel.send(
            embedBoilerplate({
              title: 'Comand: Playing',
              description: `=> Playing: ${nameSong}`,
              color: 'GREEN',
              footer: `~${command}~`,
            })
          )
        : await message.channel.send(
            embedBoilerplate({
              title: 'Comand: Playing',
              description: `=> Playing: None`,
              color: 'RED',
              footer: `~${command}~`,
            })
          );
    } catch (error) {
      message.channel.send(`**${error.message}**`);
    }
  }
});

distube.on('playSong', (_, song) => (song ? presence(song.name) : presence()));
distube.on('finishSong', () => presence());
// distube.on('disconnect',() => )

client.login(process.env.DISCORD_BOT_TOKEN);
