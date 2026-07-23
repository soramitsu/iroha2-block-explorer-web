@Library('jenkins-library')

def pipeline = new org.js.AppPipeline(
    packageManager:     'pnpm',
    buildCmds:          [
        'corepack enable',
        'pnpm install --frozen-lockfile',
        'pnpm check:roadmap',
        'pnpm lint',
        'pnpm test:unit',
        'pnpm typecheck',
        'pnpm build:vite',
        'pnpm check:bundle',
        'PLAYWRIGHT_REUSE_BUILD=1 pnpm test:playwright:hermetic',
        'if [ "${RUN_LIVE_MOCHI_E2E:-0}" = "1" ]; then PLAYWRIGHT_REUSE_BUILD=1 pnpm test:playwright:mochi; else echo "Live Mochi E2E not requested; set RUN_LIVE_MOCHI_E2E=1 to enable it."; fi',
    ],
    steps:              this,
    test:               false,
    dockerImageName:    'iroha2/iroha2-block-explorer-web',
    buildDockerImage:   'mcr.microsoft.com/playwright:v1.58.2-noble',
    dockerRegistryCred: 'bot-iroha2-rw',
    sonarProjectName:   'iroha2-block-explorer-web',
    sonarProjectKey:    'jp.co.soramitsu:iroha2-block-explorer-web',
)
pipeline.runPipeline() 
