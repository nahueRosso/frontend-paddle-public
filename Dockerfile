# Usa una imagen liviana de Node
FROM node:18-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# ✅ Importante: define el puerto 3002
ENV PORT=3002
EXPOSE 3002

# Compila y arranca Next.js en el puerto 3002
RUN npm run build
CMD ["npm", "run", "start", "--", "-p", "3002"]
