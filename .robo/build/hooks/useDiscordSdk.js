import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get('frame_id') != null;
let discordSdk;
if (isEmbedded) {
    discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
} else {
    // We're using session storage for user_id, guild_id, and channel_id
    // This way the user/guild/channel will be maintained until the tab is closed, even if you refresh
    // Session storage will generate new unique mocks for each tab you open
    // Any of these values can be overridden via query parameters
    // i.e. if you set https://my-tunnel-url.com/?user_id=test_user_id
    // this will override this will override the session user_id value
    const mockUserId = getOverrideOrRandomSessionValue('user_id');
    const mockGuildId = getOverrideOrRandomSessionValue('guild_id');
    const mockChannelId = getOverrideOrRandomSessionValue('channel_id');
    discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, mockGuildId, mockChannelId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);
    discordSdk._updateCommandMocks({
        authenticate: async ()=>{
            return {
                access_token: 'mock_token',
                user: {
                    username: mockUserId,
                    discriminator,
                    id: mockUserId,
                    avatar: null,
                    public_flags: 1
                },
                scopes: [],
                expires: new Date(2112, 1, 1).toString(),
                application: {
                    description: 'mock_app_description',
                    icon: 'mock_app_icon',
                    id: 'mock_app_id',
                    name: 'mock_app_name'
                }
            };
        }
    });
}
export { discordSdk };
var SessionStorageQueryParam;
(function(SessionStorageQueryParam) {
    SessionStorageQueryParam["user_id"] = "user_id";
    SessionStorageQueryParam["guild_id"] = "guild_id";
    SessionStorageQueryParam["channel_id"] = "channel_id";
})(SessionStorageQueryParam || (SessionStorageQueryParam = {}));
function getOverrideOrRandomSessionValue(queryParam) {
    const overrideValue = queryParams.get(queryParam);
    if (overrideValue != null) {
        return overrideValue;
    }
    const currentStoredValue = sessionStorage.getItem(queryParam);
    if (currentStoredValue != null) {
        return currentStoredValue;
    }
    // Set queryParam to a random 8-character string
    const randomString = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(queryParam, randomString);
    return randomString;
}
const DiscordContext = /*#__PURE__*/ createContext({
    accessToken: null,
    authenticated: false,
    discordSdk: discordSdk,
    error: null,
    session: {
        user: {
            id: '',
            username: '',
            discriminator: '',
            avatar: null,
            public_flags: 0
        },
        access_token: '',
        scopes: [],
        expires: '',
        application: {
            rpc_origins: undefined,
            id: '',
            name: '',
            icon: null,
            description: ''
        }
    },
    status: 'pending'
});
export function DiscordContextProvider(props) {
    const { authenticate, children, loadingScreen = null, scope } = props;
    const setupResult = useDiscordSdkSetup({
        authenticate,
        scope
    });
    if (loadingScreen && ![
        'error',
        'ready'
    ].includes(setupResult.status)) {
        return /*#__PURE__*/ React.createElement(React.Fragment, null, loadingScreen);
    }
    return /*#__PURE__*/ React.createElement(DiscordContext.Provider, {
        value: setupResult
    }, children);
}
export function useDiscordSdk() {
    return useContext(DiscordContext);
}
/**
 * Authenticate with Discord and return the access token.
 * See full list of scopes: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 *
 * @param scope The scope of the authorization (default: ['identify', 'guilds'])
 * @returns The result of the Discord SDK `authenticate()` command
 */ export async function authenticateSdk(options) {
    const { scope = [
        'identify',
        'guilds'
    ] } = options ?? {};
    await discordSdk.ready();
    const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: scope
    });
    console.log('code', code);
    console.log('import.meta.env.VITE_DISCORD_CLIENT_ID', import.meta.env.VITE_DISCORD_CLIENT_ID);
    const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code
        })
    });
    const { access_token } = await response.json();
    console.log('access_token', access_token);
    // Authenticate with Discord client (using the access_token)
    const auth = await discordSdk.commands.authenticate({
        access_token
    });
    console.log('auth', auth);
    if (auth == null) {
        throw new Error('Authenticate command failed');
    }
    return {
        accessToken: access_token,
        auth
    };
}
export function useDiscordSdkSetup(options) {
    const { authenticate, scope } = options ?? {};
    const [accessToken, setAccessToken] = useState(null);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('pending');
    const setupDiscordSdk = useCallback(async ()=>{
        try {
            setStatus('loading');
            await discordSdk.ready();
            if (authenticate) {
                setStatus('authenticating');
                const { accessToken, auth } = await authenticateSdk({
                    scope
                });
                setAccessToken(accessToken);
                setSession(auth);
            }
            setStatus('ready');
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred');
            }
            setStatus('error');
        }
    }, [
        authenticate
    ]);
    useStableEffect(()=>{
        setupDiscordSdk();
    });
    return {
        accessToken,
        authenticated: !!accessToken,
        discordSdk,
        error,
        session,
        status
    };
}
/**
 * React in development mode re-mounts the root component initially.
 * This hook ensures that the callback is only called once, preventing double authentication.
 */ function useStableEffect(callback) {
    const isRunning = useRef(false);
    useEffect(()=>{
        if (!isRunning.current) {
            isRunning.current = true;
            callback();
        }
    }, []);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxvbmx5X2toZXJsZW5cXHJvYm8ubXVsdGlcXHNyY1xcaG9va3NcXHVzZURpc2NvcmRTZGsudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpc2NvcmRTREssIERpc2NvcmRTREtNb2NrIH0gZnJvbSAnQGRpc2NvcmQvZW1iZWRkZWQtYXBwLXNkaydcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VSZWYsIGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5cbnR5cGUgVW53cmFwUHJvbWlzZTxUPiA9IFQgZXh0ZW5kcyBQcm9taXNlPGluZmVyIFU+ID8gVSA6IFRcbnR5cGUgRGlzY29yZFNlc3Npb24gPSBVbndyYXBQcm9taXNlPFJldHVyblR5cGU8dHlwZW9mIGRpc2NvcmRTZGsuY29tbWFuZHMuYXV0aGVudGljYXRlPj5cbnR5cGUgQXV0aG9yaXplSW5wdXQgPSBQYXJhbWV0ZXJzPHR5cGVvZiBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhvcml6ZT5bMF1cbnR5cGUgU2RrU2V0dXBSZXN1bHQgPSBSZXR1cm5UeXBlPHR5cGVvZiB1c2VEaXNjb3JkU2RrU2V0dXA+XG5cbmNvbnN0IHF1ZXJ5UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuY29uc3QgaXNFbWJlZGRlZCA9IHF1ZXJ5UGFyYW1zLmdldCgnZnJhbWVfaWQnKSAhPSBudWxsXG5cbmxldCBkaXNjb3JkU2RrOiBEaXNjb3JkU0RLIHwgRGlzY29yZFNES01vY2tcblxuaWYgKGlzRW1iZWRkZWQpIHtcblx0ZGlzY29yZFNkayA9IG5ldyBEaXNjb3JkU0RLKGltcG9ydC5tZXRhLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lEKVxufSBlbHNlIHtcblx0Ly8gV2UncmUgdXNpbmcgc2Vzc2lvbiBzdG9yYWdlIGZvciB1c2VyX2lkLCBndWlsZF9pZCwgYW5kIGNoYW5uZWxfaWRcblx0Ly8gVGhpcyB3YXkgdGhlIHVzZXIvZ3VpbGQvY2hhbm5lbCB3aWxsIGJlIG1haW50YWluZWQgdW50aWwgdGhlIHRhYiBpcyBjbG9zZWQsIGV2ZW4gaWYgeW91IHJlZnJlc2hcblx0Ly8gU2Vzc2lvbiBzdG9yYWdlIHdpbGwgZ2VuZXJhdGUgbmV3IHVuaXF1ZSBtb2NrcyBmb3IgZWFjaCB0YWIgeW91IG9wZW5cblx0Ly8gQW55IG9mIHRoZXNlIHZhbHVlcyBjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgcXVlcnkgcGFyYW1ldGVyc1xuXHQvLyBpLmUuIGlmIHlvdSBzZXQgaHR0cHM6Ly9teS10dW5uZWwtdXJsLmNvbS8/dXNlcl9pZD10ZXN0X3VzZXJfaWRcblx0Ly8gdGhpcyB3aWxsIG92ZXJyaWRlIHRoaXMgd2lsbCBvdmVycmlkZSB0aGUgc2Vzc2lvbiB1c2VyX2lkIHZhbHVlXG5cdGNvbnN0IG1vY2tVc2VySWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCd1c2VyX2lkJylcblx0Y29uc3QgbW9ja0d1aWxkSWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCdndWlsZF9pZCcpXG5cdGNvbnN0IG1vY2tDaGFubmVsSWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCdjaGFubmVsX2lkJylcblxuXHRkaXNjb3JkU2RrID0gbmV3IERpc2NvcmRTREtNb2NrKGltcG9ydC5tZXRhLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lELCBtb2NrR3VpbGRJZCwgbW9ja0NoYW5uZWxJZClcblx0Y29uc3QgZGlzY3JpbWluYXRvciA9IFN0cmluZyhtb2NrVXNlcklkLmNoYXJDb2RlQXQoMCkgJSA1KVxuXG5cdGRpc2NvcmRTZGsuX3VwZGF0ZUNvbW1hbmRNb2Nrcyh7XG5cdFx0YXV0aGVudGljYXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY2Nlc3NfdG9rZW46ICdtb2NrX3Rva2VuJyxcblx0XHRcdFx0dXNlcjoge1xuXHRcdFx0XHRcdHVzZXJuYW1lOiBtb2NrVXNlcklkLFxuXHRcdFx0XHRcdGRpc2NyaW1pbmF0b3IsXG5cdFx0XHRcdFx0aWQ6IG1vY2tVc2VySWQsXG5cdFx0XHRcdFx0YXZhdGFyOiBudWxsLFxuXHRcdFx0XHRcdHB1YmxpY19mbGFnczogMVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzY29wZXM6IFtdLFxuXHRcdFx0XHRleHBpcmVzOiBuZXcgRGF0ZSgyMTEyLCAxLCAxKS50b1N0cmluZygpLFxuXHRcdFx0XHRhcHBsaWNhdGlvbjoge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiAnbW9ja19hcHBfZGVzY3JpcHRpb24nLFxuXHRcdFx0XHRcdGljb246ICdtb2NrX2FwcF9pY29uJyxcblx0XHRcdFx0XHRpZDogJ21vY2tfYXBwX2lkJyxcblx0XHRcdFx0XHRuYW1lOiAnbW9ja19hcHBfbmFtZSdcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcbn1cblxuZXhwb3J0IHsgZGlzY29yZFNkayB9XG5cbmVudW0gU2Vzc2lvblN0b3JhZ2VRdWVyeVBhcmFtIHtcblx0dXNlcl9pZCA9ICd1c2VyX2lkJyxcblx0Z3VpbGRfaWQgPSAnZ3VpbGRfaWQnLFxuXHRjaGFubmVsX2lkID0gJ2NoYW5uZWxfaWQnXG59XG5cbmZ1bmN0aW9uIGdldE92ZXJyaWRlT3JSYW5kb21TZXNzaW9uVmFsdWUocXVlcnlQYXJhbTogYCR7U2Vzc2lvblN0b3JhZ2VRdWVyeVBhcmFtfWApIHtcblx0Y29uc3Qgb3ZlcnJpZGVWYWx1ZSA9IHF1ZXJ5UGFyYW1zLmdldChxdWVyeVBhcmFtKVxuXHRpZiAob3ZlcnJpZGVWYWx1ZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIG92ZXJyaWRlVmFsdWVcblx0fVxuXG5cdGNvbnN0IGN1cnJlbnRTdG9yZWRWYWx1ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0ocXVlcnlQYXJhbSlcblx0aWYgKGN1cnJlbnRTdG9yZWRWYWx1ZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIGN1cnJlbnRTdG9yZWRWYWx1ZVxuXHR9XG5cblx0Ly8gU2V0IHF1ZXJ5UGFyYW0gdG8gYSByYW5kb20gOC1jaGFyYWN0ZXIgc3RyaW5nXG5cdGNvbnN0IHJhbmRvbVN0cmluZyA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDEwKVxuXHRzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKHF1ZXJ5UGFyYW0sIHJhbmRvbVN0cmluZylcblx0cmV0dXJuIHJhbmRvbVN0cmluZ1xufVxuXG5jb25zdCBEaXNjb3JkQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8U2RrU2V0dXBSZXN1bHQ+KHtcblx0YWNjZXNzVG9rZW46IG51bGwsXG5cdGF1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxuXHRkaXNjb3JkU2RrOiBkaXNjb3JkU2RrLFxuXHRlcnJvcjogbnVsbCxcblx0c2Vzc2lvbjoge1xuXHRcdHVzZXI6IHtcblx0XHRcdGlkOiAnJyxcblx0XHRcdHVzZXJuYW1lOiAnJyxcblx0XHRcdGRpc2NyaW1pbmF0b3I6ICcnLFxuXHRcdFx0YXZhdGFyOiBudWxsLFxuXHRcdFx0cHVibGljX2ZsYWdzOiAwXG5cdFx0fSxcblx0XHRhY2Nlc3NfdG9rZW46ICcnLFxuXHRcdHNjb3BlczogW10sXG5cdFx0ZXhwaXJlczogJycsXG5cdFx0YXBwbGljYXRpb246IHtcblx0XHRcdHJwY19vcmlnaW5zOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogJycsXG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdGljb246IG51bGwsXG5cdFx0XHRkZXNjcmlwdGlvbjogJydcblx0XHR9XG5cdH0sXG5cdHN0YXR1czogJ3BlbmRpbmcnXG59KVxuXG5pbnRlcmZhY2UgRGlzY29yZENvbnRleHRQcm92aWRlclByb3BzIHtcblx0YXV0aGVudGljYXRlPzogYm9vbGVhblxuXHRjaGlsZHJlbjogUmVhY3ROb2RlXG5cdGxvYWRpbmdTY3JlZW4/OiBSZWFjdE5vZGVcblx0c2NvcGU/OiBBdXRob3JpemVJbnB1dFsnc2NvcGUnXVxufVxuZXhwb3J0IGZ1bmN0aW9uIERpc2NvcmRDb250ZXh0UHJvdmlkZXIocHJvcHM6IERpc2NvcmRDb250ZXh0UHJvdmlkZXJQcm9wcykge1xuXHRjb25zdCB7IGF1dGhlbnRpY2F0ZSwgY2hpbGRyZW4sIGxvYWRpbmdTY3JlZW4gPSBudWxsLCBzY29wZSB9ID0gcHJvcHNcblx0Y29uc3Qgc2V0dXBSZXN1bHQgPSB1c2VEaXNjb3JkU2RrU2V0dXAoeyBhdXRoZW50aWNhdGUsIHNjb3BlIH0pXG5cblx0aWYgKGxvYWRpbmdTY3JlZW4gJiYgIVsnZXJyb3InLCAncmVhZHknXS5pbmNsdWRlcyhzZXR1cFJlc3VsdC5zdGF0dXMpKSB7XG5cdFx0cmV0dXJuIDw+e2xvYWRpbmdTY3JlZW59PC8+XG5cdH1cblxuXHRyZXR1cm4gPERpc2NvcmRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzZXR1cFJlc3VsdH0+e2NoaWxkcmVufTwvRGlzY29yZENvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEaXNjb3JkU2RrKCkge1xuXHRyZXR1cm4gdXNlQ29udGV4dChEaXNjb3JkQ29udGV4dClcbn1cblxuaW50ZXJmYWNlIEF1dGhlbnRpY2F0ZVNka09wdGlvbnMge1xuXHRzY29wZT86IEF1dGhvcml6ZUlucHV0WydzY29wZSddXG59XG5cbi8qKlxuICogQXV0aGVudGljYXRlIHdpdGggRGlzY29yZCBhbmQgcmV0dXJuIHRoZSBhY2Nlc3MgdG9rZW4uXG4gKiBTZWUgZnVsbCBsaXN0IG9mIHNjb3BlczogaHR0cHM6Ly9kaXNjb3JkLmNvbS9kZXZlbG9wZXJzL2RvY3MvdG9waWNzL29hdXRoMiNzaGFyZWQtcmVzb3VyY2VzLW9hdXRoMi1zY29wZXNcbiAqXG4gKiBAcGFyYW0gc2NvcGUgVGhlIHNjb3BlIG9mIHRoZSBhdXRob3JpemF0aW9uIChkZWZhdWx0OiBbJ2lkZW50aWZ5JywgJ2d1aWxkcyddKVxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgRGlzY29yZCBTREsgYGF1dGhlbnRpY2F0ZSgpYCBjb21tYW5kXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdXRoZW50aWNhdGVTZGsob3B0aW9ucz86IEF1dGhlbnRpY2F0ZVNka09wdGlvbnMpIHtcblx0Y29uc3QgeyBzY29wZSA9IFsnaWRlbnRpZnknLCAnZ3VpbGRzJ10gfSA9IG9wdGlvbnMgPz8ge31cblxuXHRhd2FpdCBkaXNjb3JkU2RrLnJlYWR5KClcblx0Y29uc3QgeyBjb2RlIH0gPSBhd2FpdCBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhvcml6ZSh7XG5cdFx0Y2xpZW50X2lkOiBpbXBvcnQubWV0YS5lbnYuVklURV9ESVNDT1JEX0NMSUVOVF9JRCxcblx0XHRyZXNwb25zZV90eXBlOiAnY29kZScsXG5cdFx0c3RhdGU6ICcnLFxuXHRcdHByb21wdDogJ25vbmUnLFxuXHRcdHNjb3BlOiBzY29wZVxuXHR9KVxuXG5cdGNvbnNvbGUubG9nKCdjb2RlJywgY29kZSlcblx0Y29uc29sZS5sb2coJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lEJywgaW1wb3J0Lm1ldGEuZW52LlZJVEVfRElTQ09SRF9DTElFTlRfSUQpXG5cblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2FwaS90b2tlbicsIHtcblx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cdFx0fSxcblx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNvZGUgfSlcblx0fSlcblx0Y29uc3QgeyBhY2Nlc3NfdG9rZW4gfSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuXG5cdGNvbnNvbGUubG9nKCdhY2Nlc3NfdG9rZW4nLCBhY2Nlc3NfdG9rZW4pXG5cblx0Ly8gQXV0aGVudGljYXRlIHdpdGggRGlzY29yZCBjbGllbnQgKHVzaW5nIHRoZSBhY2Nlc3NfdG9rZW4pXG5cdGNvbnN0IGF1dGggPSBhd2FpdCBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhlbnRpY2F0ZSh7IGFjY2Vzc190b2tlbiB9KVxuXG5cdGNvbnNvbGUubG9nKCdhdXRoJywgYXV0aClcblxuXHRpZiAoYXV0aCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGUgY29tbWFuZCBmYWlsZWQnKVxuXHR9XG5cdHJldHVybiB7IGFjY2Vzc1Rva2VuOiBhY2Nlc3NfdG9rZW4sIGF1dGggfVxufVxuXG5pbnRlcmZhY2UgVXNlRGlzY29yZFNka1NldHVwT3B0aW9ucyB7XG5cdGF1dGhlbnRpY2F0ZT86IGJvb2xlYW5cblx0c2NvcGU/OiBBdXRob3JpemVJbnB1dFsnc2NvcGUnXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGlzY29yZFNka1NldHVwKG9wdGlvbnM/OiBVc2VEaXNjb3JkU2RrU2V0dXBPcHRpb25zKSB7XG5cdGNvbnN0IHsgYXV0aGVudGljYXRlLCBzY29wZSB9ID0gb3B0aW9ucyA/PyB7fVxuXHRjb25zdCBbYWNjZXNzVG9rZW4sIHNldEFjY2Vzc1Rva2VuXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG5cdGNvbnN0IFtzZXNzaW9uLCBzZXRTZXNzaW9uXSA9IHVzZVN0YXRlPERpc2NvcmRTZXNzaW9uIHwgbnVsbD4obnVsbClcblx0Y29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuXHRjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8J2F1dGhlbnRpY2F0aW5nJyB8ICdlcnJvcicgfCAnbG9hZGluZycgfCAncGVuZGluZycgfCAncmVhZHknPigncGVuZGluZycpXG5cblx0Y29uc3Qgc2V0dXBEaXNjb3JkU2RrID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRzZXRTdGF0dXMoJ2xvYWRpbmcnKVxuXHRcdFx0YXdhaXQgZGlzY29yZFNkay5yZWFkeSgpXG5cblx0XHRcdGlmIChhdXRoZW50aWNhdGUpIHtcblx0XHRcdFx0c2V0U3RhdHVzKCdhdXRoZW50aWNhdGluZycpXG5cdFx0XHRcdGNvbnN0IHsgYWNjZXNzVG9rZW4sIGF1dGggfSA9IGF3YWl0IGF1dGhlbnRpY2F0ZVNkayh7IHNjb3BlIH0pXG5cdFx0XHRcdHNldEFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuKVxuXHRcdFx0XHRzZXRTZXNzaW9uKGF1dGgpXG5cdFx0XHR9XG5cblx0XHRcdHNldFN0YXR1cygncmVhZHknKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSlcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdFx0c2V0RXJyb3IoZS5tZXNzYWdlKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0RXJyb3IoJ0FuIHVua25vd24gZXJyb3Igb2NjdXJyZWQnKVxuXHRcdFx0fVxuXHRcdFx0c2V0U3RhdHVzKCdlcnJvcicpXG5cdFx0fVxuXHR9LCBbYXV0aGVudGljYXRlXSlcblxuXHR1c2VTdGFibGVFZmZlY3QoKCkgPT4ge1xuXHRcdHNldHVwRGlzY29yZFNkaygpXG5cdH0pXG5cblx0cmV0dXJuIHsgYWNjZXNzVG9rZW4sIGF1dGhlbnRpY2F0ZWQ6ICEhYWNjZXNzVG9rZW4sIGRpc2NvcmRTZGssIGVycm9yLCBzZXNzaW9uLCBzdGF0dXMgfVxufVxuXG4vKipcbiAqIFJlYWN0IGluIGRldmVsb3BtZW50IG1vZGUgcmUtbW91bnRzIHRoZSByb290IGNvbXBvbmVudCBpbml0aWFsbHkuXG4gKiBUaGlzIGhvb2sgZW5zdXJlcyB0aGF0IHRoZSBjYWxsYmFjayBpcyBvbmx5IGNhbGxlZCBvbmNlLCBwcmV2ZW50aW5nIGRvdWJsZSBhdXRoZW50aWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdXNlU3RhYmxlRWZmZWN0KGNhbGxiYWNrOiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPikge1xuXHRjb25zdCBpc1J1bm5pbmcgPSB1c2VSZWYoZmFsc2UpXG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIWlzUnVubmluZy5jdXJyZW50KSB7XG5cdFx0XHRpc1J1bm5pbmcuY3VycmVudCA9IHRydWVcblx0XHRcdGNhbGxiYWNrKClcblx0XHR9XG5cdH0sIFtdKVxufVxuIl0sIm5hbWVzIjpbIkRpc2NvcmRTREsiLCJEaXNjb3JkU0RLTW9jayIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ2FsbGJhY2siLCJ1c2VSZWYiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInF1ZXJ5UGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJpc0VtYmVkZGVkIiwiZ2V0IiwiZGlzY29yZFNkayIsImVudiIsIlZJVEVfRElTQ09SRF9DTElFTlRfSUQiLCJtb2NrVXNlcklkIiwiZ2V0T3ZlcnJpZGVPclJhbmRvbVNlc3Npb25WYWx1ZSIsIm1vY2tHdWlsZElkIiwibW9ja0NoYW5uZWxJZCIsImRpc2NyaW1pbmF0b3IiLCJTdHJpbmciLCJjaGFyQ29kZUF0IiwiX3VwZGF0ZUNvbW1hbmRNb2NrcyIsImF1dGhlbnRpY2F0ZSIsImFjY2Vzc190b2tlbiIsInVzZXIiLCJ1c2VybmFtZSIsImlkIiwiYXZhdGFyIiwicHVibGljX2ZsYWdzIiwic2NvcGVzIiwiZXhwaXJlcyIsIkRhdGUiLCJ0b1N0cmluZyIsImFwcGxpY2F0aW9uIiwiZGVzY3JpcHRpb24iLCJpY29uIiwibmFtZSIsIlNlc3Npb25TdG9yYWdlUXVlcnlQYXJhbSIsInF1ZXJ5UGFyYW0iLCJvdmVycmlkZVZhbHVlIiwiY3VycmVudFN0b3JlZFZhbHVlIiwic2Vzc2lvblN0b3JhZ2UiLCJnZXRJdGVtIiwicmFuZG9tU3RyaW5nIiwiTWF0aCIsInJhbmRvbSIsInNsaWNlIiwic2V0SXRlbSIsIkRpc2NvcmRDb250ZXh0IiwiYWNjZXNzVG9rZW4iLCJhdXRoZW50aWNhdGVkIiwiZXJyb3IiLCJzZXNzaW9uIiwicnBjX29yaWdpbnMiLCJ1bmRlZmluZWQiLCJzdGF0dXMiLCJEaXNjb3JkQ29udGV4dFByb3ZpZGVyIiwicHJvcHMiLCJjaGlsZHJlbiIsImxvYWRpbmdTY3JlZW4iLCJzY29wZSIsInNldHVwUmVzdWx0IiwidXNlRGlzY29yZFNka1NldHVwIiwiaW5jbHVkZXMiLCJQcm92aWRlciIsInZhbHVlIiwidXNlRGlzY29yZFNkayIsImF1dGhlbnRpY2F0ZVNkayIsIm9wdGlvbnMiLCJyZWFkeSIsImNvZGUiLCJjb21tYW5kcyIsImF1dGhvcml6ZSIsImNsaWVudF9pZCIsInJlc3BvbnNlX3R5cGUiLCJzdGF0ZSIsInByb21wdCIsImNvbnNvbGUiLCJsb2ciLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbiIsImF1dGgiLCJFcnJvciIsInNldEFjY2Vzc1Rva2VuIiwic2V0U2Vzc2lvbiIsInNldEVycm9yIiwic2V0U3RhdHVzIiwic2V0dXBEaXNjb3JkU2RrIiwiZSIsIm1lc3NhZ2UiLCJ1c2VTdGFibGVFZmZlY3QiLCJjYWxsYmFjayIsImlzUnVubmluZyIsImN1cnJlbnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsRUFBRUMsY0FBYyxRQUFRLDRCQUEyQjtBQUN0RSxTQUFTQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxNQUFNLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxRQUFRLFFBQU87QUFRM0YsTUFBTUMsY0FBYyxJQUFJQyxnQkFBZ0JDLE9BQU9DLFFBQVEsQ0FBQ0MsTUFBTTtBQUM5RCxNQUFNQyxhQUFhTCxZQUFZTSxHQUFHLENBQUMsZUFBZTtBQUVsRCxJQUFJQztBQUVKLElBQUlGLFlBQVk7SUFDZkUsYUFBYSxJQUFJZixXQUFXLFlBQVlnQixHQUFHLENBQUNDLHNCQUFzQjtBQUNuRSxPQUFPO0lBQ04sb0VBQW9FO0lBQ3BFLGtHQUFrRztJQUNsRyx1RUFBdUU7SUFDdkUsNkRBQTZEO0lBQzdELGtFQUFrRTtJQUNsRSxrRUFBa0U7SUFDbEUsTUFBTUMsYUFBYUMsZ0NB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