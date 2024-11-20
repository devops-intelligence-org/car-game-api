# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de tu aplicación
COPY . .

# Expone el puerto en el que corre la API
EXPOSE 3001

# Comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]
