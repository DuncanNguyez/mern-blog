pipeline {
    agent any

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
                    file(credentialsId:'server-env-file', variable: 'serverEnvFile'),
                    file(credentialsId:'client-env-file', variable:'clientEnvFile'),
                    file(credentialsId:'service-account', variable:'serviceAccount')
                ]) {
                    sh "cp ${serverEnvFile} server/.env"
                    sh "cp ${clientEnvFile} client/.env"
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
                sh 'docker compose -f server/docker-compose.yml up  --build'
            }
        }
        stage('Init database') {
            steps {
                sh 'cd dbinit && sh init.sh'
            }
        }
    }
}
