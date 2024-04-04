const HELP_MSG = `
For more information on a specific command, type help 'command-name'.

Available commands:
- help = For displaying list of commands along with description.
- help <command-name> = For displaying description about individual command.
- connect = For connecting to chat server.
- disconnect = For disconnecting from chat server.
- broadcast <message> = For sending a message to every connected user.
- join_room <message> = For joining a private room.
- send <room id or user's socket id> = For sending a private message in a room or to an individual user.
`

let user_id = null;

const main = $("body").terminal(
    {
        broadcast: msg => checkConnectivity(() => {
            if (msg) socket.emit("broadcast", msg, confirmation => main.echo(confirmation));
            else main.error("No message provided.");
        }),
        connect: () => {
            checkConnectivity(() => main.error("Already connected with id: " + user_id + "."), () => {
                socket.connect();
                main.disable().set_prompt("> ").echo("Connecting...");
                setTimeout(() => {
                    if (!socket.connected) main.error("Connection Timed Out.");
                    main.enable();
                }, 5000);
            });
        },
        disconnect: () => checkConnectivity(() => {
            socket.disconnect();
            user_id = null;
            main.set_prompt("> ").echo("Type 'connect' to connect again.");
        }),
        // exit : () => window.location.href = "bye.html",
        help: name => {
            if (!name) main.echo(HELP_MSG);
            else switch (name) {
                default:
                    main.error("Unknown flag or command: " + name);
                    break;
                case "broadcast":
                    main.echo("Broadcasts the message to all users.");
                    break;
                case "connect":
                    main.echo("Connects the terminal to server for chatting.");
                    break;
                case "disconnect":
                    main.echo("Disconnects the terminal from server.");
                    break;
                case "help":
                    main.echo("Provides full information for terminal commands.");
                    break;
                // case "exit":
                //     main.echo("Exits the terminal.");
                //     break;
                // case "riddle_me_this":
                //     main.echo("A dangerous game.");
                //     break;
            }
        },
        join_room: room_id => checkConnectivity(() => socket.emit("join-room", room_id, confirmation => main.echo(confirmation))),
        // riddle_me_this: () => {},
        send: (id, msg) => checkConnectivity(() => {
            if (!id || !msg) main.error("Invalid ID or message provided.");
            else socket.emit("send-to-user-or-room", id, msg, confirmation => main.echo(confirmation));
        })
    },
    {
        greetings: "Type 'connect' to connect to chat server.\nType 'help' for full list of commands.\n",
        checkArity: false,
        prompt: "> "
    }
);

const socket = io({ autoConnect: false });

const connError = () => main.error("You are currenlty offline.");

const checkConnectivity = (callback, fallback) => {
    if (socket.connected) callback();
    else if (fallback) fallback();
    else connError();
};

socket.on("connect", () => {
    user_id = socket.id;

    main.set_prompt(user_id + "> ").enable().echo("Connection Secure.");
    $("title").text("🟢 Online");
});

socket.on("disconnect", () => {
    main.error("Connection Lost with " + user_id).set_prompt("> ");
    $("title").text("🔴 Offline");
});

socket.on("intimate", msg => main.echo(msg));

let fullscreen = () => {
    if (main[0].requestFullscreen) main[0].requestFullscreen();
    else if (main[0].webkitRequestFullscreen) main[0].webkitRequestFullscreen();
    else if (main[0].msRequestFullscreen) main[0].msRequestFullscreen();
};