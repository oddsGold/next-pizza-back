import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourceDir = path.join(__dirname, '..', 'db', 'models', 'resources');

if (!fs.existsSync(resourceDir)) {
  console.error('❌ Папка ресурсов не найдена:', resourceDir);
  process.exit(1);
}

/**
 * Загружает карту ресурсов из файлов JavaScript (.js или .mjs) в директории ресурсов.
 *
 * Функция считывает имена всех файлов с расширениями `.js` и `.mjs` из папки
 * `db/models/resources` (относительно текущего файла), формирует ключи вида
 * `Models\CapitalizedFileName` и значения — просто имя с заглавной первой буквой.
 *
 * Например, файл `user.js` превратится в запись: `{ "Models\User": "User" }`.
 *
 * @returns {Object.<string, string>} Объект-словарь, где ключ — имя модели с префиксом `Models\`,
 * а значение — имя модели с заглавной первой буквой.
 *
 * @throws Will terminate процесс, если папка ресурсов не найдена.
 */
export const loadResourceMap = () => {
  const files = fs
    .readdirSync(resourceDir)
    .filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));

  const resourceMap = {};

  files.forEach((file) => {
    const name = path.basename(file, path.extname(file));
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const key = `Models\\${capitalized}`;
    const value = capitalized;

    resourceMap[key] = value;
  });
  return resourceMap;
};
