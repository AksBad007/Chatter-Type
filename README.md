# Chatter-Type

<div align = "center">

  [![Node.js](https://img.shields.io/badge/Node.js-green?style=flat-square)](https://nodejs.org/en/)
  [![Socket.io](https://img.shields.io/badge/Socket.IO-white?style=flat-square)](https://socket.io/)
</div><br>

### Introduction

Chatter-Type is a terminal-style chat application built using <a href="https://terminal.jcubic.pl/">Jquery Terminal</a>, supporting following commands:

- help = For displaying list of commands along with description.
- help <command-name> = For displaying description about individual command.
- connect = For connecting to chat server.
- disconnect = For disconnecting from chat server.
- broadcast <message> = For sending a message to every connected user.
- join_room <message> = For joining a private room.
- send <room id or user's socket id> = For sending a private message in a room or to an individual user.
