# Используем официальный образ Node.js с LTS версией
FROM node:18-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Очищаем кэш npm и устанавливаем зависимости
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Копируем все файлы проекта
COPY . .

# Открываем порт для Browser Sync
EXPOSE 3000
EXPOSE 3001

# Команда по умолчанию для запуска разработки
CMD ["npm", "start"]