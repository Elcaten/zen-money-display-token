const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const CLIENT_ID = process.env["CLIENT_ID"];
  const CLIENT_SECRET = process.env["CLIENT_SECRET"];
  const REDIRECT_URL = process.env["REDIRECT_URL"];
  const TOKEN_URL = process.env["TOKEN_URL"];

  if (
    CLIENT_ID == null ||
    CLIENT_SECRET == null ||
    REDIRECT_URL == null ||
    TOKEN_URL == null
  ) {
    return {
      statusCode: 500,
      body: "invalid environment variables",
    };
  }

  var code = event.queryStringParameters
    ? event.queryStringParameters.code
    : null;
  if (code == null) {
    return {
      status: 400,
      body: "auth code is misssing",
    };
  }

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URL,
    }),
  }).then((r) => r.json());

  var response = {
    statusCode: 200,
    body: `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title></title>
        <link rel="stylesheet" href="https://unpkg.com/chota@latest">
        <style>
            [lang] {
                display: none;
            }
            [lang=en] {
                display: unset;
            }
            html,
            body {
                height: 100%;
            }
            body {
                display: flex;
                align-items: center;
                justify-content: stretch;
            }
            main {
                position: relative;
            }
            svg {
                fill: var(--color-primary);
                position: absolute;
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                text-align: center;
                width: var(--icon-size);
                top: calc(var(--icon-size) / -2);
            }
            header {
                padding-top: calc(var(--icon-size) / 2);
                text-align: center;
            }
            :root {
                --icon-size: 15rem;
                --color-primary: #168eef;
                --grid-maxWidth: 50rem;
            }
        </style>
    </head>
    <body>
        <main class="container">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/></svg>
                        </div>
                        <header>
                            <h5 lang="en">Copy this token into your application to finish the authorization process:<h5>
                            <h5 lang="ru">Пожалуйста, скопируйте токен в приложение для завершения авторизации:<h5>
                        </header>
                        <div class="row">
                            <div class="col">
                                <input readonly value="${JSON.stringify(
                                  tokenResponse
                                )}"></input>
                            </div>
                        </div>
                        <footer class="is-right">
                            <a class="button primary" onclick="copyText()" lang="en">Copy text</a>
                            <a class="button primary" onclick="copyText()" lang="ru">Скопировать</a>
                        </footer>
                    </div>
                </div>
            </div>
            <div class="row"></div>
        </main>

        <script>
            function copyText() {
                const copyText = document.querySelector("input");
                copyText.select();
                copyText.setSelectionRange(0, 99999); /* For mobile devices */
                document.execCommand("copy");
            } 

            function localize (language)
            {
                if (['ru'].includes(language)) {
                    let lang = ':lang(' + language + ')';
                    let hide = '[lang]:not(' + lang + ')';
                    document.querySelectorAll(hide).forEach(function (node) {
                    node.style.display = 'none';
                    });
                    let show = '[lang]' + lang;
                    document.querySelectorAll(show).forEach(function (node) {
                    node.style.display = 'unset';
                    });
                }
            }
            
            document.addEventListener('DOMContentLoaded', function() {
                localize(window.navigator.language);
            });
        </script>
    </body>
</html>`,
    headers: {
      "Content-Type": "text/html",
    },
  };

  context.succeed(response);
};
