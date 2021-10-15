const innerCard = 
`<a>
    <h1 contenteditable>My card</h1>
    <p contenteditable>The description that will be revealed after hover</p>
</a>`
const innerSection = 
`
<h1 contenteditable>New row</h1>
<div class="cardlist" id="myProjects">
    <div class="spacer"></div>
    <article class="card card-empty card-disabled">
        <a><h1>Add a card</h1></a>
    </article>
</div>`
const globalPrefs = {
    "title": "My site"
}
var selectedCard = "0";


function createCard() {
    let node = document.createElement('article');
    node.setAttribute('class', 'card')
    node.setAttribute('time', Date.now())
    node.style.animation = "cardAdd 0.5s ease-in-out"
    node.innerHTML = innerCard;
    return node;
}

function saveCardAttr(change, elem, time) {
    const val = $(elem).val()
    if (change == 'url') {
        if (val == '') {
            $(`[time=${time}]`).find('a').removeAttr('href')
        } else {
            $(`[time=${time}]`).find('a').attr('href', val)
        }
    } else if (change == 'background-image') {
        if (val == '') {
            $(`[time=${time}]`).css('background-image', '')
        } else {
            $(`[time=${time}]`).css('background-image', `url(${val})`)
        }
    } else if (change == 'background') {
        if (val == '') {
            $(`[time=${time}]`).css('background', '')
        } else {
            $(`[time=${time}]`).css('background', val)
        }
    }
}

function popupMenu(event) {
    event.preventDefault();
    selectedCard = $(this).attr('time');
    if (!$(this)[0].style.background.includes("url(")) {
        $('#popupMenu').find('input#background').val($(this)[0].style.background)
    }
    else {
        $('#popupMenu').find('input#background').val('')
    }
    if ($(this)[0].style.backgroundImage.match(/^url\((.*)\)$/)) {
        $('#popupMenu').find('input#background-image').val($(this)[0].style.backgroundImage.match(/^url\(\"(.*)\"\)$/)[1])
    } else {
        // no background image - no regex match!
        $('#popupMenu').find('input#background-image').val('')
    }
    $('#popupMenu').find('input#url').val($(this).find('a').attr('href'))
    $('#popupMenu').slideDown(100);
}

function contextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    selectedCard = $(this).attr('time');
    if (this.nodeName == "SECTION") {
        // row opts
        $('#contextMenu').find('ul').html(`
            <li class="warningBtn" onclick="deleteCard()"><span class="material-icons">delete</span> Delete row</li></ul>
        `)
        $('#deleteText').text('Delete row')
        $('#contextMenu').css({"top": event.pageY, "left": event.pageX}).show(100)
    } else {
        // card opts
        $('#contextMenu').find('ul').html(`
            <li class="warningBtn" onclick="deleteCard()"><span class="material-icons">delete</span> Delete card</li></ul>
        `)
        $('#contextMenu').css({"top": event.pageY, "left": event.pageX}).show(100)
    }
    
}

function addCard(event) {
    $(this).before(createCard())
    refreshListeners();
}
function deleteCard() {
    let selector = `[time="${selectedCard}"]`
    $("#contextMenu").hide(100);
    if ($(selector)[0].nodeName == "SECTION") {
        $(selector).css('animation', "rowDelete 0.5s ease-in-out")
    } else {
        $(selector).css('animation', "cardDelete 0.5s ease-in-out")
    }
    setTimeout(() => {$(selector).slideUp(200, function() {$(selector).remove()})}, 150)
}
function addSection() {
    let node = document.createElement('section');
    node.setAttribute('time', Date.now())
    node.innerHTML = innerSection;
    $('#addSection').before(node).prev().slideDown(100);
    refreshListeners();
}
function refreshListeners() {
    $('.card:not(.card-empty)').off('click').click(popupMenu).off('contextmenu').contextmenu(contextMenu);
    $('section:not(".editor-only")').off('contextmenu').contextmenu(contextMenu);
    $('.card-empty').off('click').click(addCard)
}

$(document).ready(function() {
    refreshListeners();
})

$(document).bind("mousedown", function (e) {
    // If clicked outside the active menu, hide it
    // Right click menu should always hide when clicked; popup menu should not
    if (!$(e.target).parents("#contextMenu").length > 0) {
        $("#contextMenu").hide(100);
    }
    if (!$(e.target).parents("#popupMenu").length > 0 && !$(e.target).parents(`[time=${selectedCard}]`).length > 0) {
        $("#popupMenu").slideUp(100);
    }
});


function exportDOM(save=false) {
    let domBody = document.body.cloneNode(true)
    let domStyles = JSON.stringify(document.styleSheets)
    $(domBody).find('.editor-only').remove();
    $(domBody).find('.card').css('animation', '')
    $(domBody).find('[contenteditable=""]').removeAttr('contenteditable') // remove content editable
    $(domBody).find('.card-empty').find('h1').text('Coming soon')
    $(domBody).find('#watermark').text('This homepage was created using Homepage Maker by cabalex.')
    $(domBody).find('.card a:not(.card a[href]):not(.card-empty a)').parent().attr('class', 'card card-disabled') // disable cards without links
    
    const domHead = `
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="Homepage Maker">
    <meta property="og:description" content="This homepage was created with https://cabalex.github.io/homepage-maker .">
    <meta property="og:image" content="https://cabalex.github.io/homepage-maker/assets/cover.png">
    <title>My Homepage</title>
    `

    if (save) {
        const output = `<!DOCTYPE html>\n<html lang="en">\n<head>${domHead}</head>\n${docStyle}\n<body>${domBody.innerHTML}${shakeHandler}</body>\n</html>`
        var file = new Blob([output], {type: 'text/html'});
        var a = document.createElement("a");
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = "my-homepage.html";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0);
    } else {
        /* create a new window */
        var win = window.open("", "Window", "toolbar=no,location=no,directories=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width=780,height=500,top="+(screen.height-400)+",left="+(screen.width-840));
        
        win.document.body = domBody;

        let range = win.document.createRange()
        win.document.head.append(range.createContextualFragment(domHead));
        win.document.head.append(range.createContextualFragment(docStyle));

        win.focus();
        win.window.shakeAnim = async function (ev){
            if (this.style.animation) return;
            this.style.animation = 'shakeDeny 0.25s ease-in-out'
            await new Promise(r => setTimeout(r, 250));
            this.style.animation = '';
        }
        const cardElems = win.document.getElementsByClassName('card-disabled');
        for (var i = 0; i < cardElems.length; i++) {
            cardElems[i].addEventListener('click', win.window.shakeAnim)
        }
    }
    
}

const shakeHandler = `
<script type="text/javascript" defer>async function shakeAnim(ev) {
    if (this.style.animation) return;
    this.style.animation = 'shakeDeny 0.25s ease-in-out'
    await new Promise(r => setTimeout(r, 250));
    this.style.animation = '';
}
const cardElems = document.getElementsByClassName('card-disabled');
for (var i = 0; i < cardElems.length; i++) {
    cardElems[i].addEventListener('click', shakeAnim)
}</script>
`

/* this style is applied to both the main and created websites */
const docStyle = `<style>
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@700&display=swap');
:root {
    --black: #111;
    --grey: #333;
    --red: #ED4245;
    --blue: #5865F2;
    --yellow: #FEE75C;
    --green: #57F287;
    color-scheme: dark;
}

body {
    background-color: var(--black);
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
}
header {
    background-color: var(--blue);
}
footer {
    background-color: var(--grey);
}
header, footer {
    border-radius: 0.25em;
    min-height: 200px;
    margin: 10px;
    top: 0;
    position: relative;
}
img {
    vertical-align: middle;
}
header > * {
    position: absolute;
    margin: 10px;
    bottom: 10px;
    width: 100%;
}
footer > * {
    position: absolute;
    margin: 10px;
    top: 10px;
    width: 100%;
}
section > h1 {
    margin-left: 20px;
}
.subtext {
    font-size: 12px;
}
.spacer {
    width: 20px;
    flex-shrink: 0;
}
h1, h2, h3 {
    font-family: 'Work Sans', sans-serif;
    margin-bottom: 5px;
}
.warning-bar {
    margin: 10px;
    background-color: var(--red);
    padding: 10px;
    border-radius: 0.25em;
    text-decoration: none;
}
*:not(.card) > a {
    color: inherit;
    text-decoration: none;
    font-weight: bold;
}
.cardlist {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px;
    animation: 0.5s cubic-bezier(0.075, 0.82, 0.165, 1) 0s 1 slideInFromBottom;
}
@keyframes slideInFromBottom {
    0% {
        transform: translateY(50%);
        filter: opacity(0);
    }
    100% {
        transform: translateY(0);
        filter: opacity(1);
    }
}
@keyframes cardDelete {
    0% {
        transform: translateY(0);
        filter: opacity(1);
    }
    50% {
        transform: translateY(100%);
        filter: opacity(0);
        width: 200px;
    }
    100% {
        transform: translateY(100%);
        filter: opacity(0);
        width: 0px;
    }
}
@keyframes rowDelete {
    0% {
        transform: translateX(0);
        filter: opacity(1);
    }
    50% {
        transform: translateX(-100%);
        filter: opacity(0);
    }
    100% {
        transform: translateX(-100%);
        filter: opacity(0);
    }
}
@keyframes cardAdd {
    0% {
        transform: translateY(100%);
        filter: opacity(0);
        width: 0px;
    }
    50% {
        transform: translateY(100%);
        filter: opacity(0);
        width: 200px;
    }
    100% {
        transform: translateY(0);
        filter: opacity(1);
    }
}
@keyframes shakeDeny {
    0% {
        transform: 0;
        filter: brightness(1);
    }
    25% {
        transform: translateX(-10px);
        filter: brightness(0.8);
    }
    75% {
        transform: translateX(10px);
        filter: brightness(0.8);
    }
    100% {
        filter: brightness(1);
        transform: 0;
    }
}
.card {
    width: 200px;
    position: relative;
    flex-shrink: 0;
    height: 100px;
    border-radius: 0.25em;
    z-index: 1;
    user-select: none;
    transition: transform 0.2s, box-shadow 0.2s;
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: 100% 0% !important;
    overflow: hidden;
    background-color: white;
}
.card:not([id]):not(.card-empty):not(.my-card) {
    background: linear-gradient(90deg, #000 0%, #fff 100%);
}
.card::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    background: linear-gradient(0deg, #00000088 30%, #ffffff44 100%);
    background-blend-mode: multiply;
}
.card:hover:not(.card-empty):not(.card-disabled) {
    transform: scale(1.1);
    z-index: 2;
    box-shadow: 0 0 5px black;
}
.card a {
    position: absolute;
    height: 100%;
    width: calc(100% - 10px);
    color: inherit;
    top: 0;
    text-decoration: none;
    overflow: hidden;
    padding: 5px;
    transition: transform 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.card:not(.card-empty):not(.card-disabled) a:active {
    transform: scale(0.9);
    z-index: 2;
}
.card a * {
    margin-top: 15px;
}
.card a h1 {
    padding-top: 50px;
    transition: padding 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.card:hover:not(.card-empty) a h1 {
    padding-top: 0px;
}
.card p {
    font-size: 12px;
}
.card-empty {
    border: 3px dashed white;
    width: 194px;
    background-color: transparent;
    height: 94px;
}
.card-empty:before {
    background: none;
}
/* my links */
.my-card {
    background-color: var(--blue);
}
#add-link {
    transition: filter 0.2s;
    cursor: pointer;
}
#add-link:hover {
    filter: brightness(0.8)
}
</style>`

let range = document.createRange()
let frag = range.createContextualFragment(docStyle);
document.head.append(frag);