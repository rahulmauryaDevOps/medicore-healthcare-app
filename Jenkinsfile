pipeline {
    agent any

    environment {
        IMAGE = 'asia-south1-docker.pkg.dev/gcp-devops-learning-514003/medicore-repo/patient-service'
    }

    stages {
        stage('Build and Test') {
            steps {
                sh './mvnw clean package'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $IMAGE:$BUILD_NUMBER .'
            }
        }

        stage('Authenticate to Artifact Registry') {
            steps {
                sh '''
                    gcloud auth print-access-token | docker login \
                    -u oauth2accesstoken --password-stdin \
                    https://asia-south1-docker.pkg.dev
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                sh 'docker push $IMAGE:$BUILD_NUMBER'
            }
        }
    }
}
