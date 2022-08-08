
# Основы работы с редактором постов

- [Введение](#Введение)
- [Основы работы с редактором кода](#Основы-работы-с-редактором-кода)
  * [Базовые команды](#Базовые-команды)

# Введение

Визуальный редактор кода на чистом JS в духе яндекс-дзена и Medium.com
Визуальный редактор создан для написаний постов сайта/форума. Имеет подсветку синтаксиса кода, возможность загружать картинки на хостинг

- Возможность вставлять код с выбором языка
- загрузка картинок с диска, из буфера обмена, из ранее загруженных картинок
- Подобие реактивности в духе Vue<
- Вставка ссылок, выделение текста курсивом или полужирным шрифтом
- Сохранение поста в JSON

Редактор использовался в проекте (с загрузкой картинок на сервер и в базу данных) https://github.com/genkoshkarev/blog-platform


# Основы работы с редактором кода

## Базовые команды

Запуск редактора кода в тег с ID = 'editor'
```
<div id="editor"></div>

<script>
    let editor = new Editor("editor");
</script>
```


### Визуальный редактор:
![Alt-текст](https://github.com/genkoshkarev/blog-platform/blob/main/Screen_2.PNG?raw=true "Визуальный редактор")

### Визуальный редактор, загрузка картинок
![Alt-текст](https://github.com/genkoshkarev/blog-platform/blob/main/Screen_3.PNG?raw=true "Визуальный редактор, загрузка картинок")
