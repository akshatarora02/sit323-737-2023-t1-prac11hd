pipeline {
    agent any

    stages {

        stage('Deploy') {
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