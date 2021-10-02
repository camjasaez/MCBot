require('dotenv').config();
const { MessageEmbed, Client, Collection } = require('discord.js');
const DisTube = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const PREFIX = '!!';

const client = new Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
});

const distube = new DisTube.default(client, {
  leaveOnStop: false,
  plugins: [new SpotifyPlugin()],
});
client.commands = new Collection();
client.once('ready', () => {
  console.log(`${client.user.username} Logged in!`);
  presence();
  distube.on('error', (channel, error) => {
    channel.send(`An error encoutered: ${error.message}`);
  });
});

/* 

!Todo : Valdiar cada comando para evitar crasheos del bot. Y validar distintos errores
?Todo: Agregar sonido predeterminados por las acciones
!Todo: Abstraer logica del texto de ayuda para soportar distintos idiomas.

todoing: Arreglar eventos del distube ( playSong, blabla)

* todo: Agragar compatibilidad con spotify
* Estilar con emojis los textos
* Agregar comnado para ver la queue
* Crear validaciones para utilizar el bot solo una vez inicializado en un canal especifico.
* Crear mensaje embebido que tenga la informacion de la cancion sonando.
* Creando mensajes embebidos para los comandos.
* Creando boilerplate para mensajes embebidos
* Agregar "estado de reproduccion" cuando suene una song, y cuando no suene nada dejar el texto de ayuda.

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

    console.log(client.commands);

    await message.channel.send(
      embedBoilerplate({
        title: `:white_check_mark: Comand: Auth!`,
        description: ` You autorized ${client.user.username}`,
        color: 'BLACK',
        footer: `~${command}~`,
      })
    );
  }

  if (message.channelId != channelAuth.id) {
    message.channel.send(
      `:x: **The ${client.user.username} cannot be used here**`
    );
    return;
  }
  // :arrow_forward: :pause_button: :stop_button: :track_next:
  if (command === 'help' || command === 'h') {
    await message.channel.send(
      embedBoilerplate({
        title: `**Hi! I'm ${client.user.username} this are the commands: ** :face_with_monocle: `,
        description: `:arrow_forward: **${PREFIX}play** or **${PREFIX}p** : to play music by url or searching it\n
        :stop_button: **${PREFIX}stop** or **${PREFIX}s** : to stop music and disconect bot\n
        :pause_button: **${PREFIX}paus**e or **${PREFIX}pp** : to pause song\n
        :arrow_forward:  **${PREFIX}resume** or **${PREFIX}r** : to resume song\n
        :track_next: **${PREFIX}skip** or **${PREFIX}ss** : to skip song\n
        :asterisk: **${PREFIX}queue** or **${PREFIX}q** : to see the queue\n
        :musical_note: **${PREFIX}playing** or **${PREFIX}pl** : to watch the playback\n
         :green_circle: ** Spotify and ** :red_circle: **Youtube support!** `,
        color: 'BLUE',
        footer: `~${command}~`,
      })
    );
  }

  if (command === 'puto')
    message.channel.send(`${message.author.username} es putooo`);

  //!todo: manejo de error para urls que no sirvan... *MEJORAR*
  //todo: mostrar lo que se reproduce
  if (command === 'play' || command === 'p') {
    try {
      args.length
        ? await distube.play(message, args.join(' '))
        : message.channel.send('Enter a url or search pls!');
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }

  if (command === 'stop' || command === 's') {
    try {
      await distube.stop(message);

      await message.channel.send(
        embedBoilerplate({
          title: `:stop_button: Comand: Stop!`,
          description: 'Music stopped',
          color: 'RED',
          footer: `~${command}~`,
        })
      );
      presence();
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }

  if (command === 'pause' || command === 'pp') {
    try {
      distube.pause(message);

      await message.channel.send(
        embedBoilerplate({
          title: `:pause_button: Comand: Pause!`,
          description: 'Music paused',
          color: 'YELLOW',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }

  if (command === 'resume' || command === 'r') {
    try {
      distube.resume(message);
      await message.channel.send(
        embedBoilerplate({
          title: `:arrow_forward: Comand: Resume!`,
          description: 'Music resumed',
          color: 'GREEN',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }

  if (command == 'skip' || command === 'ss') {
    try {
      await distube.skip(message);
      message.channel.send(
        embedBoilerplate({
          title: `:track_next: Comand: Skip!`,
          description: 'Music Skipped',
          color: 'ORANGE',
          footer: `~${command}~`,
        })
      );
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }

  if (command == 'queue' || command == 'q') {
    try {
      const queue = distube.getQueue(message);
      queue
        ? await message.channel.send(
            `:asterisk: Current queue:\n` +
              queue.songs
                .map(
                  (song, id) =>
                    `**${id + 1}**. [${song.name}](${song.url}) - \`${
                      song.formattedDuration
                    }\``
                )
                .join('\n')
          )
        : await message.channel.send(`**No current  queue available**`);
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
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
              title: `:musical_note: Comand: Playing`,
              description: `=> Playing: ${nameSong}`,
              color: 'GREEN',
              footer: `~${command}~`,
            })
          )
        : await message.channel.send(
            embedBoilerplate({
              title: `:musical_note: Comand: Playing`,
              description: `=> Playing: None`,
              color: 'RED',
              footer: `~${command}~`,
            })
          );
    } catch (error) {
      message.channel.send(`:x: **${error.message}**`);
    }
  }
});

distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`Playing \`${song.name}\``);
    song ? presence(song.name) : presence();
  })
  .on('finishSong', () => presence());
// distube.on('disconnect',() => )

client.login(process.env.DISCORD_BOT_TOKEN);
