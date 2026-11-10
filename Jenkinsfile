
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_IMAGE = 'asia-south1-docker.pkg.dev/gcp-devops-learning-514003/medicore-repo/patient-service'
        FRONTEND_IMAGE = 'asia-south1-docker.pkg.dev/gcp-devops-learning-514003/medicore-repo/medicore-frontend'
    }

    stages {

        stage('Backend Build and Test') {
            steps {
                sh './mvnw clean package'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        ./mvnw org.sonarsource.scanner.maven:sonar-maven-plugin:sonar \
                        -Dsonar.projectKey=MediCore-Healthcare
                    '''
                }
            }
        }

        stage('Frontend Build and Test') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t $BACKEND_IMAGE:$BUILD_NUMBER .
                    docker build -t $FRONTEND_IMAGE:$BUILD_NUMBER ./frontend
                '''
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    echo "Scanning Backend Image..."
                    trivy image --exit-code 1 --severity CRITICAL \
                    $BACKEND_IMAGE:$BUILD_NUMBER

                    echo "Scanning Frontend Image..."
                    trivy image --exit-code 1 --severity CRITICAL \
                    $FRONTEND_IMAGE:$BUILD_NUMBER
                '''
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

        stage('Push Docker Images') {
            steps {
                sh '''
                    docker push $BACKEND_IMAGE:$BUILD_NUMBER
                    docker push $FRONTEND_IMAGE:$BUILD_NUMBER
                '''
            }
        }

        stage('Update GitOps Manifests') {
            steps {
                sh '''
                    sed -i "s|patient-service:[^[:space:]]*|patient-service:$BUILD_NUMBER|" k8s/deployment.yaml

                    sed -i "s|medicore-frontend:[^[:space:]]*|medicore-frontend:$BUILD_NUMBER|" k8s/frontend-deployment.yaml

                    echo "Updated images:"
                    grep "image:" k8s/deployment.yaml
                    grep "image:" k8s/frontend-deployment.yaml
                '''
            }
        }

        stage('Push GitOps Changes') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-pat',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_PASSWORD'
                )]) {
                    sh '''
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@example.com"

                        git add k8s/deployment.yaml k8s/frontend-deployment.yaml

                        git commit -m "Update backend and frontend images to build $BUILD_NUMBER"

                        git push https://$GIT_USERNAME:$GIT_PASSWORD@github.com/rahulmauryadevops/medicore-healthcare-app.git HEAD:main
                    '''
                }
            }
        }
    }
}

