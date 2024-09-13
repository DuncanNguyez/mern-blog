pipeline {
    agent any

    environment {
        SERVER_ENV = credentials('server-env-file')
        CLIENT_ENV = credentials('client-env-file')
        DOCKER_REGISTRY_TOKEN = credentials('dockerhub')
        DOCKER_REGISTRY_CREDENTIALS = [credentialsId: 'dockerhub', url: 'https://index.docker.io/v1']
        DOCKER_HUB_USER = credentials('dockerhub-user')
    }

    tools {
        nodejs 'node'
    }

    stages {
        stage('Test jenkins') {
            steps {
                echo 'Jenkins file is ok!'
                sh 'whoami'
                sh 'node --version'
            }
        }

        stage('set env') {
            steps {
                withCredentials([
                    file(credentialsId:'service-account', variable:'serviceAccount')
                ]) {
                    sh "cp ${SERVER_ENV} server/.env"
                    sh "cp ${CLIENT_ENV} client/.env"
                    sh "cp ${serviceAccount} server/mern-blog.json"
                    sh 'chmod 700 server/.env'
                    sh 'chmod 700 server/mern-blog.json'
                    sh 'chmod 700 client/.env'
                    sh 'cat server/.env'
                    sh 'cat client/.env'
                }
            }
        }
        stage('Build app ') {
            steps {
                sh 'echo install dependencies'
                sh 'npm install '
                sh 'cd client && npm install'
                sh 'cd server && npm install'
                sh 'cat package.json'
                sh 'echo building'
                sh 'npm run build'
            }
        }

        stage('Packageking/push image, deploy to dev ') {
            step {
                withDockerRegistry(DOCKER_REGISTRY_CREDENTIALS) {
                    sh 'docker compose -f server/docker-compose.yml up -d  --build'
                    sh 'docker compose push'
                }
            }
        }

        // init database on dev
        stage('Init database') {
            steps {
                sh 'cd dbinit && sh init.sh'
            }
        }

        // set up to deploy into server vps
        stage('Pull ansible image') {
            step {
                withDockerRegistry(DOCKER_REGISTRY_CREDENTIALS) {
                    sh "docker pull ${DOCKER_HUB_USER}/ansible"
                }
            }
        }
        stage('Deploy to server ') {
            agent {
                docker {
                    image "${DOCKER_HUB_USER}/ansible"
                    args '-u root'
                }
            }

            steps {
                withCredentials([
                    file(credentialsId:'duncan-hcm-01', variable:'privateKey'),
                ]) {
                    sh 'ls -lha'
                    sh "cp ${privateKey} privateKey"
                    sh 'chmod 700 privateKey'
                    sh 'ansible --version'
                    sh '''
                            ansible -i host --private-key priavteKey -m ping all
                        '''
                    sh "cp ${SERVER_ENV} server/.env"
                    sh 'chmod 700 server/.env '
                    sh 'chmod +r server/server-docker-compose.yml'
                    sh 'chmod +r dbinit/*'
                    sh """
                            ansible-playbook -i hosts --private-key privateKey playbook.yml \
                            --extra-vars DOCKER_REGISTRY_TOKEN=${DOCKER_REGISTRY_TOKEN} \
                            DOCKER_HUB_USER=${DOCKER_HUB_USER}  -v
                        """
                }
            }
        }
    }

    post {
        // Clean after build
        always {
            cleanWs()
        }
    }
}
