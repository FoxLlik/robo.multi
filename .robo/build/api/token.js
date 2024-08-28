export default (async (req)=>{
    const { code } = await req.json();
    console.log('code', code);
    console.log('process.env.VITE_DISCORD_CLIENT_ID', process.env.VITE_DISCORD_CLIENT_ID);
    console.log('process.env.VITE_DISCORD_CLIENT_ID!', process.env.VITE_DISCORD_CLIENT_ID);
    console.log('process.env.DISCORD_CLIENT_SECRET', process.env.DISCORD_CLIENT_SECRET);
    console.log('process.env.DISCORD_CLIENT_SECRET!', process.env.DISCORD_CLIENT_SECRET);
    // Exchange the code for an access_token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code
        })
    });
    const { access_token } = await response.json();
    console.log('access_token ==> ', access_token);
    return {
        access_token
    };
});
