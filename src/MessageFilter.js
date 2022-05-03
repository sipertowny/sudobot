const MessageEmbed = require("./MessageEmbed");

module.exports = class MessageFilter {
    load() {
        this.config = app.config.get('filters');
    }

    async filterBlockedWords(msg) {
        if (!this.config.words_enabled) 
            return true;
        
        if (this.config.words_excluded.indexOf(msg.channel.id) !== -1 || this.config.words_excluded.indexOf(msg.channel.parent?.id) !== -1) 
            return true;

        if (!this.config.regex)
            var wordsList = msg.content.toLowerCase().split(/\s+/);

        for (let word of this.config.words) {
            if (this.config.regex) {
                const matches = msg.content.match(new RegExp(word, 'gmi'));
            
                if (matches && matches?.length > 0) {
                    return {
                        word: matches[0],
                        all: matches
                    }
                };
            }
            else if (wordsList.filter(w => w === word.trim()).length > 0) {
                return {
                    word: word,
                    all: [word]
                }
            }
        }

        return true;
    }

    async filterInvites(msg, callback) {
        console.log(0);

        if (!this.config.invite_enabled) 
            return true;

        if (this.config.invite_excluded.indexOf(msg.channel.id) !== -1 || this.config.invite_excluded.indexOf(msg.channel.parent?.id) !== -1) 
            return true;

        const matches = msg.content.match(/(http(s)?\:\/\/)?(discord\.gg|discord\.com\/invite)\/([A-Za-z0-9-_]+)/gmi);

        console.log(matches);

        if (matches && matches.length > 0) {
           try {
                const invites = await msg.guild.invites.fetch();

                console.log(1);

                if (!invites.size) {
                    callback(matches);
                    console.log(2);
                    return;
                }

                for (let match of matches) {
                    let code = match.split('/');
                    code = code[code.length - 1];

                    let filtered = await invites.has(code.trim());

                    console.log(3);
                        
                    if (!filtered) {
                        console.log('yes');
                        callback(matches);
                        return;
                    }
                }
           }
           catch(e) {
                console.log(e, 'here');
           }
        }
    }

    async start(msg, cm) {
        this.load();

        if (this.config.ignore_staff && msg.member.roles.cache.has(app.config.get('mod_role')))
            return;
        
        const blockedPass = await this.filterBlockedWords(msg, cm);

        await this.filterInvites(msg, async (matches) => {
            // if (bool !== true) {
                 await msg.delete();
     
                 const content = this.config.invite_message.replace(':mention:', `<@${msg.author.id}>`);
     
                 await msg.channel.send({
                     content
                 });
     
                 try {
                     const channel = await msg.guild.channels.fetch(app.config.get('logging_channel'));
     
                     await channel.send({
                         embeds: [
                             new MessageEmbed()
                             .setColor('#f14a60')
                             .setAuthor({
                                 name: msg.author.tag,
                                 iconURL: msg.author.displayAvatarURL()
                             })
                             .setTitle(`Posted invite(s)`)
                             .addFields([
                                 {
                                     name: "URL",
                                     value: '`' + matches.join('` `') + '`'
                                 },
                             ])
                             .setFooter({
                                 text: "Deleted"
                             })
                             .setTimestamp()
                         ]
                     });
                 }
                 catch(e) {
                     console.log(e);
                 }
           //  }
         });

        if (blockedPass === true)
            return;
        else if (blockedPass !== true) {
            try {
                await msg.delete();
                const channel = await msg.guild.channels.fetch(app.config.get('logging_channel'));

                await channel.send({
                    embeds: [
                        new MessageEmbed()
                        .setColor('#f14a60')
                        .setAuthor({
                            name: msg.author.tag,
                            iconURL: msg.author.displayAvatarURL()
                        })
                        .setTitle(`Blocked words detected`)
                        .addFields([
                            {
                                name: "Word",
                                value: "||" + blockedPass.word + "||"
                            },
                        ])
                        .setFooter({
                            text: "Deleted"
                        })
                        .setTimestamp()
                    ]
                });
            }
            catch(e) {
                console.log(e);
            }
        }
    }
};