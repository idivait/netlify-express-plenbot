const moment = require('moment');

function parseDuration(dur){
    // ex format: '00m 18s 677ms'
    let regex = /(\d*)m\s(\d*)s\s(\d*)ms/
    let obj = dur.match(regex);
    let m = obj[1] > 0 ? `${obj[1]}m ` : '';
    let s = obj[2] > 0 ? `${obj[2]}s ` : '';
    let ms = obj[3] > 0 && !s ? `${obj[3]}ms ` : '';

    return `${m}${s}${ms}`;
}

function baseResponse(content, sEmbeds){

    let embeds = [];
    content = content || "";

    // If singular embed object, push it to an array
    if (sEmbeds.title) embeds.push(sEmbeds);
    if (Array.isArray(sEmbeds)) embeds = sEmbeds;

    let response = {
        "content" : content,
        "embeds" : embeds
    };

    return response;
    
}

function baseEmbed(opts) {

    if (!opts) opts = {};
    let { color, title, author, description, fields } = opts;

    let embed =  {
        "color": color || 2451166,
        "title": title || `New Log`,
        "author": {
            "name": author || 'Lythiea'
        },
        "description": description || "",
        "fields": fields || [],
        "timestamp": new Date(),
    }

    return embed;
}

function baseField(name, value, inline) {
    if (!name || !value) return;
    return {
        "name" : name,
        "value" : value,
        "inline" : inline
    }
}

function embedFromDR(response, permalink){

    let {
        recordedBy,
        timeStart,
        duration,
        players
    } = response.data;
    let start = moment(timeStart, "YYYY-MM-DD HH:mm:ss Z");
    let squadCount = players.length;
    let groupCount = players.reduce(function (total, currentValue) {
        total[currentValue.group]++;
        if (!total[currentValue.group]) {
            total[currentValue.group] = 1;
        }
        return total;
    }, {});
    duration = parseDuration(duration);

    let embed = baseEmbed();
    embed.author.name = recordedBy;
    embed.fields.push( baseField( "URL", permalink, false ) );
    embed.fields.push( baseField( "Started", start.format("ddd, h:mmA"), true ) );
    embed.fields.push( baseField( "Dur", duration, true ) )
    embed.fields.push( baseField( "Parties", Object.keys(groupCount).length, true ) );
    embed.fields.push( baseField( "Players", squadCount, true ) )

    return embed;

}

module.exports.embedFromDR = embedFromDR;
module.exports.baseResponse = baseResponse;