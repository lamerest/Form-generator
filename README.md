# Form-generator

Form generator - создает формы на основе JSON файла, автоматически проверяет правильност заполнения
и собирает статстику по взаимодействия с формой (время заполнения и кол-во ошибок при заполнении)

Это скрипт для генерации html кастомной формы и всего необходимого для ее корректной работы (статистика, валидация, стили)

---

## НАЧАЛО
Чтобы начать подключите скрипт в html и расположите содержимое репозитория в следующем порядке:

По умолчанию скрипт и JSON файл должны находится по пути:\
*your-directory-name/js/form-generator/*

А стили (fm.css и папка themes) должны располагаться по пути:\
*your-directory-name/css/*

После открытия html страницы на ней автоматически в body будет добавлена сгенерированная форма. Для изменения места 
добавления формы необходимо переопределеить функцию __createForm()__, а именно то, куда она добавляет форму.

---

### JSON разметка формы
Скрипт позволяет в разметке объекта указать такие параметры, как:\
{\
"name": "Заявка на экскурсионный полет на Марс"\
"action": "",\
"method": "post",\
"theme": "black"\
"id": "form",
...

,где:\
name - заголовок формы\
action - атрибут action тега form\
method - атрибут method формы\
theme - тема формы (заготовленные стили black/white)\
id - id атрибут формы

После, идет поле "inputs", в котором содержится список объектов, поля которых аналогичны атрибутам
тега <input\> :\
"id": "form"\
"inputs": [\
{\
"label":"Имя",\
"id":"first_name",\
"type":"text",\
"required": "true"
"placeholder":"Введите имя...",\
},\
...\
]\

При добавлении каждого нового объекта в inputs, в форме будет создаваться
поле для ввода с соответствующими атрибутами.

Генератор способен создать большинство типов input.

### DROPDOWN list'ы
Если задать в inputs объект с полем type равным **list**, то будет создан select, в который будут добавлены
прописанные в объекте теги option.

*Пример:*\
```json
{
"label": "Пол",
"type": "list",
"id": "sex",
"required": true,
"options": [
{
"text": "мужской",
"value": "male"
},
{
"text": "женский",
"value": "female"
}]
}
```


На выходе получится:
```html
<div class="list">
<label for="sex">Пол</label>
<select required="" style="border: 1px solid grey;">
<option value="male">мужской</option>
<option value="female">женский</option>
<option hidden="" selected="" disabled=""></option>
</select>
</div>
```
Также будет добавлен пустой тег option с атрибутами hidden disabled selected, чтобы сразу при открытии
страницы с формой не было выбрано никаких вариантов.


### OPTIONGROUP и легкий вариант добавления options
Также генератор способен создавать optgroup теги внутри select'ов. Если не прописывать
значения text и value для option, то можно сократить запись до одного массива (но тогда текст option и атрибут value option'а будут одианковыми), как видно в объекте с лейблом "USA"
(также можно создавать options без optgroup).

```json
{
"label": "Образование",
"type": "list",
"id": "education",
"optgroups": [
{
"label": "Russia",
"options": [
{
"text": "ЛЭТИ",
"value": "ETU"
},
{
"text": "ВШЭ",
"value": "HSE"
},
{
"text": "МГУ",
"value": "MSU"
},
{
"text": "NSTU",
"value": "ETU"
},
{
"text": "НГУ",
"value": "NSU"
},
{
"label": "USA",
"options": ["Harvard", "MIT", "Stanford"]
}],
  {
    ,
  "options"
  :
  [
    {
      "text": "А",
      "value": "A"
    },
    {
      "text": "Б",
      "value": "B"
    },
    {
      "text": "В",
      "value": "C"
    }
  ]
}
```

На выходе получится:
```html
<div class="list">
    <label for="education">Образование</label>
    <select>
        <optgroup label="Russia">
            <option value="ETU">ЛЭТИ</option>
            <option value="HSE">ВШЭ</option>
            <option value="MSU">МГУ</option>
            <option value="ETU">NSTU</option>
            <option value="NSU">НГУ</option>
        </optgroup>
        <optgroup label="USA">
            <option value="Harvard">Harvard</option>
            <option value="MIT">MIT</option>
            <option value="Stanford">Stanford</option>
        </optgroup><option value="A">А</option>
        <option value="B">Б</option>
        <option value="C">В</option>
        <option hidden="" selected="" disabled=""></option>
    </select>
</div>
```
---

### ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ - старая фамилия
Создать поле фамилии с опцией записи старой можно так:
```json
{
  "label": "Фамилия",
  "type": "text",
  "id": "last_name",
  "required": true,
  "checkbox": {
    "label": "ранее менялась",
    "id": "changed_checkbox",
    "input": {
      "label": "Старая фамилия",
      "id": "past_last_name",
      "type": "text"
    }
  }
}
```

Получится:
```html
<div>
    <label for="last_name">Фамилия</label>
    <input type="text" id="last_name" required="">
    <div class="checkbox">
        <label for="changed_checkbox">ранее менялась</label>
        <input id="changed_checkbox" type="checkbox"></div>
    <div style="display: none;">
        <label for="past_last_name">Старая фамилия</label>
        <input id="past_last_name" type="text">
    </div>
</div>
```

Встроенный скрипт при нажатии на чекбокс покажет поле для ввода фамилии

---

### Дополнительные возможности - "отчество отсутствует"
Поле ввода также можно кастомизировать, добавив полк чекбокс внутри которого будет поле "blockInput", который будет блокировать ввод в это поле
```json
{
  "label": "Отвечство",
  "type": "text",
  "id": "middle_name",
  "required": true,
  "checkbox": {
    "label": "отсутствует",
    "id": "no_middle_name",
    "blockInput": true
  }
}    
```
Получится:
```html
<div>
    <label for="middle_name">Отвечство</label>
    <input type="text" id="middle_name" required="">
    <div class="checkbox">
        <label for="no_middle_name">отсутствует</label>
        <input id="no_middle_name" type="checkbox">
    </div>
</div>
```