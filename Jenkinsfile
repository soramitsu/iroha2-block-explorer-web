@Library('jenkins-library')

def pipeline = new org.js.AppPipeline(
    packageManager:     'pnpm',
    buildCmds: ["pnpm i && pnpm build"],
    steps:              this,
    test:               false,
    dockerImageName:    'iroha2/iroha2-block-explorer-web',
    buildDockerImage:   'docker.soramitsu.co.jp/build-tools/node:20-alpine',
    dockerRegistryCred: 'bot-iroha2-rw',
    sonarProjectName:   'iroha2-block-explorer-web',
    sonarProjectKey:    'jp.co.soramitsu:iroha2-block-explorer-web',
)
pipeline.runPipeline() 
