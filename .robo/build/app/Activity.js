import { useEffect, useState } from "react";
import { useDiscordSdk } from "../hooks/useDiscordSdk.js";
export const Activity = ()=>{
    const { authenticated, discordSdk, status } = useDiscordSdk();
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
    }), /*#__PURE__*/ React.createElement("h1", null, "Hello, World"), channelName ? /*#__PURE__*/ React.createElement("h3", null, "#", channelName) : /*#__PURE__*/ React.createElement("h3", null, status), /*#__PURE__*/ React.createElement("small", null, "Powered by ", /*#__PURE__*/ React.createElement("strong", null, "Robo.js")));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxvbmx5X2toZXJsZW5cXHJvYm8ubXVsdGlcXHNyY1xcYXBwXFxBY3Rpdml0eS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRGlzY29yZFNkayB9IGZyb20gJy4uL2hvb2tzL3VzZURpc2NvcmRTZGsnXG5cbmV4cG9ydCBjb25zdCBBY3Rpdml0eSA9ICgpID0+IHtcblx0Y29uc3QgeyBhdXRoZW50aWNhdGVkLCBkaXNjb3JkU2RrLCBzdGF0dXMgfSA9IHVzZURpc2NvcmRTZGsoKVxuXHRjb25zdCBbY2hhbm5lbE5hbWUsIHNldENoYW5uZWxOYW1lXSA9IHVzZVN0YXRlPHN0cmluZz4oKVxuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0Ly8gUmVxdWVzdGluZyB0aGUgY2hhbm5lbCBpbiBHRE1zICh3aGVuIHRoZSBndWlsZCBJRCBpcyBudWxsKSByZXF1aXJlc1xuXHRcdC8vIHRoZSBkbV9jaGFubmVscy5yZWFkIHNjb3BlIHdoaWNoIHJlcXVpcmVzIERpc2NvcmQgYXBwcm92YWwuXG5cdFx0aWYgKCFhdXRoZW50aWNhdGVkIHx8ICFkaXNjb3JkU2RrLmNoYW5uZWxJZCB8fCAhZGlzY29yZFNkay5ndWlsZElkKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHQvLyBDb2xsZWN0IGNoYW5uZWwgaW5mbyBvdmVyIFJQQ1xuXHRcdC8vIEVuYWJsZSBhdXRoZW50aWNhdGlvbiB0byBzZWUgaXQhIChBcHAudHN4KVxuXHRcdGRpc2NvcmRTZGsuY29tbWFuZHMuZ2V0Q2hhbm5lbCh7IGNoYW5uZWxfaWQ6IGRpc2NvcmRTZGsuY2hhbm5lbElkIH0pLnRoZW4oKGNoYW5uZWwpID0+IHtcblx0XHRcdGlmIChjaGFubmVsLm5hbWUpIHtcblx0XHRcdFx0c2V0Q2hhbm5lbE5hbWUoY2hhbm5lbC5uYW1lKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH0sIFthdXRoZW50aWNhdGVkLCBkaXNjb3JkU2RrXSlcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXY+XG5cdFx0XHQ8aW1nIHNyYz1cIi9yb2NrZXQucG5nXCIgY2xhc3NOYW1lPVwibG9nb1wiIGFsdD1cIkRpc2NvcmRcIiAvPlxuXHRcdFx0PGgxPkhlbGxvLCBXb3JsZDwvaDE+XG5cdFx0XHR7Y2hhbm5lbE5hbWUgPyA8aDM+I3tjaGFubmVsTmFtZX08L2gzPiA6IDxoMz57c3RhdHVzfTwvaDM+fVxuXHRcdFx0PHNtYWxsPlxuXHRcdFx0XHRQb3dlcmVkIGJ5IDxzdHJvbmc+Um9iby5qczwvc3Ryb25nPlxuXHRcdFx0PC9zbWFsbD5cblx0XHQ8L2Rpdj5cblx0KVxufVxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlRGlzY29yZFNkayIsIkFjdGl2aXR5IiwiYXV0aGVudGljYXRlZCIsImRpc2NvcmRTZGsiLCJzdGF0dXMiLCJjaGFubmVsTmFtZSIsInNldENoYW5uZWxOYW1lIiwiY2hhbm5lbElkIiwiZ3VpbGRJZCIsImNvbW1hbmRzIiwiZ2V0Q2hhbm5lbCIsImNoYW5uZWxfaWQiLCJ0aGVuIiwiY2hhbm5lbCIsIm5hbWUiLCJkaXYiLCJpbWciLCJzcmMiLCJjbGFzc05hbWUiLCJhbHQiLCJoMSIsImgzIiwic21hbGwiLCJzdHJvbmciXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFNBQVMsRUFBRUMsUUFBUSxRQUFRLFFBQU87QUFDM0MsU0FBU0MsYUFBYSxRQUFRLDRCQUF3QjtBQUV0RCxPQUFPLE1BQU1DLFdBQVc7SUFDdkIsTUFBTSxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFFLEdBQUdKO0lBQzlDLE1BQU0sQ0FBQ0ssYUFBYUMsZUFBZSxHQUFHUDtJQUV0Q0QsVUFBVTtRQUNULHNFQUFzRTtRQUN0RSw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDSSxpQkFBaUIsQ0FBQ0MsV0FBV0ksU0FBUyxJQUFJLENBQUNKLFdBQVdLLE9BQU8sRUFBRTtZQUNuRTtRQUNEO1FBRUEsZ0NBQWdDO1FBQ2hDLDZDQUE2QztRQUM3Q0wsV0FBV00sUUFBUSxDQUFDQyxVQUFVLENBQUM7WUFBRUMsWUFBWVIsV0FBV0ksU0FBUztRQUFDLEdBQUdLLElBQUksQ0FBQyxDQUFDQztZQUMxRSxJQUFJQSxRQUFRQyxJQUFJLEVBQUU7Z0JBQ2pCUixlQUFlTyxRQUFRQyxJQUFJO1lBQzVCO1FBQ0Q7SUFDRCxHQUFHO1FBQUNaO1FBQWVDO0tBQVc7SUFFOUIscUJBQ0Msb0JBQUNZLDJCQUNBLG9CQUFDQztRQUFJQyxLQUFJO1FBQWNDLFdBQVU7UUFBT0MsS0FBSTtzQkFDNUMsb0JBQUNDLFlBQUcsaUJBQ0hmLDRCQUFjLG9CQUFDZ0IsWUFBRyxLQUFFaEIsNkJBQW9CLG9CQUFDZ0IsWUFBSWpCLHVCQUM5QyxvQkFBQ2tCLGVBQU0sNkJBQ0ssb0JBQUNDLGdCQUFPO0FBSXZCLEVBQUMifQ==