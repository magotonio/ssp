let iniciarEntrenamiento = false;
let arrPalosBtn = [];
let arrIndices = 'A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
let arrPalos = 'spades,hearts,clubs,diams'.split(',');
let templates = {};
let timerEntrenamiento;
let tiempo = '0m 0.00s';
let verificar = false;
let contador = 1;
let arrBarajaOrdenada = [];
let arrBarajaMezclada;
let paloElegido = '';
let numeroErrores = 0;
function getTemplates() {
    for (let i = 0; i < 4; i++) {
        getTemplateById('palo' + i);
    }
}
function getTemplateById(id) {
    templates[id] = document.getElementById(id).outerHTML;
}
function inicio() {
    let errores = localStorage.getItem('ultimosErrores');
    if (!errores) {
        errores = '0';
    }
    let ultimoTiempo = localStorage.getItem('utimoTiempo');
    if (!ultimoTiempo) {
        ultimoTiempo = '0m 0.00s';
    }
    $('#ultimos-errores').text(errores);
    $('#ultimo-tiempo').text(ultimoTiempo);
    $('#iniciar').show();
    $('#entrenamiento').hide();
    iniciarEntrenamiento = false;
}
function pintarCarta() {
    $('#count-card').text(contador + ' / 52');
    $('#carta-palo').html('&' + arrPalos[arrBarajaMezclada[contador - 1][1]] + ';');
    $('#carta-indice').text(arrIndices[arrBarajaMezclada[contador - 1][0]]);
    if (arrBarajaMezclada[contador - 1][1] % 2 == 1) {
        $('#carta-palo').addClass('text-danger');
    } else {
        $('#carta-palo').removeClass('text-danger');
    }
    paloElegido = '';
}
function entrenamiento() {
    noerror();
    $('#iniciar').hide();
    $('#entrenamiento').show();
    $('#numero-errores').text('0');
    numeroErrores = 0;
    timerEntrenamiento = new Date();
    iniciarEntrenamiento = true;
    verificar = false;
    contador = 1;
    arrBarajaMezclada = _.shuffle(arrBarajaOrdenada);
    $('#btn-stop').text('Cancelar');
    pintarCarta();
}
function clickIniciar() {
    entrenamiento();
}
function clickStop() {
    if (verificar) {
        inicio();
    } else {
        $('#btn-stop').text('¿Seguro?');
        verificar = true;
        window.setTimeout(clearVerificar, 2000);
    }
}
function clearVerificar() {
    verificar = false;
    $('#btn-stop').text('Cancelar');
}
function contadorTimer() {
    if (iniciarEntrenamiento) {
        $('#span-tiempo').text(cronoString());
    }
}
function clickBtnPalo(e) {
    let btn = $(e.target);
    console.log(btn.attr('data-id'));
    btn.blur();
    if (btn.prop('tagName') == 'BUTTON') {
        paloElegido = btn.attr('data-id');
        noerror();
        comprobar();
    }
}
function comprobar() {
    if (paloElegido) {
        let blnCorrecto = arrBarajaMezclada[contador - 1][2] === parseInt(paloElegido);
        paloElegido = '';
        if (blnCorrecto) {
            correcto();
        } else {
            error();
        }
    }
}
function cronoString() {
    let ahora = new Date();
    let tics = ahora.getTime() - timerEntrenamiento;
    let minutos = Math.trunc(tics / 60000);
    let segundos = (tics - minutos * 60000) / 1000;
    let strSegundos = ('' + (100.0001 + segundos)).substring(1, 6);
    return minutos + 'm ' + strSegundos + 's';
}
function correcto() {
    window.setTimeout(function () {
        $('#siguiente-palo').text('');
    }, 500);
    contador++;
    if (contador == 53) {
        localStorage.setItem('ultimosErrores', numeroErrores);
        localStorage.setItem('utimoTiempo', cronoString());
        inicio();
    }
    else {
        pintarCarta();
    }
}
function error() {
    numeroErrores++;
    $('#numero-errores').text(numeroErrores);
    $('#error').show();
    $('#noerror').hide();
}
function noerror() {
    $('#error').hide();
    $('#noerror').show();
    if (paloElegido != '') {
        $('#siguiente-palo').html('&' + arrPalos[parseInt(paloElegido)] + ';');
    } else {
        $('#siguiente-palo').text('');
    }
}
function load() {
    noerror();
    $('#btn-iniciar').on('click', clickIniciar);
    $('#btn-stop').on('click', clickStop)
    getTemplates();
    window.setInterval(contadorTimer, 200);
    let position = 15; //la 16ª
    for (let j = 3; j >= 0; j--) {
        for (let i = 0; i < 13; i++) {
            arrBarajaOrdenada.push([i, j, Math.trunc(position / 13), position + 1]);
            position += 3;
            if (position > 51) {
                position = position - 52;
            }
        }
    }
    $('#palos').on('click', clickBtnPalo);
}
$(function () {
    load();

    inicio();
})