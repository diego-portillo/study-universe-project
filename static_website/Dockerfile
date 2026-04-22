FROM nginx:1.29.8-alpine-perl

# these commands can only be executed by root user
RUN apt-get update && apt-get -y upgrade 
RUN groupadd -r diego && useradd -r -g diego diego
RUN chown -R diego:diego /usr/share/nginx/html
# from this part the user diego can run the next commands
USER diego
CMD [ "bash", "-c", "echo Hello from appuser!"]
COPY . /usr/share/nginx/html