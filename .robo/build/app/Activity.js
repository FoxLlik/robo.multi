import { useEffect, useState } from "react";
import { useDiscordSdk } from "../hooks/useDiscordSdk.js";
export const Activity = ()=>{
    const { authenticated, discordSdk, status, session } = useDiscordSdk();
    const [channelName, setChannelName] = useState();
    useEffect(()=>{
        // Requesting the channel in GDMs (when the guild ID is null) requires
        // the dm_channels.read scope which requires Discord approval.
        if (!authenticated || !discordSdk.channelId || !discordSdk.guildId) {
            return;
        }
        // Collect channel info over RPC
        // Enable authentication to see it! (App.tsx)
        discordSdk.commands.getChannel({
            channel_id: discordSdk.channelId
        }).then((channel)=>{
            if (channel.name) {
                setChannelName(channel.name);
            }
        });
    }, [
        authenticated,
        discordSdk
    ]);
    return /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("img", {
        src: "/rocket.png",
        className: "logo",
        alt: "Discord"
    }), /*#__PURE__*/ React.createElement("h1", null, "Hello, World"), channelName ? /*#__PURE__*/ React.createElement("h3", null, "#", channelName) : /*#__PURE__*/ React.createElement("h3", null, status), session != null ? /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("img", {
        src: `https://cdn.discordapp.com/avatars/${session?.user?.id}/${session?.user?.avatar}.webp?size=128`,
        alt: ""
    }), /*#__PURE__*/ React.createElement("br", null), "Юу байна, ", session?.user?.username) : /*#__PURE__*/ React.createElement(React.Fragment, null), /*#__PURE__*/ React.createElement("small", null, "Powered by ", /*#__PURE__*/ React.createElement("strong", null, "Robo.js")));
};
