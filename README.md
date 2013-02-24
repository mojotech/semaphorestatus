a simple way to check all the branches on semaphore for their current status from the CLI

`npm install -g semaphorestatus`

To tell semaphoreStatus who you are, you'll need to configure your
Semaphore auth token.  To find your auth token, click on "Settings"
from any of your Semaphore projects.  Then click on the "API" link in
the main settings navigation.  Once you've found it, put this value in
the environment variable "SEMAPHORE_AUTH_TOKEN":

`export SEMAPHORE_AUTH_TOKEN='<API_KEY>'`

Now, you're to simple run "semaphorestatus".  Running this command
will give you more information about how to observe specific projects
and branches.

CLI Options

`semaphorestatus --force-update` to clear the project cache

`semaphorestatus --project <key>` to show a single project

`semaphorestatus --all` to show all local branches

`semaphorestatus` to show only your local branches