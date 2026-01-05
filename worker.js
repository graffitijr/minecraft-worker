//Back End template with cookies - made my NOAH RICHARDS  ---------------------------CAN ONLY USE ON MOBILE IF WORKER IS ON SUBDOMAIN ex. https://worker.fhcsports.site

export default {
    // This function runs whenever a request hits your worker's URL.
    async fetch(request, env) {
        // Create a URL object so we can look at the path and query string easily.
        const url = new URL(request.url);

        // Simple CORS headers so your frontend (Pages or other) can call this worker freely.
        const corsHeaders = {
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*"
        };

        //adds helpful query perameter help

        function GetQueryParam(url, keys) {
            const params = new URL(url).searchParams;
            const result = {};
            for (const key of keys) {
                result[key] = params.get(key);
            }
            return result;
        }

        function GetURL() {
            return url.href
        }

        async function DeleteOldMessages() {
            let messages = await env.GlobalStorage.list();
            for (const item of messages.keys) {
                let timestamp = item.name;
                if ((Math.floor(Date.now() / 1000) - timestamp) >= 10) {
                    await env.GlobalStorage.delete(item.name);
                }
            }
        }


        // Handle browser preflight for POSTs
        if (request.method === "OPTIONS") {
            return new Response(null, {status: 204, headers: corsHeaders});
        }

        //MAIN PART - handles get and post ---------------------------------------------------------------------------------------------------------------- change after this
        //examples at end of code

        if (url.pathname === "/get-messages" && request.method === "GET") {
            let messages = await env.GlobalStorage.list();
            messages = messages ? messages : [];

            await DeleteOldMessages()

            return new Response(JSON.stringify(messages), {status: 200, headers: corsHeaders});
        }

        if (url.pathname === "/send-message" && request.method === "POST") {
            let packet = await request.json();

            await env.GlobalStorage.put(Math.floor(new Date().getTime() / 1000), JSON.stringify(packet))

            await DeleteOldMessages()

            return new Response("Message Received", {status: 200, headers: corsHeaders});
        }


        return new Response("Not found", {status: 404, headers: corsHeaders});
    }
}

//----------------------------------------------------------------------------------------------------------------------------------EXAMPLES

/* example get


        if (url.pathname === "/get-content" && request.method === "GET") {
            let content = await env.GlobalStorage.get("stories");
            content = content ? content : [];

            return new Response(content, {status: 200, headers: corsHeaders});
        }
        */


/* example post

if (url.pathname === "/login" && request.method === "POST") {
    let [username, password] = await request.json();

    if (CorrectAccounts[username] === password) {
        let token = await GenerateStoreReturnToken(username, password);

        return new Response("login success", {
            headers: {
                "Set-Cookie": `session=${token}; Domain=.fhcsports.site; Path=/; HttpOnly; Secure; SameSite=None`,                  <-------------   SET COOKIE
                ...corsHeaders,
            }
        });
    }
    return new Response("invalid login", {status: 404, headers: corsHeaders});
}

 */
