pipeline {
    agent {
        any
    }
    tools {
        nodejs 'node'
    }
    stages {
        stage('Test jenkins') {
            steps {
                echo 'Jenkins file is ok!'
                sh 'whoami'
            }
        }

        stage('set env') {
            steps {
                withCredentials([
                    file(credentialsId:'server-env-file', variable: 'serverEnvFile'),
                    file(credentialsId:'client-env-file', variable:'clientEnvFile')
                ]) {
                    sh "cp ${serverEnvFile} server/.evn"
                    sh "cp ${clientEnvFile} client/.evn"
                    sh 'chmod 700 server/.env'
                    sh 'chmod 700 client/.env'
                    sh 'cat server/.env'
                    sh 'cat client/.env'
                }
            }
        }
        stage('Build app ') {
            steps {
                sh 'echo install dependencies'
                sh 'npm install'
                sh 'cd client && npm install'
                sh 'cd server && npm install'
                sh 'cat package.json'
                sh 'echo building'
                sh 'npm run build'
                sh 'docker compose -f server/docker-compse.yml up -d --build'
            }
        }
        stage('Init database') {
            steps {
                sh 'cd dbinit && sh init.sh'
            }
        }
    }
}
