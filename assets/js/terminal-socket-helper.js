const HELP_MSG = `
For more information on a specific command, type help <command-name>.

Available commands:
- help = For displaying list of commands along with description.
- help <command-name> = For displaying description about individual command.
- connect = For connecting to chat server.
- disconnect = For disconnecting from chat server.
- broadcast <message> = For sending a message to every connected user.
- join_room <message> = For joining a private room.
- send <room id or user's socket id> = For sending a private message in a room or to an individual user.
- clear = For clearing the terminal.
- copy_id = For copying user's case-sensitive id.
`;

const GREETING_MSG =
`Type 'connect' to connect to chat server.
Type 'help' for full list of commands.
Type 'fullscreen' to go fullscreen.
`;

const ID_MSG =
`User ID is case-sensitive. Avoid typing out the full ID to send message. Type "copy_id" to copy your User ID instead.
`

let user_id = null;

// Terminal Functions/Commands
const fullscreen = () => {
    if (main[0].requestFullscreen) main[0].requestFullscreen();
    else if (main[0].webkitRequestFullscreen) main[0].webkitRequestFullscreen();
    else if (main[0].msRequestFullscreen) main[0].msRequestFullscreen();

    main.echo("Press esc to exit fullscreen.")
};

const broadcast = (msg) => checkConnectivity(() => {
    if (msg) socket.emit("broadcast", msg, confirmation => main.echo(confirmation));
    else main.error("No message provided.");
});

const connect = () => checkConnectivity(() => main.error("Already connected with id: " + user_id + "."), () => {
    socket.connect();
    main.disable().set_prompt("> ").echo("Connecting...");
    setTimeout(() => {
        if (!socket.connected) main.error("Connection Timed Out.");
        main.enable();
    }, 5000);
});

const disconnect = () => checkConnectivity(() => {
    socket.disconnect();
    user_id = null;
    main.set_prompt("> ").echo("Type 'connect' to connect again.");
});

const help = (name) => {
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
        case "join_room":
            main.echo("Joins an existing room of the name provided or creates a new one.");
            break;
        case "send":
            main.echo("Sends a message to the user with the given ID or a room with the given name.");
            break;
        case "copy_id":
            main.echo("Copies user's current ID.");
            break;
        case "fullscreen":
            main.echo("Go fullscreen.");
            break;
        case "help":
            main.echo("Provides full information for terminal commands.");
            break;
        case "clear":
            main.echo("Clears the terminal.");
            break;
    }
}

const join_room = (room_id) => checkConnectivity(() => {
    if (!room_id) main.error("No ID provided.");
    else socket.emit("join-room", room_id, confirmation => main.echo(confirmation));
});

const send = (id, msg) => checkConnectivity(() => {
    if (!id || !msg) main.error("Invalid ID or message provided.");
    else socket.emit("send-to-user-or-room", id, msg, confirmation => main.echo(confirmation));
});

const copy_id = () => checkConnectivity(() => {
    navigator.clipboard.writeText(socket.id)
        .then(() => main.echo("User ID copied."))
        .catch(() => main.error("Unable to copy User ID."))
        .finally(() => main.echo(ID_MSG));
});

const main = $("body").terminal(
    {
        broadcast,
        connect,
        disconnect,
        fullscreen,
        help,
        join_room,
        send,
        copy_id,
        // For Case-Insensitivity
        BROADCAST: broadcast,
        CONNECT: connect,
        DISCONNECT: disconnect,
        FULLSCREEN: fullscreen,
        HELP: help,
        JOIN_ROOM: join_room,
        SEND: send,
        COPY_ID: copy_id,
    },
    {
        greetings: GREETING_MSG,
        checkArity: false,
        prompt: "> ",
    }
);

// Error Message
const checkConnectivity = (callback, fallback) => {
    if (socket.connected) callback();
    else if (fallback) fallback();
    else main.error("You are currently offline.");
};

// Socket Connection and Events
const socket = io({ autoConnect: false });

socket.on("connect", () => {
    user_id = socket.id;

    main.set_prompt(user_id + "> ").enable().echo("Connection Secure.").echo(ID_MSG);
    $("title").text("🟢 Online");
});

socket.on("disconnect", () => {
    main.error("Connection Lost with " + user_id + "\n").set_prompt("> ");
    $("title").text("🔴 Offline");
});

socket.on("intimate", msg => main.echo(msg + "\n"));