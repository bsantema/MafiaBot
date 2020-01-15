const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!')
})

let queue = []
let votes = [] //List of users who have been voted for (can have duplicates)
let votesCast = [] //List of users who have already voted, parallel with votes
let voteCounts = [0, 0, 0, 0, 0, 0] //Parallel with queue, vote totals for each player
let gameStarted = false;
let mafia = 0
let votingOver = false;

client.on('message', message => {
    //console.log(message.content);

    if(message.content.startsWith(`${prefix}help`)) {
        message.channel.send("!q: Join the queue\n!l: Leave the queue\n!status: See all members in the current game or current queue")
    }

    if(message.content.startsWith(`${prefix}q`)) {
        if(queue.length<6 && queue.indexOf(message.author)<0)
        {
            queue.push(message.author)
            message.channel.send(message.author + " has joined the queue!")
            if(queue.length==6)
            {
                // GAME START
                gameStarted=true
                votes = []
                mafia = Math.random() * 6;
                queue.forEach(function(item, index, array) {
                    if(index != mafia)
                        item.sendMessage("Game is starting!\nYour role is VILLAGER. Try to win the game.\nAt the end, if you vote for the mafia you get 1 point.\nType !v @user in the main channel after the game is over to cast your vote.")
                    else
                        item.sendMessage("Game is starting!\nYour role is MAFIA. To win, you must lose the game and go undetected (less than 3 votes).\nYou get 3 points for winning.\nType !v @user in the main channel after the game is over to cast your vote.")
                })
            }
        }
        else if(queue.length > 5)
        {
            message.channel.send("Game already started.")
        }
        else
            message.channel.send(message.author + " is already in the queue.")
        
    }

    if(message.content.startsWith(`${prefix}v`)) {
        if(gameStarted)
        {
            vote = message.mentions.users.first();
            if(vote!=null && queue.indexOf(vote)>-1 && queue.indexOf(message.author>-1) && votesCast.indexOf(message.author)<0)
            {
                votesCast.push(message.author)
                votes.push(vote)
                if(votes.length==5)
                    message.channel.send(message.author + " has cast their vote for " + vote + ".\n" + (6-votes.length) + " vote remains.")
                else
                    message.channel.send(message.author + " has cast their vote for " + vote + ".\n" + (6-votes.length) + " votes remain.")
            }
            if(votes.length > 5)
            {
                //count mafia votes
                queue.forEach(function(player, playerIndex, array) {
                    votes.forEach(function(item, index, array) {
                        if(player == item)
                            voteCounts[playerIndex]++
                    })
                })
                
                max=0
                maxIndex=0
                votes.forEach(function(item, index, array) {
                    if (item>max)
                    {
                        max=item
                        maxIndex=index
                    }
                        
                })
                
                maxCount=0
                votes.forEach(function(item, index, array) {
                        if(item==max)
                            maxCount++
                })

                if(maxCount==1) //Majority vote, mafia possibly detected
                {
                    message.channel.send("There is a majority vote for " + queue[maxIndex] + ".")
                    if(maxIndex == mafia) 
                    {
                        //MAFIA DETECTED
                        message.channel.send("The mafia was " + queue[mafia]+"! Villagers win!")
                    }
                    else
                        message.channel.send("Oof, the mafia was " + queue[mafia]+". Mafia must now use command !win or !loss.")//Majority vote for someone else
                }
                else //Tie, mafia undetected
                {
                    message.channel.send("Tie vote, mafia goes undetected!")
                    message.channel.send("Oof, the mafia was " + queue[mafia]+". Mafia must now use command !win or !loss.")
                }

                votingOver = true;

                
            }
        }
        else
            message.channel.send("Game not started!")
        
    }
    if(message.content.startsWith(`${prefix}win`)) {
        if(votingOver && message.author == queue[mafia])
        {
            message.channel.send("The mafia won the game and went undetected, so the mafia wins!")
            //TODO: Assign points
            votingOver = false
            gameStarted = false
            votesCast = []
            voteCounts = [0, 0, 0, 0, 0, 0] 
            mafia = 0
            queue = []
            votes = []
        }
    }

    if(message.content.startsWith(`${prefix}loss`)) {

        if(votingOver && message.author == queue[mafia])
        {
            message.channel.send("The mafia lost the game, so the villagers win!")
            //TODO: Assign points
            votingOver = false
            gameStarted = false
            votesCast = []
            voteCounts = [0, 0, 0, 0, 0, 0] 
            mafia = 0
            queue = []
            votes = []
        }
    }


    if(message.content.startsWith(`${prefix}status`)) {
        if(queue.length == 0)
            message.channel.send("No one is in the queue.")
        else if(queue.length == 1)
            message.channel.send("1 player in queue: \n" + queue[0])
        else
        {
            statusMessage = queue.length + " players in queue: \n"
            queue.forEach(function(item, index, array) {
                statusMessage += item + "\n"
            })
            message.channel.send(statusMessage)
        }
    }

    if(message.content.startsWith(`${prefix}l`))
    {
        if(queue.indexOf(message.author)>-1)
        {
            let pos = queue.indexOf(message.author)
            let removedItem = queue.splice(pos, 1)
            message.channel.send(message.author + " has left the queue.")
        }
        else
        {
            message.channel.send(message.author + " isn't in the queue.")
        }
        
    }

    if(message.content.startsWith(`${prefix}testmessage`))
    {
        //queue[0].sendMessage("test")
        mafia = Math.random() * 6;
        queue.forEach(function(item, index, array) {
            if(index != mafia)
                item.sendMessage("Game is starting!\nYour role is VILLAGER. Try to win the game.\nAt the end, if you vote for the mafia you get 1 point.\nType !v @user in the main channel after the game is over to cast your vote.")
            else
                item.sendMessage("Game is starting!\nYour role is MAFIA. To win, you must lose the game and go undetected.\nYou get 3 points for winning.\nType !v @user in the main channel after the game is over to cast your vote.")
        })
    }
})

client.login(token);