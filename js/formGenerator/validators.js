function addFormValidation() {
    let form = document.forms.autogenerated_form
    let inputs = form.querySelectorAll('#autogenerated_form > div > input')

    for (let input of inputs) {
        input.addEventListener("change", (event) => mistakeCount())
    }
    initializePhoneInputs()
    initializeLatinInputs()
    initializeMailInputs()
    initializeDateInputs()

}
    // Initializes all phone inputs and add listeners on them
function initializePhoneInputs() {
        let phones = document.querySelectorAll("input[type=tel]")
        // Adding listeners to phone inputs
        for (let phone of phones) {
            phone.addEventListener("change", (event) => validatePhone(phone))
        }
    }
function validatePhone(phone) {
    if (phone.value === "") return true

    let pattern = /[+]?[0-9]{11}/

    if (phone.value.match(pattern) && phone.value.length >= 11) {
        phone.style.border = "1px solid grey"
    } else {
        mistakeCount()
        phone.style.border = "1px solid red"
    }
}

function initializeMailInputs() {
        let mails = document.querySelectorAll("input[type=email]")
        if (mails.length === 0) return 0
        // Adding listeners to mail inputs
        for (let mail of mails) {
            mail.addEventListener("change", (event) => validateMail(mail))
        }
    }
function validateMail(mail) {
    if (mail.value === "") return true
    console.log(mail.value)
    //let pattern = /^[A-Za-z0-9_%+-]+@[A-Za-z0-9.-]\.[A-Za-z]{2,}/
    let pattern = /[^@\s]+@[^@\s]+\.[^@\s]+/
    if (mail.value.match(pattern)) {
        mail.style.border = "1px solid grey"
    } else {
        mistakeCount()
        mail.style.border = "1px solid red"
    }
}

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

function validateDate(date) {
    let day = date.firstChild
    let month = date.childNodes[1]
    let year = date.lastChild
    return checkDate(day, month, year)
}

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

function daysOfMonthsAndYears(day, month, year) {
        if (["Январь", "Март", "Май", "Июль", "Август", "Октябрь", "Декабрь"].includes(month.value)){
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

function validateLatin(latin){
        if (latin.value === "") return true
        let pattern = /^[A-Za-z]+$/

        if (latin.value.match(pattern)) {
            latin.style.border = "1px solid grey"
        } else {
            mistakeCount()
            latin.style.border = "1px solid red"
            return false
        }
    }

function translitContents(el, str) {
        let url = str.replace(/[\s]+/gi, '-');
        url = translit(url);
        url = url.replace(/[^0-9a-z_\-]+/gi, '').toUpperCase();
        el.value = url
    }

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




function submitForm(){
    let inputs = document.querySelectorAll('form[name=autogenerated_form] > div > input')
    checkRequiredFields(inputs)
    let correct = true
    if (!submitLatin()) correct = false
    if (!submitDate()) correct = false
    if (!submitPhone()) correct = false
    if (!submitMail()) correct = false
    return correct
    let form = document.forms.autogenerated_form

    // Submit and send form here...
    //form.submit()
}

function submitLatin() {
    console.log("submiting latin")
    let latins = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=latin]")
    if (latins.length === 0) return 1
    for (let latin of latins) {
        if (!validateLatin(latin)) return false
    }
}
function submitDate() {
    console.log("submiting dates")
    let dates = document.querySelectorAll("form[name=autogenerated_form] > div > .list > select")
    if (dates.length === 0) return 1
    for (let date of dates) {
        console.log(dates)
        if (!validateDate(date)) return false
    }
}
function submitPhone() {
    console.log("submiting phones")
    let phones = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=tel]")
    if (phones.length === 0) return 1
    for (let phone of phones) {
        if (!validatePhone(phone)) return false
    }
}
function submitMail() {
    console.log("submiting mail")
    let mails = document.querySelectorAll("form[name=autogenerated_form] > div > input[type=email]")
    if (mails.length === 0) return 1
    for (let mail of mails) {
        if (!validateMail(mail)) return false
    }
}
function checkRequiredFields(inputs){
    console.log("checking fields")
    for (input of inputs){
        if (input.value === "" && input.hasAttribute("required")){
            mistakeCount()
            input.style.border = "1px solid red"
            return false
        } else {
            input.style.border = "1px solid grey"
        }
    }
}