// Import necessary libraries
import Discord from "discord.js";
import { Client, Intents } from "discord.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client instance
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Define your source channel id and target channel id

// Listen for when the client is ready to start working
client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  try {
    // Find the guild by ID
    const guild = await client.guilds.fetch(process.env.guildID);

    // Find the source channel by ID
    const sourceChannel = await guild.channels.fetch(process.env.sourceChannelId);

    // Find the target channel by ID
    const targetChannel = await guild.channels.fetch(process.env.targetChannelId);

    // Start listening for new messages in the source channel
    sourceChannel?.on("messageCreate", async (message) => {
      // Copy the message to the target channel
      targetChannel?.send({
        content: message.content,
        username: message.author.username,
        avatarURL: message.author.avatarURL(),
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
  }
});

// Listen for when a message is sent in the source channel
client.on("message", async (message) => {
  if (message.channel.id === sourceChannelId) {
    // Send the message to the target channel
    const targetChannel = client.channels.cache.get(targetChannelId);
    if (targetChannel) {
      await targetChannel.send(message.content);
      console.log(`Message copied from ${message.guild.name}:${message.channel.name} to ${targetChannel.guild.name}:${targetChannel.name}`);
    } else {
      console.error(`Unable to find target channel with id ${targetChannelId}`);
    }

    // Save the message to the database
    const { guild, author, content, createdTimestamp } = message;
    const serverId = guild?.id;
    const userId = author.id;

    await prisma.message.create({
      data: {
        serverId,
        userId,
        channelId: targetChannelId,
        content,
        timestamp: new Date(createdTimestamp),
      },
    });
  }
});

// Start the client
client.login(process.env.DISCORD_TOKEN);
