## XEnv Cli integration
This dir contains all CLI execute types for usage: /DEV, /PROD, /TEST

### CLI commands
```sh
/$ /DEV # without options assumes you have {XENV} dir with .env environments
/$ /DEV xenv_config_dir=/path/to/YOUR_XENV dir # with dir location to .env environments

/$ /PROD # without options assumes you have {XENV} dir with .env environments
/$ /PROD xenv_config_dir=/path/to/YOUR_XENV dir # with dir location to .env environments

/$ /TEST # without options assumes you have {XENV} dir with .env environments
/$ /TEST xenv_config_dir=/path/to/YOUR_XENV dir # with dir location to .env environments

```

### How to handle with process.env and process.argv
Every `node` process starts with `node` ...args, so `process.argv`, and `process.env` will only be available for each process independently.

**The solution**
To make {argv} and {env} available to all node processes we have to update each script where node is called.
Best way to use already updated .env file and update your environment