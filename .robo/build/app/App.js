import { DiscordContextProvider } from "../hooks/useDiscordSdk.js";
import { Activity } from "./Activity.js";
import "./App.css";
/**
 * 🔒 Set `authenticate` to true to enable Discord authentication
 * You can also set the `scope` prop to request additional permissions
 *
 * Example:
 * ```tsx
 * <DiscordContextProvider authenticate scope={['identify', 'guilds']}>
 * ```
 */ export default function App() {
    return /*#__PURE__*/ React.createElement(DiscordContextProvider, {
        authenticate: true,
        scope: [
            'identify',
            'guilds'
        ]
    }, /*#__PURE__*/ React.createElement(Activity, null));
}
