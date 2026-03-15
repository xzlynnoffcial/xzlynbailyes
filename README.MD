# <div align='center'>@xzlyne/bailyes - Modern WhatsApp Web API with Security</div>

<div align='center'>

![WhatsApp API](https://uploader.xzlynnofficial.biz.id/uploads/xzlyne_banner.png)

</div>

**xzlynebailyes** is a modern WebSocket-based TypeScript library for interacting with the WhatsApp Web API. This library has been enhanced to address issues with WhatsApp group `@lid` and `@jid` handling, ensuring robust performance. It also comes with an integrated membership security check.

## ✨ Key Features

- 🚀 **Modern & Fast** - Built with TypeScript and cutting-edge technologies
- 🔧 **Fixed @lid & @jid & additional features** - Resolved WhatsApp group `@lid` and `@jid` issues
- 🛡️ **Membership Security Check** - Built-in security checking system by Xzlynn
- 📱 **Multi-Device Support** - Supports WhatsApp multi-device connections
- 🔐 **End-to-End Encryption** - Fully encrypted communications
- 📨 **All Message Types** - Supports all message types (text, media, polls, etc.)
- 🎯 **Easy to Use** - Simple and intuitive API

## Modification from zenzxz/baileys
Thank you very much to zenzxz/baileys
[zenzxz/baileys](https://www.npmjs.com/package/@yzenzxz/baileys)
## ⚠️ Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. The official WhatsApp website can be found at [whatsapp.com](https://whatsapp.com).

The maintainers of `xzlynebailyes` do not condone the use of this application in practices that violate WhatsApp's Terms of Service. We urge users to exercise personal responsibility and use this application fairly and responsibly.

**Use wisely. Avoid spamming. Refrain from excessive automated usage.**

## 📦 Installation

### Stable Version (Recommended)
```bash
npm install xzlynebailyes
```

### Edge Version (Latest Features)
```bash
npm install xzlynebailyes@latest
# or
yarn add xzlynebailyes@latest
```

### Import in Code
```javascript
const { default: makeWASocket } = require("xzlynebailyes")
// or ES6
import makeWASocket from "xzlynebailyes"
```

## 🚀 Quick Start

### Example
Here is an example you can use: [example.ts](Example/example.ts) or follow this tutorial to run the Baileys WhatsApp API code:
1. ```bash
   cd path/to/baileys
   ```
2. ```bash
   npm install
   ```
3. ```bash
   node example.js
   ```

### Basic Example
```javascript
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('xzlynebailyes')
const { Boom } = require('@hapi/boom')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['xzlynebailyes', 'Desktop', '3.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('✅ Successfully connected to WhatsApp!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            if (!m.message) continue
            
            console.log('📱 New message:', JSON.stringify(m, undefined, 2))
            
            // Auto reply
            await sock.sendMessage(m.key.remoteJid!, { 
                text: 'Hello! I am a WhatsApp bot using xzlynebailyes 🤖' 
            })
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()
```

# Index

- [Connecting Account](#connecting-account)
    - [Connect with QR Code](#starting-socket-with-qr-code)
    - [Connect with Pairing Code](#starting-socket-with-pairing-code)
    - [Receive Full History](#receive-full-history)
- [Important Notes About Socket Config](#important-notes-about-socket-config)
    - [Caching Group Metadata (Recommended)](#caching-group-metadata-recommended)
    - [Improve Retry System & Decrypt Poll Votes](#improve-retry-system--decrypt-poll-votes)
    - [Receive Notifications in WhatsApp App](#receive-notifications-in-whatsapp-app)
- [Save Auth Info](#saving--restoring-sessions)
- [Handling Events](#handling-events)
    - [Example to Start](#example-to-start)
    - [Decrypt Poll Votes](#decrypt-poll-votes)
    - [Summary of Events on First Connection](#summary-of-events-on-first-connection)
- [Implementing a Data Store](#implementing-a-data-store)
- [WhatsApp IDs Explained](#whatsapp-ids-explain)
- [Utility Functions](#utility-functions)
- [Sending Messages](#sending-messages)
    - [Non-Media Messages](#non-media-messages)
        - [Buttons Message](#buttons-message)
        - [Buttons Flow](#buttons-flow)
        - [Interactive Message](#interactive-message)
        - [Text Message](#text-message)
        - [Quote Message](#quote-message-works-with-all-types)
        - [Mention User](#mention-user-works-with-most-types)
        - [Mention Status](#mention-status)
        - [Result Poll From Newsletter](#result-poll-from-newsletter)
        - [Send Album Message](#send-album-message)
        - [Interactive Response](#interactive-response)
        - [Request Payment](#request-payment)
        - [Event Message](#event-message)
        - [Interactive](#interactive)
        - [Forward Messages](#forward-messages)
        - [Location Message](#location-message)
        - [Contact Message](#contact-message)
        - [Reaction Message](#reaction-message)
        - [Pin Message](#pin-message)
        - [Poll Message](#poll-message)
    - [Sending with Link Preview](#sending-messages-with-link-previews)
    - [Media Messages](#media-messages)
        - [GIF Message](#gif-message)
        - [Video Message](#video-message)
        - [Audio Message](#audio-message)
        - [Image Message](#image-message)
        - [View Once Message](#view-once-message)
- [Modify Messages](#modify-messages)
    - [Delete Messages (for everyone)](#deleting-messages-for-everyone)
    - [Edit Messages](#editing-messages)
- [Manipulating Media Messages](#manipulating-media-messages)
    - [Thumbnail in Media Messages](#thumbnail-in-media-messages)
    - [Downloading Media Messages](#downloading-media-messages)
    - [Re-upload Media Message to WhatsApp](#re-upload-media-message-to-whatsapp)
- [Reject Call](#reject-call)
- [Send States in Chat](#send-states-in-chat)
    - [Reading Messages](#reading-messages)
    - [Update Presence](#update-presence)
- [Modifying Chats](#modifying-chats)
    - [Archive a Chat](#archive-a-chat)
    - [Mute/Unmute a Chat](#muteunmute-a-chat)
    - [Mark a Chat Read/Unread](#mark-a-chat-readunread)
    - [Delete a Message for Me](#delete-a-message-for-me)
    - [Delete a Chat](#delete-a-chat)
    - [Pin/Unpin a Chat](#pinunpin-a-chat)
    - [Star/Unstar a Message](#starunstar-a-message)
    - [Disappearing Messages](#disappearing-messages)
- [User Queries](#user-querys)
    - [Check If ID Exists in WhatsApp](#check-if-id-exists-in-whatsapp)
    - [Query Chat History (groups too)](#query-chat-history-groups-too)
    - [Fetch Status](#fetch-status)
    - [Fetch Profile Picture (groups too)](#fetch-profile-picture-groups-too)
    - [Fetch Business Profile](#fetch-business-profile-such-as-description-or-category)
    - [Fetch Someone's Presence](#fetch-someones-presence-if-theyre-typing-or-online)
- [Change Profile](#change-profile)
    - [Change Profile Status](#change-profile-status)
    - [Change Profile Name](#change-profile-name)
    - [Change Display Picture (groups too)](#change-display-picture-groups-too)
    - [Remove Display Picture (groups too)](#remove-display-picture-groups-too)
- [Groups](#groups)
    - [Create a Group](#create-a-group)
    - [Add/Remove or Demote/Promote](#addremove-or-demotepromote)
    - [Change Subject (name)](#change-subject-name)
    - [Change Description](#change-description)
    - [Change Settings](#change-settings)
    - [Leave a Group](#leave-a-group)
    - [Get Invite Code](#get-invite-code)
    - [Revoke Invite Code](#revoke-invite-code)
    - [Join Using Invitation Code](#join-using-invitation-code)
    - [Get Group Info by Invite Code](#get-group-info-by-invite-code)
    - [Query Metadata](#query-metadata-participants-name-description)
    - [Join using groupInviteMessage](#join-using-groupinvitemessage)
    - [Get Request Join List](#get-request-join-list)
    - [Approve/Reject Request Join](#approvereject-request-join)
    - [Get All Participating Groups Metadata](#get-all-participating-groups-metadata)
    - [Toggle Ephemeral](#toggle-ephemeral)
    - [Change Add Mode](#change-add-mode)
- [Privacy](#privacy)
    - [Block/Unblock User](#blockunblock-user)
    - [Get Privacy Settings](#get-privacy-settings)
    - [Get BlockList](#get-blocklist)
    - [Update LastSeen Privacy](#update-lastseen-privacy)
    - [Update Online Privacy](#update-online-privacy)
    - [Update Profile Picture Privacy](#update-profile-picture-privacy)
    - [Update Status Privacy](#update-status-privacy)
    - [Update Read Receipts Privacy](#update-read-receipts-privacy)
    - [Update Groups Add Privacy](#update-groups-add-privacy)
    - [Update Default Disappearing Mode](#update-default-disappearing-mode)
- [Broadcast Lists & Stories](#broadcast-lists--stories)
    - [Send Broadcast & Stories](#send-broadcast--stories)
    - [Query a Broadcast List's Recipients & Name](#query-a-broadcast-lists-recipients--name)
- [Writing Custom Functionality](#writing-custom-functionality)
    - [Enabling Debug Level in Baileys Logs](#enabling-debug-level-in-baileys-logs)
    - [How WhatsApp Communicates With Us](#how-whatsapp-communicate-with-us)
    - [Register a Callback for WebSocket Events](#register-a-callback-for-websocket-events)
- [Tips & Best Practices](#tips--best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Connecting Account

WhatsApp provides a multi-device API that allows `xzlynebailyes` to authenticate as a secondary WhatsApp client via QR code or pairing code.

### Starting Socket with **QR Code**

> [!TIP]
> Customize the browser name using the `Browsers` constant. See available configurations [here](https://baileys.whiskeysockets.io/types/BrowsersMap.html).

```javascript
const { default: makeWASocket, Browsers } = require("xzlynebailyes")

const sock = makeWASocket({
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true
})
```

Upon successful connection, a QR code will be printed in the terminal. Scan it with WhatsApp on your phone to log in.

### Starting Socket with **Pairing Code**

> [!IMPORTANT]
> Pairing codes are not part of the Mobile API. They allow connecting WhatsApp Web without a QR code, but only one device can be connected. See [WhatsApp FAQ](https://faq.whatsapp.com/1324084875126592/?cms_platform=web).

Phone numbers must exclude `+`, `()`, or `-`, and include the country code.

```javascript
const { default: makeWASocket } = require("xzlynebailyes")

const sock = makeWASocket({
    printQRInTerminal: false
})

// Normal Pairing
if (!sock.authState.creds.registered) {
    const number = '6285134816783'
    const code = await sock.requestPairingCode(number)
    console.log('🔑 Pairing Code:', code)
}

// Custom Pairing
if (!sock.authState.creds.registered) {
    const pair = "ZN240125" // 8 characters
    const number = '6285134816783'
    const code = await sock.requestPairingCode(number, pair)
    console.log('🔑 Custom Pairing Code:', code)
}
```

### Receive Full History

1. Set `syncFullHistory` to `true`.
2. By default, Baileys uses Chrome browser config. For desktop-like connections (to receive more message history), use:

```javascript
const { default: makeWASocket, Browsers } = require("xzlynebailyes")

const sock = makeWASocket({
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true
})
```

## Important Notes About Socket Config

### Caching Group Metadata (Recommended)

For group usage, implement caching for group metadata:

```javascript
const { default: makeWASocket } = require("xzlynebailyes")
const NodeCache = require('node-cache')

const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

const sock = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
})

sock.ev.on('groups.update', async ([event]) => {
    const metadata = await sock.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})

sock.ev.on('group-participants.update', async (event) => {
    const metadata = await sock.groupMetadata(event.id)
    groupCache.set(event.id, metadata)
})
```

### Improve Retry System & Decrypt Poll Votes

Enhance message sending and poll vote decryption with a store:

```javascript
const sock = makeWASocket({
    getMessage: async (key) => await getMessageFromStore(key)
})
```

### Receive Notifications in WhatsApp App

Disable online status to receive notifications:

```javascript
const sock = makeWASocket({
    markOnlineOnConnect: false
})
```

## Saving & Restoring Sessions

Avoid rescanning QR codes by saving credentials:

```javascript
const makeWASocket = require("xzlynebailyes").default
const { useMultiFileAuthState } = require("xzlynebailyes")

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({ auth: state })
    sock.ev.on('creds.update', saveCreds)
}

connect()
```

> [!IMPORTANT]
> `useMultiFileAuthState` saves auth state in a folder. For production, use SQL/no-SQL databases and carefully manage key updates.

## Handling Events

Baileys uses EventEmitter for events, fully typed for IDE support.

> [!IMPORTANT]
> See all events [here](https://baileys.whiskeysockets.io/types/BaileysEventMap.html).

```javascript
const sock = makeWASocket()
sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('Got messages:', messages)
})
```

### Example to Start

```javascript
const makeWASocket = require("xzlynebailyes").default
const { DisconnectReason, useMultiFileAuthState } = require("xzlynebailyes")
const { Boom } = require('@hapi/boom')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('Opened connection')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            console.log(JSON.stringify(m, undefined, 2))
            console.log('Replying to', m.key.remoteJid)
            await sock.sendMessage(m.key.remoteJid!, { text: 'Hello World' })
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()
```

### Decrypt Poll Votes

Handle encrypted poll votes:

```javascript
sock.ev.on('messages.update', async (event) => {
    for(const { key, update } of event) {
        if(update.pollUpdates) {
            const pollCreation = await getMessage(key)
            if(pollCreation) {
                console.log(
                    'Got poll update, aggregation: ',
                    getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                )
            }
        }
    }
})
```

### Summary of Events on First Connection

1. `connection.update` triggers, requesting socket restart.
2. History messages are received in `messaging.history-set`.

## Implementing a Data Store

Baileys provides an in-memory store for chats, contacts, and messages:

```javascript
const makeWASocket = require("xzlynebailyes").default
const { makeInMemoryStore } = require("xzlynebailyes")

const store = makeInMemoryStore({})
store.readFromFile('./baileys_store.json')
setInterval(() => {
    store.writeToFile('./baileys_store.json')
}, 10_000)

const sock = makeWASocket({})
store.bind(sock.ev)

sock.ev.on('chats.upsert', () => {
    console.log('Got chats', store.chats.all())
})

sock.ev.on('contacts.upsert', () => {
    console.log('Got contacts', Object.values(store.contacts))
})
```

> [!IMPORTANT]
> For production, implement a custom store to avoid memory issues.

## WhatsApp IDs Explained

WhatsApp IDs (`jid`) formats:

- **Personal Chat**: `[country code][phone number]@s.whatsapp.net` (e.g., `6285134816783@s.whatsapp.net`)
- **Group Chat** (Fixed `@jid`): `642108816399-1452992248@g.us`
- **Broadcast**: `[timestamp]@broadcast` (e.g., `1234567890@broadcast`)
- **Status/Story**: `status@broadcast`
- **Newsletter**: `1234567890@newsletter`

> [!NOTE]
> `@lid` and `@jid` issues in groups are fixed in this library.

## Utility Functions

- `getContentType`: Returns message content type.
- `getDevice`: Identifies device from message.
- `makeCacheableSignalKeyStore`: Optimizes auth store.
- `downloadContentFromMessage`: Downloads message content.

## Sending Messages

Send messages using:

```javascript
const jid: string
const content: AnyMessageContent
const options: MiscMessageGenerationOptions

sock.sendMessage(jid, content, options)
```

### Non-Media Messages

#### Buttons Message
```javascript
await sock.sendMessage(jid, {
    text: "Hello World!",
    footer: "ZN - 2025",
    buttons: [
        {
            buttonId: `🚀`,
            buttonText: { displayText: '🗿' },
            type: 1
        }
    ],
    headerType: 1,
    viewOnce: true
}, { quoted: null })
```

#### Buttons Flow
```javascript
await sock.sendMessage(jid, {
    text: "Hello World!",
    footer: "© ZN",
    buttons: [
        {
            buttonId: '.tes',
            buttonText: { displayText: 'TESTING BOT' },
            type: 1
        },
        {
            buttonId: ' ',
            buttonText: { displayText: 'PRIVATE SCRIPT' },
            type: 1
        },
        {
            buttonId: 'action',
            buttonText: { displayText: 'Interactive Message' },
            type: 4,
            nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                    title: 'message',
                    sections: [
                        {
                            title: 'ZN - 2025',
                            highlight_label: '☺',
                            rows: [
                                { header: 'HEADER', title: 'TITLE', description: 'DESCRIPTION', id: 'YOUR ID' },
                                { header: 'HEADER', title: 'TITLE', description: 'DESCRIPTION', id: 'YOUR ID' }
                            ]
                        }
                    ]
                })
            }
        }
    ],
    headerType: 1,
    viewOnce: true
}, { quoted: m })
```

#### Interactive Message
```javascript
let msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({ text: "ZN" }),
                footer: proto.Message.InteractiveMessage.Footer.create({ text: "Bot" }),
                header: proto.Message.InteractiveMessage.Header.create({
                    title: "Igna",
                    subtitle: "test",
                    hasMediaAttachment: false
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                        {
                            name: "single_select",
                            buttonParamsJson: "{\"title\":\"title\",\"sections\":[{\".menu\":\".play dj webito\",\"highlight_label\":\"label\",\"rows\":[{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"},{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"}]}]}"
                        },
                        { name: "cta_reply", buttonParamsJson: "{\"display_text\":\"quick_reply\",\"id\":\"message\"}" },
                        { name: "cta_url", buttonParamsJson: "{\"display_text\":\"url\",\"url\":\"https://www.google.com\",\"merchant_url\":\"https://www.google.com\"}" },
                        { name: "cta_call", buttonParamsJson: "{\"display_text\":\"call\",\"id\":\"message\"}" },
                        { name: "cta_copy", buttonParamsJson: "{\"display_text\":\"copy\",\"id\":\"123456789\",\"copy_code\":\"message\"}" },
                        { name: "cta_reminder", buttonParamsJson: "{\"display_text\":\"Recordatorio\",\"id\":\"message\"}" },
                        { name: "cta_cancel_reminder", buttonParamsJson: "{\"display_text\":\"cta_cancel_reminder\",\"id\":\"message\"}" },
                        { name: "address_message", buttonParamsJson: "{\"display_text\":\"address_message\",\"id\":\"message\"}" },
                        { name: "send_location", buttonParamsJson: "" }
                    ]
                })
            })
        }
    }
}, {})

return sock.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
```

#### Text Message
```javascript
await sock.sendMessage(jid, { text: 'Hello World' })
```

#### Quote Message (works with all types)
```javascript
await sock.sendMessage(jid, { text: 'Hello World' }, { quoted: message })
```

#### Mention User (works with most types)
```javascript
await sock.sendMessage(
    jid,
    {
        text: '@6285134816783',
        mentions: ['6285134816783@s.whatsapp.net']
    }
)
```

#### Mention Status
```javascript
await sock.StatusMentions(
    {
        text: "Hello",
    },
    [
        "642108816399-1452992248@g.us",
        "6285134816783@s.whatsapp.net"
    ]
)
```

#### Result Poll From Newsletter
```javascript
await sock.sendMessage(
    jid,
    {
        pollResult: {
            name: "Text poll",
            votes: [["Option 1", 10], ["Option 2", 10]]
        }
    }, { quoted: message }
)
```

#### Send Album Message
```javascript
await sock.sendAlbumMessage(
    jid,
    [
        {
            image: { url: "https://example.jpg" },
            caption: "Hello World"
        },
        {
            video: { url: "https://example.mp4" },
            caption: "Hello World"
        }
    ],
    { 
        quoted: message, 
        delay: 2000
    }
)
```

#### Interactive Response
```javascript
await sock.sendMessage(
    jid, 
    {
        buttonReply: {
            text: 'Text',
            nativeFlow: { version: 3 }
        },
        type: 'interactive',
        ephemeral: true
    }
)
```

#### Request Payment
```javascript
// Non-media sticker
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
            currency: "IDR",
            amount: "10000000",
            from: "6285134816783@s.whatsapp.net",
            note: "Hi Guys",
            background: {}
        }
    },
    { quoted: message }
)

// With media sticker buffer
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
            currency: "IDR",
            amount: "10000000",
            from: "6285134816783@s.whatsapp.net",
            sticker: Buffer,
            background: {}
        }
    },
    { quoted: message }
)

// With media sticker URL
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
            currency: "IDR",
            amount: "10000000",
            from: "6285134816783@s.whatsapp.net",
            sticker: { url: 'https://example.com/sticker.png' },
            background: {}
        }
    },
    { quoted: message }
)
```

#### Event Message
```javascript
await sock.sendMessage(
    jid, 
    { 
        event: {
            isCanceled: false,
            name: "Name Event",
            description: "Description Event",
            location: { 
                degreesLatitude: 0,
                degreesLongitude: 0
            },
            link: 'https://call.link',
            startTime: m.messageTimestamp.low,
            endTime: m.messageTimestamp.low + 86400,
            extraGuestsAllowed: true
        }
    },
    { quoted: message }
)
```

#### Interactive
```javascript
// Non-header media
await sock.sendMessage(
    jid,
    {
        text: "Description Of Messages",
        title: "Title Of Messages",
        subtitle: "Subtitle Message",
        footer: "Footer Messages",
        interactiveButtons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", id: "ID" })
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", url: "https://www.example.com" })
            }
        ]
    },
    { quoted: message }
)

// With media
await sock.sendMessage(
    jid,
    {
        image: { url: "https://example.jpg" },
        caption: "Description Of Messages",
        title: "Title Of Messages",
        subtitle: "Subtitle Message",
        footer: "Footer Messages",
        media: true,
        interactiveButtons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", id: "ID" })
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", url: "https://www.example.com" })
            }
        ]
    },
    { quoted: message }
)

// With header product
await sock.sendMessage(
    jid,
    {
        product: {
            productImage: { url: "https://example.jpg" },
            productImageCount: 1,
            title: "Title Product",
            description: "Description Product",
            priceAmount1000: 20000 * 1000,
            currencyCode: "IDR",
            retailerId: "Retail",
            url: "https://example.com"
        },
        businessOwnerJid: "6285134816783@s.whatsapp.net",
        caption: "Description Of Messages",
        title: "Title Of Messages",
        footer: "Footer Messages",
        media: true,
        interactiveButtons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", id: "ID" })
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({ display_text: "Display Button", url: "https://www.example.com" })
            }
        ]
    },
    { quoted: message }
)
```

#### Forward Messages
```javascript
const msg = getMessageFromStore()
await sock.sendMessage(jid, { forward: msg })
```

#### Location Message
```javascript
await sock.sendMessage(
    jid,
    {
        location: {
            degreesLatitude: 24.121231,
            degreesLongitude: 55.1121221
        }
    }
)
```

#### Contact Message
```javascript
const vcard = 'BEGIN:VCARD\n'
    + 'VERSION:3.0\n'
    + 'FN:Jeff Singh\n'
    + 'ORG:Ashoka Uni;\n'
    + 'TEL;type=CELL;type=VOICE;waid=6285134816783:+6285134816783\n'
    + 'END:VCARD'

await sock.sendMessage(
    jid,
    {
        contacts: {
            displayName: 'Jeff',
            contacts: [{ vcard }]
        }
    }
)
```

#### Reaction Message
```javascript
await sock.sendMessage(
    jid,
    {
        react: {
            text: '💖',
            key: message.key
        }
    }
)
```

#### Pin Message
```javascript
await sock.sendMessage(
    jid,
    {
        pin: {
            type: 1,
            time: 86400,
            key: message.key
        }
    }
)
```

#### Poll Message
```javascript
await sock.sendMessage(
    jid,
    {
        poll: {
            name: 'My Poll',
            values: ['Option 1', 'Option 2'],
            selectableCount: 1,
            toAnnouncementGroup: false
        }
    }
)
```

### Sending Messages with Link Previews

Add `link-preview-js` dependency:

```bash
yarn add link-preview-js
```

Send a link:

```javascript
await sock.sendMessage(
    jid,
    {
        text: 'Hi, this was sent using https://github.com/xzlyne/bailyes'
    }
)
```

### Media Messages

> [!NOTE]
> Use `{ stream: Stream }`, `{ url: Url }`, or `Buffer` for media. See [WAMediaUpload](https://baileys.whiskeysockets.io/types/WAMediaUpload.html).

#### GIF Message
```javascript
await sock.sendMessage(
    jid,
    {
        video: fs.readFileSync('Media/ma_gif.mp4'),
        caption: 'Hello World',
        gifPlayback: true
    }
)
```

#### Video Message
```javascript
await sock.sendMessage(
    jid,
    {
        video: { url: './Media/ma_gif.mp4' },
        caption: 'Hello World',
        ptv: false
    }
)
```

#### Audio Message
```javascript
await sock.sendMessage(
    jid,
    {
        audio: { url: './Media/audio.mp3' },
        mimetype: 'audio/mp4'
    }
)
```

#### Image Message
```javascript
await sock.sendMessage(
    jid,
    {
        image: { url: './Media/ma_img.png' },
        caption: 'Hello World'
    }
)
```

#### View Once Message
```javascript
await sock.sendMessage(
    jid,
    {
        image: { url: './Media/ma_img.png' },
        viewOnce: true,
        caption: 'Hello World'
    }
)
```

## Modify Messages

### Deleting Messages (for everyone)
```javascript
const msg = await sock.sendMessage(jid, { text: 'Hello World' })
await sock.sendMessage(jid, { delete: msg.key })
```

### Editing Messages
```javascript
await sock.sendMessage(jid, {
    text: 'Updated text goes here',
    edit: response.key
})
```

## Manipulating Media Messages

### Thumbnail in Media Messages

Add `jimp` or `sharp` for image/sticker thumbnails:

```bash
yarn add jimp
# or
yarn add sharp
```

For video thumbnails, install `ffmpeg`.

### Downloading Media Messages
```javascript
const { createWriteStream } = require('fs')
const { downloadMediaMessage, getContentType } = require("xzlynebailyes")

sock.ev.on('messages.upsert', async ({ messages: [m] }) => {
    if (!m.message) return
    const messageType = getContentType(m.message)

    if (messageType === 'imageMessage') {
        const stream = await downloadMediaMessage(
            m,
            'stream',
            {},
            {
                logger,
                reuploadRequest: sock.updateMediaMessage
            }
        )
        const writeStream = createWriteStream('./my-download.jpeg')
        stream.pipe(writeStream)
    }
})
```

### Re-upload Media Message to WhatsApp
```javascript
await sock.updateMediaMessage(msg)
```

## Reject Call
```javascript
await sock.rejectCall(callId, callFrom)
```

## Send States in Chat

### Reading Messages
```javascript
const key: WAMessageKey
await sock.readMessages([key])
```

### Update Presence
```javascript
await sock.sendPresenceUpdate('available', jid)
```

## Modifying Chats

### Archive a Chat
```javascript
const lastMsgInChat = await getLastMessageInChat(jid)
await sock.chatModify({ archive: true, lastMessages: [lastMsgInChat] }, jid)
```

### Mute/Unmute a Chat
```javascript
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid) // Mute for 8 hours
await sock.chatModify({ mute: null }, jid) // Unmute
```

### Mark a Chat Read/Unread
```javascript
const lastMsgInChat = await getLastMessageInChat(jid)
await sock.chatModify({ markRead: false, lastMessages: [lastMsgInChat] }, jid)
```

### Delete a Message for Me
```javascript
await sock.chatModify(
    {
        clear: {
            messages: [
                {
                    id: 'ATWYHDNNWU81732J',
                    fromMe: true,
                    timestamp: '1654823909'
                }
            ]
        }
    },
    jid
)
```

### Delete a Chat
```javascript
const lastMsgInChat = await getLastMessageInChat(jid)
await sock.chatModify({
    delete: true,
    lastMessages: [
        {
            key: lastMsgInChat.key,
            messageTimestamp: lastMsgInChat.messageTimestamp
        }
    ]
}, jid)
```

### Pin/Unpin a Chat
```javascript
await sock.chatModify({
    pin: true
}, jid)
```

### Star/Unstar a Message
```javascript
await sock.chatModify({
    star: {
        messages: [
            {
                id: 'messageID',
                fromMe: true
            }
        ],
        star: true
    }
}, jid)
```

### Disappearing Messages
```javascript
await sock.sendMessage(
    jid,
    { disappearingMessagesInChat: 604800 }
)

await sock.sendMessage(jid, { text: 'Hello' }, { ephemeralExpiration: 604800 })

await sock.sendMessage(
    jid,
    { disappearingMessagesInChat: false }
)
```

## User Queries

### Check If ID Exists in WhatsApp
```javascript
const [result] = await sock.onWhatsApp(jid)
if (result.exists) console.log(`${jid} exists on WhatsApp, as jid: ${result.jid}`)
```

### Query Chat History (groups too)
```javascript
const msg = await getOldestMessageInChat(jid)
await sock.fetchMessageHistory(
    50,
    msg.key,
    msg.messageTimestamp
)
```

### Fetch Status
```javascript
const status = await sock.fetchStatus(jid)
console.log('Status: ' + status)
```

### Fetch Profile Picture (groups too)
```javascript
const ppUrl = await sock.profilePictureUrl(jid, 'image')
console.log(ppUrl)
```

### Fetch Business Profile (such as description or category)
```javascript
const profile = await sock.getBusinessProfile(jid)
console.log('Business description: ' + profile.description + ', category: ' + profile.category)
```

### Fetch Someone's Presence (if they're typing or online)
```javascript
sock.ev.on('presence.update', console.log)
await sock.presenceSubscribe(jid)
```

## Change Profile

### Change Profile Status
```javascript
await sock.updateProfileStatus('Hello World!')
```

### Change Profile Name
```javascript
await sock.updateProfileName('My Name')
```

### Change Display Picture (groups too)
```javascript
await sock.updateProfilePicture(jid, { url: './new-profile-picture.jpeg' })
```

### Remove Display Picture (groups too)
```javascript
await sock.removeProfilePicture(jid)
```

## Groups

### Create a Group
```javascript
const group = await sock.groupCreate('My Fab Group', ['6285134816783@s.whatsapp.net', '6281234567890@s.whatsapp.net'])
console.log('Created group with id: ' + group.gid)
await sock.sendMessage(group.id, { text: 'Hello there' })
```

### Add/Remove or Demote/Promote
```javascript
await sock.groupParticipantsUpdate(
    jid,
    ['6285134816783@s.whatsapp.net', '6281234567890@s.whatsapp.net'],
    'add'
)
```

### Change Subject (name)
```javascript
await sock.groupUpdateSubject(jid, 'New Subject!')
```

### Change Description
```javascript
await sock.groupUpdateDescription(jid, 'New Description!')
```

### Change Settings
```javascript
await sock.groupSettingUpdate(jid, 'announcement')
await sock.groupSettingUpdate(jid, 'not_announcement')
await sock.groupSettingUpdate(jid, 'unlocked')
await sock.groupSettingUpdate(jid, 'locked')
```

### Leave a Group
```javascript
await sock.groupLeave(jid)
```

### Get Invite Code
```javascript
const code = await sock.groupInviteCode(jid)
console.log('Group code: ' + code)
```

### Revoke Invite Code
```javascript
const code = await sock.groupRevokeInvite(jid)
console.log('New group code: ' + code)
```

### Join Using Invitation Code
```javascript
const response = await sock.groupAcceptInvite(code)
console.log('Joined to: ' + response)
```

### Get Group Info by Invite Code
```javascript
const response = await sock.groupGetInviteInfo(code)
console.log('Group information: ' + response)
```

### Query Metadata (participants, name, description...)
```javascript
const metadata = await sock.groupMetadata(jid)
console.log(metadata.id + ', title: ' + metadata.subject + ', description: ' + metadata.desc)
```

### Join using groupInviteMessage
```javascript
const response = await sock.groupAcceptInviteV4(jid, groupInviteMessage)
console.log('Joined to: ' + response)
```

### Get Request Join List
```javascript
const response = await sock.groupRequestParticipantsList(jid)
console.log(response)
```

### Approve/Reject Request Join
```javascript
const response = await sock.groupRequestParticipantsUpdate(
    jid,
    ['6285134816783@s.whatsapp.net', '6281234567890@s.whatsapp.net'],
    'approve'
)
console.log(response)
```

### Get All Participating Groups Metadata
```javascript
const response = await sock.groupFetchAllParticipating()
console.log(response)
```

### Toggle Ephemeral
```javascript
await sock.groupToggleEphemeral(jid, 86400)
```

### Change Add Mode
```javascript
await sock.groupMemberAddMode(
    jid,
    'all_member_add'
)
```

## Privacy

### Block/Unblock User
```javascript
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
```

### Get Privacy Settings
```javascript
const privacySettings = await sock.fetchPrivacySettings(true)
console.log('Privacy settings: ' + privacySettings)
```

### Get BlockList
```javascript
const response = await sock.fetchBlocklist()
console.log(response)
```

### Update LastSeen Privacy
```javascript
await sock.updateLastSeenPrivacy('contacts')
```

### Update Online Privacy
```javascript
await sock.updateOnlinePrivacy('all')
```

### Update Profile Picture Privacy
```javascript
await sock.updateProfilePicturePrivacy('contacts')
```

### Update Status Privacy
```javascript
await sock.updateStatusPrivacy('contacts')
```

### Update Read Receipts Privacy
```javascript
await sock.updateReadReceiptsPrivacy('all')
```

### Update Groups Add Privacy
```javascript
await sock.updateGroupsAddPrivacy('contacts')
```

### Update Default Disappearing Mode
```javascript
await sock.updateDefaultDisappearingMode(86400)
```

## Broadcast Lists & Stories

### Send Broadcast & Stories
```javascript
await sock.sendMessage(
    jid,
    {
        image: { url: 'story.jpg' },
        caption: 'Story from xzlynebailyes'
    },
    {
        backgroundColor: '#FF6B6B',
        font: 1,
        statusJidList: ['6285134816783@s.whatsapp.net'],
        broadcast: true
    }
)
```

### Query a Broadcast List's Recipients & Name
```javascript
const bList = await sock.getBroadcastListInfo('1234567890@broadcast')
console.log(`List name: ${bList.name}, recipients: ${bList.recipients}`)
```

## Writing Custom Functionality

### Enabling Debug Level in Baileys Logs
```javascript
const sock = makeWASocket({
    logger: P({ level: 'debug' })
})
```

### How WhatsApp Communicates With Us

> [!TIP]
> Study the Libsignal Protocol and Noise Protocol for WhatsApp communication details.

Example for tracking battery percentage:

```javascript
{
    "level": 10,
    "fromMe": false,
    "frame": {
        "tag": "ib",
        "attrs": { "from": "@s.whatsapp.net" },
        "content": [
            {
                "tag": "edge_routing",
                "attrs": {},
                "content": [
                    {
                        "tag": "routing_info",
                        "attrs": {},
                        "content": { "type": "Buffer", "data": [8,2,8,5] }
                    }
                ]
            }
        ]
    },
    "msg": "communication"
}
```

### Register a Callback for WebSocket Events
```javascript
sock.ws.on('CB:edge_routing', (node) => {})
sock.ws.on('CB:edge_routing,id:abcd', (node) => {})
sock.ws.on('CB:edge_routing,id:abcd,routing_info', (node) => {})
```

## Tips & Best Practices

1. **Rate Limiting**
```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
for (const contact of contacts) {
    await sock.sendMessage(contact, { text: 'Broadcast message' })
    await delay(2000)
}
```

2. **Memory Management**
```javascript
const fs = require('fs')
await sock.sendMessage('6285134816783@s.whatsapp.net', {
    document: fs.createReadStream('./large-file.pdf'),
    mimetype: 'application/pdf',
    fileName: 'document.pdf'
})
```

3. **Error Recovery**
```javascript
async function sendWithRetry(jid, content, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await sock.sendMessage(jid, content)
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message)
            if (i === maxRetries - 1) throw error
            await delay(1000 * (i + 1))
        }
    }
}
```

## Troubleshooting

1. **QR Code Not Appearing**
```javascript
const sock = makeWASocket({
    printQRInTerminal: true
})
```

2. **Group @jid Not Working** ✅ FIXED
```javascript
const groupId = '642108816399-1452992248@g.us'
```

3. **Session Lost**
```javascript
sock.ev.on('creds.update', saveCreds)
```

4. **Memory Leak**
```javascript
const store = makeInMemoryStore({})
store.bind(sock.ev)
```
## License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.

<div align='center'>

**Made with ❤️ by Xzlynn Official**

*xzlynebailyes - Modern WhatsApp Web API with Fixed @lid & @jid Issues & Xzlynn Security*

</div>