pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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

        stage('Update GitOps Manifest') {
            steps {
                sh '''
                    sed -i "s|patient-service:[^[:space:]]*|patient-service:$BUILD_NUMBER|" k8s/deployment.yaml

                    echo "Updated Kubernetes image:"
                    grep "image:" k8s/deployment.yaml
                '''
            }
        }

        stage('Push Manifest to GitHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-pat',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_PASSWORD'
                )]) {
                    sh '''
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@example.com"

                        git add k8s/deployment.yaml
                        git commit -m "Update patient-service image to build $BUILD_NUMBER"

                        git push https://$GIT_USERNAME:$GIT_PASSWORD@github.com/rahulmauryadevops/medicore-healthcare-app.git HEAD:main
                    '''
                }
            }
        }
    }
}
