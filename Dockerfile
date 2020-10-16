FROM node:erbium

#Copy app source
COPY . /src

#Set work directory 
WORKDIR /src

# install app dependencies
RUN npm install
RUN npm install express
RUN npm install spotify-web-api-node 
RUN npm install axios

#Expose port to outside world
EXPOSE 3000

# start command as per package.json
CMD ["npm", "start"]