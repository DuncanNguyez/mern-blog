pipeline {
    agent any

    environment {
        DOCKER_CREDENTIAL_ID = 'dockerhub'
        DOCKER_REGISTRY_URL = 'https://index.docker.io/v1/'
        SERVER_ENV = credentials('server-env-file')
        CLIENT_ENV = credentials('client-env-file')
        DOCKER_REGISTRY_TOKEN = credentials('docker-registry_token')
        DOCKER_HUB_USER = credentials('dockerhub-user')
        SERVICE_ACCOUNT = credentials('service-account')
    }

    tools {
        nodejs 'node'
    }

    stages {
        // stage('Test jenkins') {
        //     steps {
        //         echo 'Jenkins file is ok!'
        //         sh 'whoami'
        //         sh 'node --version'
        //         sh "echo ${env.DOCKER_CREDENTIAL_ID} ${env.DOCKER_REGISTRY_URL}"
        //     }
        // }

        stage('set env') {
            steps {
                sh "cp ${SERVER_ENV} server/.env"
                sh "cp ${CLIENT_ENV} client/.env"
                sh "cp ${SERVICE_ACCOUNT} server/mern-blog.json"
                sh 'chmod 700 server/.env'
                sh 'chmod 700 server/mern-blog.json'
                sh 'chmod 700 client/.env'
            }
        }
        // stage('Install dependencies') {
        //     steps {
        //         parallel(
        //             client: {
        //                   sh 'cd client && npm install '
        //             },
        //             server: {
        //                 sh 'cd server && npm install'
        //             }
        //         )
        //     }
        // }

        // stage('Build app ') {
        //     steps {
        //         sh 'npm run build'
        //     }
        // }

        // stage('Packageking/push image, deploy to dev ') {
        //     steps {
        //         withDockerRegistry(credentialsId: env.DOCKER_CREDENTIAL_ID, url: env.DOCKER_REGISTRY_URL) {
        //             sh 'docker compose -f server/docker-compose.yml up -d  --build'
        //             sh 'docker compose -f server/docker-compose.yml push'
        //         }
        //     }
        // }

        // init database on dev
        stage('Init database') {
            steps {
                sh 'cd dbinit && sh init.sh host.docker.internal'
            }
        }

        // set up to deploy into server vps
        stage('Pull ansible image') {
            steps {
                withDockerRegistry(credentialsId: env.DOCKER_CREDENTIAL_ID, url: env.DOCKER_REGISTRY_URL) {
                    sh "docker pull ${DOCKER_HUB_USER}/ansible"
                }
            }
        }
        // stage('Deploy to server ') {
        //     agent {
        //         docker {
        //             image "${DOCKER_HUB_USER}/ansible"
        //             args '-u root'
        //         }
        //     }

    //     steps {
    //         withCredentials([
    //             file(credentialsId:'duncan-hcm-01', variable:'privateKey'),
    //         ]) {
    //             sh 'ls -lha'
    //             sh "cp ${privateKey} privateKey"
    //             sh 'chmod 700 privateKey'
    //             sh 'ansible --version'
    //             sh '''
    //                     ansible -i host --private-key priavteKey -m ping all
    //                 '''
    //             sh "cp ${SERVER_ENV} server/.env"
    //             sh 'chmod 700 server/.env '
    //             sh 'chmod +r server/server-docker-compose.yml'
    //             sh 'chmod +r dbinit/*'
    //             sh """
    //                     ansible-playbook -i hosts --private-key privateKey playbook.yml \
    //                     --extra-vars DOCKER_REGISTRY_TOKEN=${DOCKER_REGISTRY_TOKEN} \
    //                     DOCKER_HUB_USER=${DOCKER_HUB_USER}  -v
    //                 """
    //         }
    //     }
    // }
    }

    post {
        // Clean after build
        always {
            cleanWs()
        }
    }
}
