pipeline {
    agent any

    stages {
        stage('Build and Push') {
            steps {
                sh 'chmod +x ./scripts/deploy.sh'
                sh 'cd metadata && npm install && npm test'
                sh '''
                export VERSION=$BUILD_NUMBER
                ./scripts/deploy.sh
                '''
            }
        }
    }
}