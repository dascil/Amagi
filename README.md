<div align="center">
    <img src="https://i.imgur.com/2UYP5YC.png" width=1000px>
    <hr>
    <div>
        <img src="https://img.shields.io/github/v/release/zach-dascil/amagi">
        <img src="https://img.shields.io/badge/discord.js-v14-purple">
        <img src="https://img.shields.io/github/license/zach-dascil/Amagi">
    </div>
</div>

# Description

A personal bot for your discord server. Handles both slash and prefix commands.

# Requirements

[Node.js](https://nodejs.org/) v18.0.0 or higher \
[Docker](https://www.docker.com/products/docker-desktop/) v20.10.0 or higher (Optional)

# Features

## Slash Commands

- Information commands such as bot ping
  - Custom emotes are provided within images folder
  - Game commands podium and lr that reacts to photos
    - Accepts URL links to photos or attachments
    - Only accepts photos with the extensions `png`, `jpg`, `jpeg`, and `webp`
- Fetch command to retrieve photo from image boards like danbooru and yandere
  - If tags are invalid, it will return a list of similar tags
  - Tag command to look up on specified boards

## Prefix Commands

- Information commands such as bot ping
- Game commands podium and lr that reacts to photos
  - Only accepts attachments
  - Only accepts photos with the extensions `png`, `jpg`, `jpeg`, and `webp`
  - Custom emotes are provided within images folder

## Other features
- Color-coded console information
- Command Cooldown for both prefix and slash commands
  - Sends reply if command is on cooldown
  - Message self-deletes after a certain amount of time

# Configurations
Configurations can be found in `./src/json/config.json`
- DEBUG (default: `false`) Logs start-up information
- SFW (default: `false`) Forces image board commands to only retrieve SFW photos (by image board standards)
  - Filters out potentially NSFW tags
  - When `false`, NSFW photos and tags can show up only on NSFW channels.
- TRUST_USER (default: `false`) Echoes user's input in certain commands for a clearer message

# Set-up Guide

- Download or clone the repo
- In the terminal, run `npm install` to download the necessary packages
- Upload load the lr and podium emotes to your bot's discord server
- Create a `.env` file and get the necessary values that are in the `.env.example` file
- Change the configurations if needed
- Build the JavaScript files by typing `npx tsc` in the terminal
- In the terminal, run `node .`
- If you want to use Docker:
  - In the terminal inde docker directory, use the command `docker build . -t {insert-name-here}`
  - In the same terminal, use the command `docker run {insert-name-here's id}`
    - If you don't want it to be connected to that specific terminal, add `-d` parameter
  - To manually stop the server, use the command `docker stop {insert-name-here's container's id}`

# TODO
- Add delete bot message capability

# Legal

The SFW configuration only ensures the photos being retreived are safe for work by the image board's guideline, and **not** Discord's guideline; though, both of their guidelines should overlap well.
To ensure no explicit content is displayed (bad tagging on image boards), make sure to turn on the explicit filter on discord.

Our SFW tag filter should be able to catch the majority of the NSFW tags from being reccommended. If you do find a NSFW tag that avoided the filter, please let us know.

We are not held responsible for any repercussions caused by using this repo.