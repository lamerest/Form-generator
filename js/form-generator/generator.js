/*

~~FORM GENERATOR~~

Form generator - создает формы на основе JSON файла, автоматически проверяет правильност заполнения
и собирает статстику по взаимодействия с формой (время заполнения и кол-во ошибок при заполнении)

Это скрипт для генерации html кастомной формы и всего необходимого для ее корректной работы (статистика, валидация, стили)

-----

~НАЧАЛО~
Чтобы начать подключите скрипт в html и расположите содержимое репозитория в следующем порядке:

По умолчанию скрипт и JSON файл должны находится по пути:
your-directory-name/js/form-generator/

А стили (fm.css и папка themes) должны располагаться по пути:
our-directory-name/css/

*/



// Запрос на получение JSON файла из той же директории, где находится сам скрипт
let request = new XMLHttpRequest();
request.open('GET', 'js/form-generator/layout.json');
request.onload = function() {
    let layout = request.response
    createForm(layout)
}
request.responseType = 'json'
request.send();


// Обработка и отправка формы
// На вход: form
function submitForm(form){
    console.log("Форма подтверждена и отправляется...")

    // Пропишите здесь отправка формы...
    // form.submit()

    form.reset()
    alert('Ваша заявка принята в обработку\n\nВ консоли отображаются ваши ошибки и их количество')

}

// Создает форму, основываясь на JSON файле и добавляет её в конец тега body (можно кастомизировать)
function createForm(jsonObj){
    let form = document.createElement('form')

    // Содание названия формы, если оно есть
    if (jsonObj.hasOwnProperty("name")){
        let h2 = document.createElement('h2')
        h2.textContent = jsonObj['name']
        h2.style.textAlign = 'center'
        h2.className = "form__header"
        form.appendChild(h2)
    }

    // Создание и добавление всех input'ов
    for (const i in jsonObj["inputs"]) {
        let input =  inputByType(jsonObj["inputs"][i])
        form.appendChild(input)
    }

    // Добавление кнопки submit
    let submit = document.createElement('input')
    submit.type = "submit"
    submit.innerHTML = jsonObj.submit.text
    submit.setAttribute("onclick", "validateForm()")
    submit.className = "autogenerated_submit_button"
    submit.id = jsonObj.submit.id
    form.appendChild(submit)


    // Кастомизация  свойств формы
    form.name = "autogenerated_form"
    form.id = jsonObj["id"]
    formTheme(jsonObj)
    if (jsonObj.hasOwnProperty("method" && jsonObj.method.toLowerCase() === "get")) form.method = "get"
    else form.method = 'post'
    form.action = jsonObj.action
    form.className = jsonObj["class"]


    // Добавление формы в body
    let body = document.getElementsByTagName('body')[0]
    body.appendChild(form)
    addFormValidation()
    trackForm()

    // Возращение формы при вызове (опционально)
    //return form
}


/*
Создание полей input и select для формы
На вход: JSON["inputs"][n]
На выходе сформированные div блоки с необходимыми полями, свойствами и классами
*/
function inputByType(obj){

    // obj = jsonObj["inputs"]

    // В switch можно добавлять новые обработчики типов input и изменять имеющиеся
    switch (obj["type"]) {

        case "text":
            let input = createBlock(obj)
            return input;

        // List type using  select to create dropdown lists with simple options and option groups
        case "list":
            let select = document.createElement('select')
            select = addOptionGroup(obj, select)
            if (obj.hasOwnProperty("required") && obj.required === true){
                select.required = true
            }
            select.appendChild(createEmptyOption())

            return createBlock(obj, "list", select)

        case "tel":
            return createBlock(obj)

        // Date type uses 3 <select> inputs
        case "date":

            return createDateInput(obj)

        case "checkbox":
            return createBlock(obj, "checkbox")

        case "latin":
            let latin = createBlock(obj)
            latin.lastChild.pattern = "[A-Za-z]{2,}"
            return latin

        default:
            return createBlock(obj)

    }
}


// Создание поля input со свойствами из JSON объекта
// На входе - JSON.inputs[n]
function createInput(obj){
    let input = document.createElement('input')
    for (let key in obj) {
        if (key === "label") continue
        input[key] = obj[key]
    }
    return input
}

// Создание тега label для соответствующего input'а
// На входе - JSON.inputs[n]
function createLabel(obj){
    let label
    if (obj.type !== "button"){
        label = document.createElement('label')
        label.innerText = obj["label"]
        label.setAttribute('for', obj["id"])

    }
    return label
}


/*Создание блока (с данным классом), включающего в себя label и input
На входе - JSON.inputs[n], className (имя класса для блока), input (если уже имеется)
На выходе:
<div>
    <label></label>
    <input/>
</div>*/
function createBlock(obj, className, input=createInput(obj)){
    let inputBlock = document.createElement('div')
    inputBlock.appendChild(createLabel(obj))

    if (input.hasOwnProperty("checkbox")){
        inputBlock.appendChild(input)

        obj["checkbox"]["type"] = "checkbox"
        let checkbox = createBlock(obj["checkbox"], "checkbox")
        inputBlock.appendChild(checkbox)

        if (obj["checkbox"].hasOwnProperty("input")){

            let innerInput = createBlock(obj["checkbox"]["input"])
            innerInput.style.display = "none"
            inputBlock.appendChild(innerInput)

            checkbox.addEventListener("change", (event) => {
                if (innerInput.style.display === "flex") innerInput.style.display = "none"
                else innerInput.style.display = "flex"
            })
        }

        if (obj["checkbox"].hasOwnProperty("blockInput")){
            checkbox.addEventListener("change", (event) => {

                if (inputBlock.childNodes[1].getAttribute("readonly") === "readonly") {
                    inputBlock.childNodes[1].removeAttribute("readonly")
                } else{
                    inputBlock.childNodes[1].setAttribute("readonly", "readonly")
                }

            })
        }

    } else {
        inputBlock.appendChild(input)
    }
    if (className){
        inputBlock.className = className
    }
    return inputBlock
}


/* Добавление в родительский элемент optgroup с его options, если объект обладает таким полем
На входе - JSON.inputs[n], parent (тег select) - родительский элемент, в который необходимо добавить optgroup
На выходе:
<parent>
    <optgroup>
        <option></option>
        <option></option>
    </optgroup>
<parent>
*/
function addOptionGroup(obj, parent){

    if (obj.hasOwnProperty("optgroups")){
        for (const group of obj["optgroups"]) {
            // Creating optgroup and its label
            let optgroup = document.createElement("optgroup")

            if (group.hasOwnProperty("label")){
                optgroup.label = group.label
            }


            // Creating option groups
            optgroup = addOptionGroup(group, optgroup)

            // Adding group to select
            parent.appendChild(optgroup)

        }

    }
    if (obj.hasOwnProperty("options")){
        parent = addOptions(obj, parent)
    }
    return parent
}


/* Добавление в родительский элемент options
На входе - JSON.inputs[n], parent (тег select) - родительский элемент, в который необходимо добавить options
На выходе:
<parent>
    <option></option>
    <option></option>
<parent>
*/
function addOptions(obj, parent) {
    for (const opt of obj["options"]) {
        let option
        if (typeof opt === "string" || typeof opt === "number"){
            option = document.createElement("option")
            option.textContent = opt
            option.value = opt
        } else {
            option = document.createElement("option")
            option.textContent = opt["text"]
            if (opt.hasOwnProperty("value")){
                option.value = opt["value"]
            } else {
                option.value = option.innerText
            }
        }
        parent.appendChild(option)
    }
    return parent
}


// Создает <option hidden disabled selected></option>
function createEmptyOption() {
    let emptyOpt = document.createElement('option')
    emptyOpt.setAttribute("hidden", "")
    emptyOpt.setAttribute("selected", "")
    emptyOpt.setAttribute("disabled", "")
    return emptyOpt
}


// Установка css файла соответствующей темы формы из JSON.theme
function formTheme(form) {
    let link = document.createElement("link")
    link.type = "text/css"
    link.rel = "stylesheet"
    link.href = "css/fm.css"
    document.getElementsByTagName("head")[0].appendChild(link)

    // Директория для тем
    let url = "css/themes/"

    // Добавьте сюда свои темы для отображения
    switch (form["theme"]) {
        case "white":
            url += "white.css"
            break
        case "black":
            url += "black.css"
            break
        default:
            url += "white.css"
    }

    link = document.createElement("link")
    link.type = "text/css"
    link.rel = "stylesheet"
    link.href = url
    document.getElementsByTagName("head")[0].appendChild(link)
}


// Создание блока для полей ввода типа date
function createDateInput(obj) {
    let days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]

    let day
    day = addOptionGroup({ "optgroups": [{ "options": days }] } , document.createElement('select'))
    day.lastChild.id = "days28"
    day.lastChild.setAttribute("hidden", "")

    days.push(29)
    day = addOptionGroup({ "optgroups": [{ "options": days }] } , day)
    day.lastChild.id = "days29"
    day.lastChild.setAttribute("hidden", "")

    days.push(30)
    day = addOptionGroup({ "optgroups": [{ "options": days }] }, day)
    day.lastChild.id = "days30"
    day.lastChild.setAttribute("hidden", "")

    days.push(31)
    day = addOptionGroup({ "optgroups": [{ "options": days }] }, day)
    day.lastChild.id = "days31"

    day.appendChild(createEmptyOption())

    let month
    let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    month = addOptionGroup({"options": months}, document.createElement('select'))
    month.appendChild(createEmptyOption())

    let year
    let years = []
    for (let i = 2007; i >= 1902; i--) {
        years.push(i)
    }
    year = addOptionGroup({"options": years}, document.createElement('select'))
    year.appendChild(createEmptyOption())

    if (obj.hasOwnProperty("required") && obj.required === true){
        day.setAttribute("required", "")
        month.setAttribute("required", "")
        year.setAttribute("required", "")
    }

    let inputBlock = document.createElement('div')
    inputBlock.appendChild(day)
    inputBlock.appendChild(month)
    inputBlock.appendChild(year)
    inputBlock.id = obj["id"]
    inputBlock.className = "form_date"


    let dateBlock = document.createElement("div")
    let label = createLabel(obj)
    dateBlock.appendChild(label)
    dateBlock.className = "list"
    dateBlock.appendChild(inputBlock)
    return dateBlock
}


/*
СТАТИСТИКА

Статистика взаимодействия с формой
Собирает данные по времени заполнения формы и кол-ву совершенных
ошибок
*/

//mistakeCounter - кол-во ошибок
let mistakeCounter = 0

// Log всех ошибок (из-за особенностей программы, ошибки в полях date могут повторяться)
let mistakeLog = []

// Глобальна переменная для таймера формы
let startTimer


// Отслеживает начало и конец взаимодействия с формой и выводит время прохождения формы
function trackForm(){
    let form = document.forms.autogenerated_form

    form.addEventListener("focusin", (event) =>{

        console.log("Началось заполнение формы")

        const start = new Date().getTime();
        startTimer = start
        form.removeEventListener("focusin", ()=>{}, true)
    }, {once: true})



}
function timeInForm(){
    let form = document.forms.autogenerated_form
    form.addEventListener("submit", (event) => {
        event.preventDefault()

        const end = new Date().getTime();
        console.log('Времени потрачено на заполнение формы: ' + (end - startTimer) + 'ms');
        console.log('Допущено ошибок при заполнении: ', mistakeCounter)
        console.log('Log ошибок: (ошибки в поле даты, могут засчитываться несколько раз подряд)', mistakeLog)
        submitForm(form)
    })
}

// Считает ошибки и выводит в консоль
function countMistake(mistakeBlock="") {
    mistakeCounter++
    mistakeLog.push(mistakeBlock)
    console.log("Mistake №" + mistakeCounter)
}

/*
ВАЛИДАЦИЯ
Валидация полей формы, проверка полей на соответсвие их паттернам и правилам,
установленным в функциях validate (validatePhone, validateLatin и т.д.)
*/
function addFormValidation() {

    let form = document.forms.autogenerated_form
    let inputs = form.querySelectorAll('#autogenerated_form > div > input')

    //for (let input of inputs) {
    //    input.addEventListener("change", (event) => mistakeCount())
    //}

    // Инициализация всех input'ов
    initializePhoneInputs()
    initializeLatinInputs()
    initializeMailInputs()
    initializeDateInputs()

}


// Инициализация всех input[type=tel] и добавление к ним listener для проверки верности при изменении
function initializePhoneInputs() {
    let phones = document.querySelectorAll("input[type=tel]")
    // Adding listeners to phone inputs
    for (let phone of phones) {
        phone.addEventListener("change", (event) => validatePhone(phone))
    }
}

// Инициализация всех input[type=mail] и добавление к ним listener для проверки верности при изменении
function initializeMailInputs() {
    let mails = document.querySelectorAll("input[type=email]")
    if (mails.length === 0) return 0
    // Adding listeners to mail inputs
    for (let mail of mails) {
        mail.addEventListener("change", (event) => validateMail(mail))
    }
}

// Инициализация всех полей ввода даты и добавление к ним listener для проверки верности при изменении
function initializeDateInputs() {
    let dates = document.querySelectorAll("div > .form_date")
    if (dates.length === 0) return 0

    // Adding listeners to date inputs
    for (let date of dates) {
        let day = date.firstChild
        let month = date.childNodes[1]
        let year = date.lastChild
        day.addEventListener("change", (event)=>{
            if (!checkDate(day.value, month.value, year.value)){
                day.value = 1
            }

        })
        month.addEventListener("change", (event) => {
            daysOfMonthsAndYears(day, month, year)
            if (!checkDate(day.value, month.value, year.value)){
                day.value = 1
            }
        })
        year.addEventListener("change", (event) => {
            daysOfMonthsAndYears(day, month, year)
            if (!checkDate(day.value, month.value, year.value)){
                day.value = 1
            }
        })
    }
}


// Инициализация всех полей, использующих латиницу и добавление к ним listener для проверки верности при изменении
function initializeLatinInputs() {
    let latins = document.querySelectorAll("input[type=latin]")
    if (latins.length === 0) return 0

    // Adding listeners to phone inputs
    for (let latin of latins) {
        latin.addEventListener("change", (event) => validateLatin(latin))
    }
    let lastName = document.getElementById("last_name")
    let firstName = document.getElementById("first_name")
    lastName.addEventListener("change", (event) => translitContents(document.getElementById("last_name_latin"), lastName.value))
    firstName.addEventListener("change", (event) => translitContents(document.getElementById("first_name_latin"), firstName.value))
}


// Проверка поля ввода номера телефона на действительность
// На входе: <input type="tel" value="...">
function validatePhone(phone) {
    if (phone.value === "") return true

    let pattern = /[+]?[0-9]{11}/

    if (phone.value.match(pattern) && phone.value.length >= 11) {
        phone.style.border = "1px solid grey"
        return true
    } else {
        countMistake(phone)
        phone.style.border = "1px solid red"
        return false
    }
}

// Проверка поля ввода электронной почты на действительность
// На входе: <input type="email" value="...">
function validateMail(mail) {
    if (mail.value === "") return true
    //let pattern = /^[A-Za-z0-9_%+-]+@[A-Za-z0-9.-]\.[A-Za-z]{2,}/
    let pattern = /[^@\s]+@[^@\s]+\.[^@\s]+/
    if (mail.value.match(pattern)) {
        mail.style.border = "1px solid grey"
        return true
    } else {
        countMistake(mail)
        mail.style.border = "1px solid red"
        return false
    }
}

/*
Проверка поля ввода даты на действительность
На входе:
<div class="form_date">
    <select>...</select>
    <select>...</select>
    <select>...</select>
</div>
*/
function validateDate(date) {
    let day = date.firstChild
    let month = date.childNodes[1]
    let year = date.lastChild
    return checkDate(day, month, year)
}

// Проверка правильности даты
// На входе: число, месяц, год (28, "Февраль", 2007)
function checkDate(day, month, year){
    if (month === "") return true
    if (["Январь", "Март", "Май", "Июль", "Август", "Октябрь", "Декабрь"].includes(month)){
        return day <= 31;
    } else if (month !== "Февраль"){
        return day <= 30;
    } else {
        if (year / 4 !== 0 && day <= 29) return true
        else if (day <= 28) return true
        else return false
    }
}

// Изменение кол-ва дней в поле ввода даты в зависимости от месяца и года
// .form_date - блок из 3 select'ов, отвечающих за ввод даты
// На вход: .form_date.firstChild() (day),
//          .form_date.childNodes[1] (month),
//          .form_date.lastChild() (year)

function daysOfMonthsAndYears(day, month, year) {
    if (["Январь", "Март", "Май", "Июль", "Август", "Октябрь", "Декабрь"].includes(month.value)){

        // Можно вынести в отдельную функцию (мне пока не до этого)
        day.childNodes[0].setAttribute("hidden", "")
        day.childNodes[1].setAttribute("hidden", "")
        day.childNodes[2].setAttribute("hidden", "")
        day.childNodes[3].removeAttribute("hidden")

    } else if (month.value !== "Февраль"){
        day.childNodes[0].setAttribute("hidden", "")
        day.childNodes[1].setAttribute("hidden", "")
        day.childNodes[3].setAttribute("hidden", "")
        day.childNodes[2].removeAttribute("hidden")

    } else {
        if (parseInt(year.value) % 4 === 0 && year.value !== 0){
            day.childNodes[0].setAttribute("hidden", "")
            day.childNodes[2].setAttribute("hidden", "")
            day.childNodes[3].setAttribute("hidden", "")
            day.childNodes[1].removeAttribute("hidden")
        } else if (year.value !== 0){
            day.childNodes[1].setAttribute("hidden", "")
            day.childNodes[2].setAttribute("hidden", "")
            day.childNodes[3].setAttribute("hidden", "")
            day.childNodes[0].removeAttribute("hidden")
        }
    }
}


// Проверка правильности поля, использующего только латиницу
// На входе: <input type="latin" value="...">
function validateLatin(latin){
    console.log("validate latin")
    if (latin.value === "") return true
    let pattern = /[A-Za-z]/

    if (latin.value.match(pattern)) {
        console.log("match")
        latin.style.border = "1px solid grey"
        return true
    } else {
        countMistake(latin)
        latin.style.border = "1px solid red"
        return false
    }
}

// Транслитерация содержимого элемента
// На вход: input (в который будет записана транслитерация), string (строка для транслитерации)
function translitContents(el, str) {
    let url = str.replace(/[\s]+/gi, '-');
    url = translit(url);
    url = url.replace(/[^0-9a-z_\-]+/gi, '').toUpperCase();
    el.value = url
}

// Транслитерация строки
// На входе: string
// На выходе: res (транслитированная строка)
function translit(str){

    let ru=("А-а-Б-б-В-в-Ґ-ґ-Г-г-Д-д-Е-е-Ё-ё-Є-є-Ж-ж-З-з-И-и-І-і-Ї-ї-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я").split("-")
    let en=("A-a-B-b-V-v-G-g-G-g-D-d-E-e-E-e-E-e-ZH-zh-Z-z-I-i-I-i-I-i-J-j-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch-'-'-Y-y-'-'-E-e-YU-yu-YA-ya").split("-")
    let res = '';
    for(let i = 0, l = str.length; i<l; i++)
    {
        var s = str.charAt(i), n = ru.indexOf(s);
        if(n >= 0) { res += en[n]; }
        else { res += s; }
    }
    return res;
}

/*
ОБРАБОТКА ФОРМЫ
Валидация всех полей формы (вызывается при событии submit)
*/

function validateForm(){
    let inputs = document.querySelectorAll('form[name=autogenerated_form] input[required]')
    let selects =  document.querySelectorAll('form[name=autogenerated_form] select[required]')

    for (input of inputs){
        input.addEventListener("change", (event) => {
            checkRequiredFields(inputs)
        })
    }
    for (select of selects){
        select.addEventListener("change", (event) => {
            checkRequiredFields(selects)
        })
    }
    let correct = true
    if (!submitLatin()) correct = false
    if (!submitDate()) correct = false
    if (!submitPhone()) correct = false
    if (!submitMail()) correct = false
    if (!checkRequiredFields(inputs)) correct = false
    if (!checkRequiredFields(selects)) correct = false

    if (correct) timeInForm()
    else {
        console.log("Форма неверна!")
        return 0
    }
}

// Проверка заполненности каждого обязательного для заполнения поля
function checkRequiredFields(inputs){
    let filled = true
    for (input of inputs){
        if (input.value === ""){
            countMistake(input)
            input.style.border = "1px solid red"
            filled = false
        } else {
            if (input.value === "on" && !input.checked){
                countMistake(input)
                filled = false
            }
            else input.style.border = "1px solid grey"
        }
    }
    return filled
}


// Валидация всех полей ввода латиницы
function submitLatin() {
    console.log("submiting latin")
    let latins = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=latin]")
    if (latins.length === 0) return true
    for (let latin of latins) {
        if (!validateLatin(latin)) {
            countMistake(latin)
            return false
        }
    }
    return true
}

// Валидация всех полей ввода даты
function submitDate() {
    console.log("submiting dates")
    let dates = document.querySelectorAll("form[name=autogenerated_form] > div > .list > select")
    if (dates.length === 0) return 1
    for (let date of dates) {
        if (!validateLatin(date)) {
            countMistake(date)
            return false
        }
    }
    return true
}

// Валидация всех полей ввода телефона
function submitPhone() {
    console.log("submiting phones")
    let phones = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=tel]")
    if (phones.length === 0) return 1
    for (let phone of phones) {
        if (!validateLatin(phone)) {
            countMistake(phone)
            return false
        }
    }
    return true
}

// Валидация всех полей ввода электронной почты
function submitMail() {
    console.log("submiting mail")
    let mails = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=email]")
    if (mails.length === 0) return 1
    for (let mail of mails) {
        if (!validateLatin(mail)) {
            countMistake(mail)
            return false
        }
    }
    return true
}