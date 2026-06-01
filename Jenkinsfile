# =============================================================================
# Flight Booking Frontend — Jenkins Pipeline
# fe-flight-booking/Jenkinsfile
#
# Setup:
#   1. Create Multibranch Pipeline in Jenkins
#   2. Point to this Jenkinsfile
#   3. Add credentials:
#      - staging-ssh-key: SSH username with private key (staging server)
#      - prod-ssh-key:    SSH username with private key (production server)
# =============================================================================

pipeline {
    agent any

    environment {
        APP_DIR = '/home/deploy/flight-booking/fe'
        DOCKER_REGISTRY = 'ghcr.io'
        SLACK_CHANNEL = '#deployments'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.GIT_BRANCH_NAME = sh(
                        script: "git rev-parse --abbrev-ref HEAD",
                        returnStdout: true
                    ).trim()
                    env.VERSION = env.GIT_COMMIT_SHORT
                    env.DEPLOY_ENV = env.GIT_BRANCH_NAME == 'main' ? 'production' : 'staging'
                }
                echo "Branch: ${env.GIT_BRANCH_NAME} | Commit: ${env.GIT_COMMIT_SHORT} | Env: ${env.DEPLOY_ENV}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci --legacy-peer-deps'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def imageName = "${env.DOCKER_REGISTRY}/${env.GIT_BRANCH_NAME}/frontend:${env.VERSION}"
                    def imageLatest = "${env.DOCKER_REGISTRY}/${env.GIT_BRANCH_NAME}/frontend:latest"

                    sh """
                        docker build \
                            --build-arg VERSION=${env.VERSION} \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg COMMIT_SHA=${env.GIT_COMMIT_SHORT} \
                            -t ${imageName} \
                            -t ${imageLatest} \
                            .
                        docker push ${imageName}
                        docker push ${imageLatest}
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    sshagent(credentials: ['staging-ssh-key']) {
                        sh """
                            set -e
                            echo "Deploying FE to staging..."

                            ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null deploy@${env.STAGING_HOST} << 'ENDSSH'
                                set -e
                                cd ${env.APP_DIR}

                                cat > .env << 'EOF'
NEXT_PUBLIC_APP_NAME=Flight Booking (Staging)
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NEXT_PUBLIC_NODE_ENV=staging
NEXT_PUBLIC_PAYMENT_MODE=mock
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=${env.STAGING_GA_ID}
EOF

                                docker compose pull || true
                                docker compose up -d --build

                                echo "Waiting for frontend..."
                                sleep 10

                                curl -sf http://localhost:3000/healthz && echo " Frontend: OK" || echo " Frontend: FAILED"

                                echo "Staging frontend deployment complete!"
                            ENDSSH
                        """
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: 'Deploy FE to Production?',
                          ok: 'Deploy',
                          submitter: 'admin,deployer'
                }

                script {
                    sshagent(credentials: ['prod-ssh-key']) {
                        sh """
                            set -e
                            echo "Deploying FE to production..."

                            ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null deploy@${env.PROD_HOST} << 'ENDSSH'
                                set -e
                                cd ${env.APP_DIR}

                                cat > .env << 'EOF'
NEXT_PUBLIC_APP_NAME=Flight Booking
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_PAYMENT_MODE=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=${env.PROD_GA_ID}
EOF

                                docker compose pull || true
                                docker compose up -d --build

                                echo "Waiting for frontend..."
                                sleep 10

                                curl -sf http://localhost:3000/healthz && echo " Frontend: OK" || { echo " Frontend: FAILED"; exit 1; }

                                docker compose ps

                                echo "Production frontend deployment complete!"
                            ENDSSH
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def status = currentBuild.result ?: 'SUCCESS'
                def color = status == 'SUCCESS' ? 'good' : 'danger'
                def emoji = status == 'SUCCESS' ? ':white_check_mark:' : ':x:'

                if (env.SLACK_WEBHOOK) {
                    slackSend(
                        channel: env.SLACK_CHANNEL,
                        color: color,
                        message: "${emoji} FE ${env.DEPLOY_ENV?.toUpperCase() ?: 'BUILD'} ${status}: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.GIT_COMMIT_SHORT})"
                    )
                }
            }

            cleanWs(
                deleteDirs: true,
                notFailBuild: true
            )
        }

        success {
            echo "Frontend pipeline completed successfully!"
        }

        failure {
            echo "Frontend pipeline failed!"
        }
    }
}
