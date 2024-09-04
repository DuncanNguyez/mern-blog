pipeline {
    agent any

    tools {
        maven 'mvn'
    }

    stages {
        stage('Test jenkins') {
            steps {
                echo 'Jenkins file is ok!'
                sh 'whoami'
            }
        }

        stage('Set env') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'envFile')]) {
                    sh "cp ${envFile} .env"
                    sh 'chmod 400 .env'
                    sh 'chmod +w .env'
                    sh 'cat .env'
                }
            }
        }

        stage('Build app') {
            steps {
                sh 'mvn --version'
                sh 'mvn clean package -DskipTests=true'
            }
        }

        stage('Packageking/push images, deploy to dev') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url:'https://index.docker.io/v1/') {
                    sh 'docker compose up -d --build'
                    sh 'docker compose push'
                    sh 'docker system prune --force'
                }
            }
        }

        // set up to server
        stage('Pull image') {
            steps {
                sh 'docker pull duncannguyen/ansible'
            }
        }

        stage('Deploy to server') {
            agent {
                docker {
                    image 'duncannguyen/ansible'
                    args '-u root'
                }
            }
            steps {
                withCredentials([
                    file(credentialsId:'bizfly-private-key', variable:'privateKey'),
                    file(credentialsId:'env-file', variable:'envFile'),
                ]) {
                    sh 'ls -la'
                    sh "cp ${privateKey} private-key"
                    sh 'chmod 400 private-key'
                    sh 'chmod +w private-key'
                    sh 'cat private-key'
                    sh 'ansible --version'
                    sh '''
                            ansible -i hosts --private-key private-key -m ping all \
                            -e "ansible_ssh_common_args=\'-o StrictHostKeyChecking=no\'"
                        '''
                    sh "cp ${envFile} .env"
                    sh 'chmod +rw .env'
                    sh 'chmod +r server-docker-compose.yml'
                    sh 'ansible-playbook -i hosts --private-key private-key playbook.yml -v'
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
