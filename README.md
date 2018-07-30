To install:

```
npm install
```

To run:

```
npm start
```

You must set:

* `SLACK_CLIENT_ID`: your slack client id
* `SLACK_CLIENT_SECRET`: your slack client secret
* `FACEBOOK_ACCESS_TOKEN`: your facebook access token
* `FACEBOOK_VERIFY_TOKEN`: your facebook verify token
* `SLACK_APP_URL`: your slack redirect url
* `SONARR_TOKEN`: the sonarr api token
* `SONARR_ADDRESS`: sonarr address
* `SONARR_PROFILE_ID`: sonarr quality profile (3 for HD)
* `SONARR_ROOT_FOLDER`: sonarr root directory (e.g. /tv/).
* `RADARR_PUBLIC`: radarr public URL.
* `RADARR_TOKEN`: the radarr api token
* `RADARR_ADDRESS`: radarr address
* `RADARR_PROFILE_ID`: radarr quality profile (0 for all)
* `RADARR_ROOT_FOLDER`: radarr root directory (e.g. /movies/).
* `RADARR_PUBLIC`: radarr public URL.
* `COUCHPOTATO_TOKEN`: your couchpotato api token
* `COUCHPOTATO_ADDRESS`: your couchpotato internal address
* `COUCHPOTATO_PUBLIC`: your couchpotato public address
* `PLEXBOT_DATABASE`: path to where plexbot should store oauth info.

# Facebook setup

To setup Facebook, [follow the Botkit guide to setup your Facebook application](https://www.botkit.ai/docs/provisioning/facebook_messenger.html).

You can add any users as "Testers" in your Facebook application without publishing it.

Make sure to add your `RADARR_PUBLIC` and `SONARR_PUBLIC` URLs to the application's
Messenger whitelist.

