# Semaphore Status
### Check Semaphore from the CLI!
<p style="text-align:center">
  <img src="https://raw.github.com/mojotech/semaphorestatus/master/logo.png" width="300px"/>
</p>

## `npm install -g semaphorestatus`

### Setup
To tell semaphore-status who you are, you'll need to configure your
Semaphore auth token.  To find your auth token, click on "Settings"
from any of your Semaphore projects.  Then click on the "API" link in
the main settings navigation. Then set
`export SEMAPHORE_AUTH_TOKEN='<API_KEY>'`

#### `and run semaphorestatus`

### CLI Options

`semaphorestatus --force-update` to clear the project cache

`semaphorestatus --project <key>` to show a single project

`semaphorestatus --all` to show all local branches

`semaphorestatus --regex <regular expression>` to filter branches by a regular expression

`semaphorestatus` to show only your local branches