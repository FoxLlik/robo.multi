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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxvbmx5X2toZXJsZW5cXHJvYm8ubXVsdGlcXHNyY1xcYXBwXFxBcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpc2NvcmRDb250ZXh0UHJvdmlkZXIgfSBmcm9tICcuLi9ob29rcy91c2VEaXNjb3JkU2RrJ1xuaW1wb3J0IHsgQWN0aXZpdHkgfSBmcm9tICcuL0FjdGl2aXR5J1xuaW1wb3J0ICcuL0FwcC5jc3MnXG5cbi8qKlxuICog8J+UkiBTZXQgYGF1dGhlbnRpY2F0ZWAgdG8gdHJ1ZSB0byBlbmFibGUgRGlzY29yZCBhdXRoZW50aWNhdGlvblxuICogWW91IGNhbiBhbHNvIHNldCB0aGUgYHNjb3BlYCBwcm9wIHRvIHJlcXVlc3QgYWRkaXRpb25hbCBwZXJtaXNzaW9uc1xuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGB0c3hcbiAqIDxEaXNjb3JkQ29udGV4dFByb3ZpZGVyIGF1dGhlbnRpY2F0ZSBzY29wZT17WydpZGVudGlmeScsICdndWlsZHMnXX0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKCkge1xuXHRyZXR1cm4gKFxuXHRcdDxEaXNjb3JkQ29udGV4dFByb3ZpZGVyIGF1dGhlbnRpY2F0ZSBzY29wZT17WydpZGVudGlmeScsICdndWlsZHMnXX0+XG5cdFx0XHQ8QWN0aXZpdHkgLz5cblx0XHQ8L0Rpc2NvcmRDb250ZXh0UHJvdmlkZXI+XG5cdClcbn1cbiJdLCJuYW1lcyI6WyJEaXNjb3JkQ29udGV4dFByb3ZpZGVyIiwiQWN0aXZpdHkiLCJBcHAiLCJhdXRoZW50aWNhdGUiLCJzY29wZSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0Esc0JBQXNCLFFBQVEsNEJBQXdCO0FBQy9ELFNBQVNDLFFBQVEsUUFBUSxnQkFBWTtBQUNyQyxPQUFPLFlBQVc7QUFFbEI7Ozs7Ozs7O0NBUUMsR0FDRCxlQUFlLFNBQVNDO0lBQ3ZCLHFCQUNDLG9CQUFDRjtRQUF1QkcsY0FBQUE7UUFBYUMsT0FBTztZQUFDO1lBQVk7U0FBUztxQkFDakUsb0JBQUNIO0FBR0oifQ==