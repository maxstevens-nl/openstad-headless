require('dotenv').config();

const apostrophe = require('apostrophe');
const express = require('express');
const app = express();
const projectService = require('./services/projects');
const aposConfig = require('./lib/apos-config');
const REFRESH_PROJECTS_INTERVAL = 60000 * 5;
const messageStreaming = require('./services/message-streaming');

const basicAuth = require('express-basic-auth');
const path = require('node:path');

let projects = {};
/** @type {Object<string, import('redis').RedisClientType>} */
let subscriptions = {}
const apostropheServer = {};

let startUpIsBusy = false;
let startUpQueue = [];

const apostropheRootDir = process.env.APOS_ROOT_DIR ?? __dirname;

// list files in directory
// const files = require('fs').readdirSync(publicPath);
// console.log("===> files in public dir", publicPath, files);

const publicPath = path.join(apostropheRootDir, 'public');
console.log("apos root dir:", apostropheRootDir, publicPath);
app.use(express.static(publicPath));

app.use('/:sitePrefix?/config-reset', async function (_, __, next) {
  await loadProjects();
  next();
});

function createReturnUrl(req) {
  // check in url if returnTo params is set for redirecting to page
  // req.session.returnTo = req.query.returnTo ? decodeURIComponent(req.query.returnTo) : null;
  //const thisHost = req.headers['x-forwarded-host'] || req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  let returnUrl = protocol + '://' + req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  if (req.query.returnTo && typeof req.query.returnTo === 'string') {
    // only get the pathname to prevent external redirects
    let pathToReturnTo = new URL(req.query.returnTo, true);
    pathToReturnTo = pathToReturnTo.pathname;
    returnUrl = returnUrl + pathToReturnTo;
  }
  return returnUrl;
}

async function setupProject(project) {
  if (!project.url) return;

  console.log(project.url, process.env.FORCE_HTTP);

  // We are no longer saving the protocol in the database, but we need a
  // protocol to be able to use `Url.parse` to get the host.
  if (!project.url.startsWith('http://') && !project.url.startsWith('https://')) {
    const protocol = process.env.FORCE_HTTP === 'yes' ? 'http://' : 'https://';
    project.domain = project.url;
    project.url = protocol + project.url;
  }

  let url = new URL(project.url);

  const domain = url.host + (url.pathname !== '/' ? url.pathname : '');

  console.log(`Setting up project. domain: {${domain}}; url: {${project.url}}`);

  // for convenience and speed we set the domain name as the key
  projects[domain] = project;

  // add event subscription
  if (!subscriptions[project.id]) {
    let subscriber = await messageStreaming.getSubscriber();
    if (subscriber) {
      subscriptions[project.id] = subscriber;
      await subscriptions[project.id].subscribe(`project-${project.id}-update`, () => {
        if (apostropheServer[project.domain]) {
          // restart the server with the new settings
          apostropheServer[project.domain].apos.destroy();
          delete apostropheServer[project.domain];
        }

        loadProject(project.id)
      });
    } else {
      console.log('No subscriber found');
    }
  }

}

async function loadProject(projectId) {
  const project = await projectService.fetchOne(projectId);
  setupProject(project)
}

async function loadProjects() {
  try {
    projects = {};

    const allProjects = await projectService.fetchAll();

    console.log(allProjects);

    allProjects.forEach(project => 
      setupProject(project)
    );

    // add event subscription
    if (!subscriptions['all']) {
      let subscriber = await messageStreaming.getSubscriber();
      if (subscriber) {
        subscriptions['all'] = subscriber;
        await subscriptions['all'].subscribe(`project-urls-update`, () => loadProjects());
        await subscriptions['all'].subscribe(`new-project`, () => loadProjects());
      } else {
        console.log('No subscriber found');
      }
    }

    cleanUpProjects();
  } catch(err) {
    console.log('Error fetching projects:', err);
  }
}

// run through all projects see if anyone is not active anymore and needs to be shut down
function cleanUpProjects() {
  const runningDomains = Object.keys(apostropheServer);

  if (runningDomains) {
    runningDomains.forEach((runningDomain) => {
      if (!projects[runningDomain]) {
        try {
          apostropheServer[runningDomain].apos.destroy();
        } catch (e) {
          console.log('Error stopping project', e);
        }

        delete apostropheServer[runningDomain];
      }
    });
  }
}

async function doStartServer(domain, req, res) {
  if (!apostropheServer[domain]) {
    console.log('Starting up project: ', domain);
    apostropheServer[domain] = await run(domain, projects[domain], {});
    apostropheServer[domain].app.set('trust proxy', true);
    apostropheServer[domain].app(req, res);
    return Promise.resolve();
  }
}

async function run(id, projectData, _, callback) {
  // Get host from projectData url
  const url = new URL(projectData.url);
  const protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
  projectData.url = protocol + url.hostname + (url.port ? ':' + url.port : '');

  const projectConfig = {
    ...aposConfig,
    baseUrl: projectData.url,
    options: projectData,
    project: projectData,
    _id: id,
    shortName: 'openstad-' + projectData.id,
    mongo: {},
    prefix: projectData.sitePrefix ? '/' + projectData.sitePrefix : false,
    rootDir: apostropheRootDir,
  };

  if (process.env.MONGODB_URI) {
    // Apply the MongoDB prefix (if given) to the database name,
    // and ensure we don't exceed the MongoDB database name length limit
    const dbPrefix = process.env.MONGODB_PREFIX ? process.env.MONGODB_PREFIX + (!process.env.MONGODB_PREFIX.endsWith('_') ? '_' : '') : '';
    const dbName = (dbPrefix + (projectConfig.shortName)).substring(0, 63);

    projectConfig.mongo.uri = process.env.MONGODB_URI.replace("{database}", dbName);
  }

  projectConfig.afterListen = function () {
    apos._id = projectConfig._id;
    if (callback) {
      return callback(null, apos);
    }
  };

    console.log("Running project", projectData);

  const apos = await apostrophe(
    projectConfig,
  );

  return apos;
}

app.use(async function (_, res, next) {
  /**
   * Stop server if Project Api Key is not set.
   */
  if (!process.env.API_KEY) {
    console.error('Project api key is not set!');
    if (res) {
      res.status(500).json({ error: 'Project api key is not set!' });
    }
    return;
  }

  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

  /**
   * Stop server if no API URL is set
   */
  if (!apiUrl) {
    console.error('API url is not set!');
    if (res) {
      res.status(500).json({ error: 'Api URL is not set!' });
    }
    return;
  }

  /**
   * If projects are not loaded fetch from API
   *
   * All we be loaded in memory and refreshed every few minutes
   */
  if (Object.keys(projects).length === 0) {
    console.log('Fetching config for all projects');

    try {
      await loadProjects();
    } catch (err) {
      next(err);
    }
  }

  if (Object.keys(projects).length === 0) {
    console.log('No config for projects found');
    return res.status(500).json({ error: 'No projects found' });
  }

  next();
});

app.use(async function (req, _, next) {

    // format domain to our specification
    let domain = req.headers['x-forwarded-host'] || req.get('host');
    domain = domain.replace([ 'http://', 'https://' ], [ '' ]);
    domain = domain.replace([ 'www' ], [ '' ]);

    // for dev purposes allow overwrite domain name

    req.openstadDomain = domain;
    next();

});

async function serveSite(req, res, siteConfig, forceRestart) {
  // const dbName = siteConfig.config && siteConfig.config.cms && siteConfig.config.cms.dbName ? siteConfig.config.cms.dbName : '';
  const domain = siteConfig.domain;

  try {
    // check if this site needs to redirect. We can then skip the rest.
    let redirectURI = siteConfig.config && siteConfig.config.cms && siteConfig.config.cms.redirectURI;
    if (redirectURI) {
      return res.redirect(redirectURI);
    }

    if (!projects[domain]) {
      console.log('Project not found: ', siteConfig, req.originalUrl);
      return res.status(404).json({ error: 'Project not found' });
    }

    // use existing server
    if (apostropheServer[domain] && !forceRestart) {
      return apostropheServer[domain].app(req , res);
    }

    // busy? add to queue
    if (startUpIsBusy) {
      return startUpQueue.push([domain, req, res]);
    } else {
      startUpIsBusy = true;
    }

    await doStartServer(domain, req, res)

    // handle queue
    while (startUpQueue.length) {
      let nextInQueue = startUpQueue.shift();
      let [ nextDomain, nextReq, nextRes ] = nextInQueue;
      if (apostropheServer[nextDomain]) {
        apostropheServer[nextDomain].app(nextReq, nextRes);
      } else {
        doStartServer(...nextInQueue);
      }
    }

    startUpIsBusy = false;

  } catch (e) {
    console.log('Error starting up project: ', domain, e);
    return res.status(500).json({
      error: 'An error occured running project ',
      domain
    });
  }
}

/**
 * Check if a site is running under the first path
 *
 * So for instance, following should work:
 *  openstad.org/site2
 *  openstad.org/site3
 *
 * If not existing openstad.org will handle the above examples as pages,
 * if openstad.org exists of course.
 */
app.use('/:sitePrefix', function (req, res, next) {
    const domainAndPath = req.openstadDomain + '/' + req.params.sitePrefix;

    const site = projects[domainAndPath];
    if (site) {
      site.sitePrefix = req.params.sitePrefix;
      req.sitePrefix = req.params.sitePrefix;
      req.site = site;

      // Remove the prefix from the URL
      req.url = req.url.replace(`/${req.params.sitePrefix}`, '');

      // Reinitialize route parameters, so the next middleware will see the correct parameters
      return req.app._router.handle(req, res, next);
    } 

    next();
});

// Add site to request object if we don't have a prefix
// This fixes a bug where basicAuth would only apply to subdirectories
app.use((req, _, next) => {
  if (!req.site) {
    if (projects[req.openstadDomain]) {
      req.site = projects[req.openstadDomain];
    }
  }
  next();
});

// Create a middleware function for basic authentication
app.use((req, res, next) => {

  if (req.site && req.site.config?.basicAuth?.active && req.site.config?.basicAuth?.username && req.site.config?.basicAuth?.password) {
    console.log('Basic auth enabled for project: ', req.site.url);
    return basicAuth({
      users: { [req.site.config.basicAuth.username]: req.site.config.basicAuth.password },
      challenge: true
    })(req, res, next);
  }

  next();
});

app.use('/:privileged(admin)?/login', function (req, res) {
  const domainAndPath = req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const i = req.url.indexOf('?');
  let query = req.url.substring(i + 1);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const url = protocol + '://' + domainAndPath + '/auth/login';
  if (req.params.privileged) {
    query += `${query ? '&' : ''}loginPriviliged=1`;
  }
  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/auth/login', (req, res) => {
  let returnUrl = createReturnUrl(req, res);
  returnUrl = encodeURIComponent(returnUrl + '?openstadlogintoken=[[jwt]]');

  const domainAndPath = req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const project = (projects[domainAndPath] ? projects[domainAndPath] : false);

  const apiUrl = process.env.API_URL;
  let url = `${apiUrl}/auth/project/${project.id}/login?redirectUri=${returnUrl}`;
  url = req.query.useOauth ? url + '&useOauth=' + req.query.useOauth : url;
  url = req.query.loginPriviliged ? url + '&loginPriviliged=1' : url + '&forceNewLogin=1'; // ;

  return res.redirect(url);
});

app.use('/logout', function (req, res) {
  const domainAndPath = req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const i = req.url.indexOf('?');
  let query = req.url.substring(i + 1);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const url = protocol + '://' + domainAndPath + '/auth/logout';
  return res.redirect(url && query ? url + '?' + query : url);
});

app.get('/auth/logout', (req, res) => {
  let returnUrl = createReturnUrl(req, res);

  const projectDomain =  process.env.OVERWRITE_DOMAIN ? process.env.OVERWRITE_DOMAIN : req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
  const project = (projects[projectDomain] ? projects[projectDomain] : false);

  const apiUrl = process.env.API_URL;
  let url = `${apiUrl}/auth/project/${project.id}/logout?redirectUri=${returnUrl}`;
  url = req.query.useOauth ? url + '&useOauth=' + req.query.useOauth : url;
  url = req.query.loginPriviliged ? url + '&loginPriviliged=1' : url + '&forceNewLogin=1';

  return res.redirect(url);

});

app.use(async function (req, res) {
  const completeDomain = req.openstadDomain + (req.sitePrefix ? '/' + req.sitePrefix : '');
    console.log("===> complete domain", completeDomain, req.openstadDomain, req.sitePrefix);
    if (projects[completeDomain]) {
      return await serveSite(req, res, projects[completeDomain], req.forceRestart);
    }

    // fallback to generic 404
    res.status(404).send(`Error: No project found for given URL ${req.openstadDomain}${req.url}`);
});

setInterval(loadProjects, REFRESH_PROJECTS_INTERVAL);

console.log("Apos release id: ", process.env.APOS_RELEASE_ID);

if (process.env.RAILWAY_GIT_COMMIT_SHA) {
    process.env.APOS_RELEASE_ID = process.env.RAILWAY_GIT_COMMIT_SHA;
}

console.log("Apos release id from railway git commit sha: ", process.env.APOS_RELEASE_ID);

app.listen(process.env.PORT || 3000);
