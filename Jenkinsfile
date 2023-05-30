pipeline {
    agent any

    stages {

        stage('Test') {
            steps {
                script {
                    sh "npm install"
                    sh "docker-compose up -d"
                    sh "npm test"
                    sh "docker-compose down --remove-orphans"
                }
            }
        }
        stage('Build and Push') {
            steps {
                sh 'chmod +x ./scripts/deploy.sh'
                sh '''
                export VERSION=$BUILD_NUMBER
                ./scripts/deploy.sh
                '''
            }
        }
    }
}