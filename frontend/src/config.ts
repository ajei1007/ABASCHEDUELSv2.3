const loadLogo = (): string => {
  return import.meta.env.REACT_APP_COMPANY_LOGO_FILE
    ? new URL(import.meta.env.REACT_APP_COMPANY_LOGO_FILE, import.meta.url).href
    : new URL('assets/companies/logos/ABASchedules.svg', import.meta.url).href;
};

const config = {
  // App
  appVersion: import.meta.env.REACT_APP_VERSION || '0.0.0',
  releaseName: import.meta.env.REACT_APP_RELEASE_NAME || 'dev@0.0.0',

  // Application
  baseURLApi: import.meta.env.REACT_APP_BACKEND_URL,
  companyLabel: import.meta.env.REACT_APP_COMPANY_NAME,
  companyLogo: loadLogo(),
  companySlogan: import.meta.env.REACT_APP_COMPANY_SLOGAN,
  hasLogoAnimation: import.meta.env.REACT_APP_HAS_LOGO_ANIMATION
    ? import.meta.env.REACT_APP_HAS_LOGO_ANIMATION === 'true'
    : false,
  // Features
  staffTrackerEnabled: import.meta.env.REACT_APP_STAFF_TRACKER_ENABLED
    ? import.meta.env.REACT_APP_STAFF_TRACKER_ENABLED === 'true'
    : false,
  loomSandbox: import.meta.env.REACT_APP_LOOM_APP_ID,
  // optimizerEnabled: import.meta.env.REACT_APP_OPTIMIZER_ENABLED ? import.meta.env.REACT_APP_OPTIMIZER_ENABLED === 'true' : false,
  // flaggingEnabled: import.meta.env.REACT_APP_FLAGGING_ENABLED ? import.meta.env.REACT_APP_FLAGGING_ENABLED === 'true' : false,
  // requestingEnabled: import.meta.env.REACT_APP_REQUESTING_ENABLED ? import.meta.env.REACT_APP_REQUESTING_ENABLED === 'true' : false,
  lmsEnabled: true,
  deploymentInfo: import.meta.env.REACT_APP_DEPLOYMENT_INFO
    ? import.meta.env.REACT_APP_DEPLOYMENT_INFO === 'true'
    : false,
  maxOptimizerBackgroundJobs: import.meta.env
    .REACT_APP_MAX_OPTIMIZER_BACKGROUND_JOBS
    ? parseInt(import.meta.env.REACT_APP_MAX_OPTIMIZER_BACKGROUND_JOBS)
    : 4,
  maxSolutionGeneratorConcurrentJobs: import.meta.env
    .REACT_APP_MAX_SOLUTION_GENERATOR_CONCURRENT_JOBS
    ? parseInt(import.meta.env.REACT_APP_MAX_SOLUTION_GENERATOR_CONCURRENT_JOBS)
    : 4,
  mattermostUrl: import.meta.env.REACT_APP_MATTERMOST_URL,
};

export default config;
