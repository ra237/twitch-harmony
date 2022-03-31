![banner](https://user-images.githubusercontent.com/60703435/156765619-d764e19c-fd92-4117-8403-0dacd96cd638.png)
![workflow_codeql](https://github.com/ra237/twitch-harmony/actions/workflows/codeql.yml/badge.svg)
![workflow_deno](https://github.com/ra237/twitch-harmony/actions/workflows/deno.yml/badge.svg)  
**THE Twitch Extension for your Deno-based [Harmony](https://deno.land/x/harmony) Discord Bot**  
* Notifies you if your favorite streamers go live
## Usage
In order to use this extension it is <ins>**crucial**</ins> to create a `.env` file in the **root** directory of your Harmony bot. Within that file you need to include your [*client id*](https://github.com/ra237/twitch-harmony/wiki/Client-ID) and [*auth token*](https://github.com/ra237/twitch-harmony/wiki/Auth-Token) you got from Twitch:
```  
TWITCH_CLIENT_ID=
TWITCH_AUTH_TOKEN=
BOT_TOKEN=
``` 
Optionally you can provide your Discord `BOT_TOKEN`, so you can just copy & paste the example below (but **don't** forget to update `YOUR_CHANNEL` to your desired notification channel!).  
The extension only requires permissions to manage roles, read & send messages. You can use the following permission code: *268438528*  

## Example
A minimal example of using this extension:
```js
import { CommandClient, Intents } from 'https://deno.land/x/harmony/mod.ts'
import { TwitchExtension } from 'https://deno.land/x/twitch_harmony/mod.ts'

const token = Deno.env.get("BOT_TOKEN")

const client = new CommandClient({
  prefix: '!'
})

// load the extension
client.extensions.load(new TwitchExtension(client, "YOUR_CHANNEL"))

client.on('ready', () => {
  console.log(`Ready! User: ${client.user?.tag}`)
})

client.connect(token, Intents.GuildMembers)
```
When loading the extensions you should instantiate the extension class with a second parameter, which is the **notification channel**. This channel is used by the bot to inform you, when a watched streamer goes live.

## Testing
The code is **100%** covered!  
Tests are automatically run on push or pull request to main by GitHub actions.

## How does it work?
You can read through the [wiki page](https://github.com/ra237/twitch-harmony/wiki/How-does-it-work%3F) if you are interested in that.
