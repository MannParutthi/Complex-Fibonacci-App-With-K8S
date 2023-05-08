# Build all the images, tag each one and push (for each tag) each to docker hub ; each with 2 tags - latest and the git commit SHA
# $SHA is the git commit SHA (unique for each commit / code change) that is used as the tag for the image - this is used to ensure that the image is unique and to get the updated code/image on the k8s cluster (also helps in rolling back to a previous version of the image by using the SHA tag - commit => git checkout <SHA> and debug) ; latest tag to ensure that the latest image is used when the image is pulled from docker hub ; $SHA is the env variable that is set in travis CI
docker build -t mananparuthi/multi-client:latest -t mananparuthi/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t mananparuthi/multi-server:latest -t mananparuthi/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t mananparuthi/multi-worker:latest -t mananparuthi/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push mananparuthi/multi-client:latest
docker push mananparuthi/multi-server:latest
docker push mananparuthi/multi-worker:latest

docker push mananparuthi/multi-client:$SHA
docker push mananparuthi/multi-server:$SHA
docker push mananparuthi/multi-worker:$SHA

# Apply all the config files in the k8s folder
kubectl apply -f k8s

# Imperatively set the latest images on each deployment
kubectl set image deployments/server-deployment server=mananparuthi/multi-server:$SHA
kubectl set image deployments/client-deployment client=mananparuthi/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=mananparuthi/multi-worker:$SHA


# Helm => A program used to administer third-party softwares inside our k8s cluster
#      => A package manager for k8s
#      => A CLI tool that streamlines the installation and management of k8s applications
# https://helm.sh/docs/intro/quickstart/
# https://helm.sh/docs/intro/install/#from-script