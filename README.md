<div align="center">
    <img src="https://i.imgur.com/2UYP5YC.png" width=1000px>
    <hr>
    <div>
        <img src="https://img.shields.io/github/v/release/dascil/amagi">
        <img src="https://img.shields.io/badge/discord.js-v14-purple">
        <img src="https://img.shields.io/github/license/dascil/Amagi">
    </div>
</div>

# Description

A personal bot for your discord server. Handles both slash and prefix commands.

# Requirements

[Node.js](https://nodejs.org/) v18.0.0 or higher \
[MongoDB](https://www.mongodb.com/) v6.0.0 or higher \
[Docker](https://www.docker.com/products/docker-desktop/) v20.10.0 or higher (Optional)


# Features

- Slash and Prefix Command
- Fetch command to retrieve photo from image boards like danbooru and yandere
  - If tags are invalid, it will return a list of similar tags
  - Tag command to look up on specified boards
- Color-coded console information
- Command cooldown
- Custom configurations for each server

# Configurations
Default configurations for servers can be found in `./src/json/default.json`
- PREFIX (default: `!`) Prefix used for prefix commands
- DENYLIST (default: `[]`) List of users banned from using bot
  - Cannot ban admins
- SFW (default: `false`) Forces image board commands to only retrieve SFW photos (by image board standards)
  - Filters out potentially NSFW tags
  - When `false`, NSFW photos and tags will show up only on NSFW channels.*

# Set-up Guide

- Download or clone the repo
- In the terminal, run `npm install` to download the necessary packages
- Set-up MongoDB server using Atlas or some other hosting method
- Create a `.env` file and get the necessary values that are in the `.env.example` file
- Change the configurations if needed
- Build and run the bot by typing `npm run build-start` in the terminal
- If you want to use Docker:
  - In the terminal inde docker directory, use the command `docker build . -t {insert-name-here}`
  - In the same terminal, use the command `docker run {insert-name-here's id}`
    - If you don't want it to be connected to that specific terminal, add `-d` parameter
  - To manually stop the server, use the command `docker stop {insert-name-here's container's id}`

# TODO
- Add delete bot message capability

# Legal

*The SFW configuration only ensures the photos being retreived are safe for work by the image board's guideline, and **not** Discord's guideline; though, both of their guidelines should overlap well.
To ensure no explicit content is displayed (bad tagging on image boards), make sure to turn on the explicit filter on discord.

Our SFW tag filter should be able to catch the majority of the NSFW tags from being reccommended. If you do find a NSFW tag that avoided the filter, please let us know.

We are not held responsible for any repercussions caused by using this repo.