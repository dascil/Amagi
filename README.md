<div align="center">
    <img src="https://cdn.discordapp.com/attachments/1084368581342531655/1096280364235890719/elf-modified.png" width=200px>
    <h1>Amagi</h1>
    <div>
        <img src="https://img.shields.io/github/v/release/zach-dascil/amagi">
        <img src="https://img.shields.io/badge/discord.js-v14-purple">
        <img src="https://img.shields.io/github/license/zach-dascil/Amagi">
    </div>
</div>

## Description

A personal bot for a discord server.

## Features

- Recognizes both slash (/) and prefix commands

- Slash Commands
    - Information commands such as bot ping
    - Fetch command to image board like danbooru and yandere
        - If tags are invalid, it will return a list of similar tags
    - Tag command to look up on specified boards

- Prefix Commands
    - Information commands such as bot ping

- Command Cooldown for both prefix and slash commands
  - Sends reply if command is on cooldown
  - Message self-deletes after a certain amount of time

- Color-coded console information

- Configurations
    - Debug mode (default:false) Logs start-up information
    - SFW mode (default:true) Forces image board commands to only retrieve SFW photos (by image board standards)
        - Since tags can still be explicit, commands can only be done in NSFW channels.

## Requirements

[Node.js](https://nodejs.org/) v18.0.0 or higher \
[Docker](https://www.docker.com/products/docker-desktop/) v20.10.0 or higher (Optional)

## Set-up Guide

- Download or clone the repo
- In the terminal, run `npm install` to download the necessary packages
- Create a `.env` file and get the necessary values that are in the `.env.example` file
- In the terminal, run `node .`
- If you want to use Docker:
  - In the terminal inde docker directory, use the command `docker build . -t {insert-name-here}`
  - In the same terminal, use the command `docker run {insert-name-here's id}`
    - If you don't want it to be connected to that specific terminal, add `-d` parameter
  - To manually stop the server, use the command `docker stop {insert-name-here's container's id}`

## Disclaimer

The SFW configuration only ensures the photos being retreived are safe for work by the image board's guidelines, and are within Discord's terms of service.\
The tags however, may be NSFW. As such, the image and tag commands will only work on NSFW channels. \
We are not held responsible for any repercussions caused by using this repo.

## TODO

- More work on SFW mode
    - Add filter for suggested tags in SFW mode

- For 1.0.0 release
    - Combine danbooru and yandere commmand together
        - Similar to tag command
        - Another command will exist for quick look-up
    - TypeScript Transition