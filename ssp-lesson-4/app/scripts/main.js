let iniciarEntrenamiento = false;
let arrPalosBtn = [];
let arrIndicesBtn = [];
let arrIndices = 'A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
let arrPalos = 'spades,hearts,clubs,diams'.split(',');
let templates = {};
let timerEntrenamiento;
let tiempo = '0m 0.00s';
let verificar = false;
let contador = 1;
let arrBarajaOrdenada = [];
let arrBarajaMezclada;
let indiceElegido = '';
let paloElegido = '';
let numeroErrores = 0;
function getTemplates() {
    for (var i = 0; i < 4; i++) {
        getTemplateById('palo' + i);
    }
    for (var i = 0; i < 13; i++) {
        getTemplateById('indice' + arrIndices[i]);
    }
}
function getTemplateById(id) {
    templates[id] = document.getElementById(id).outerHTML;
}
function mezclaBtns() {
    arrPalosBtn = _.shuffle([0, 1, 2, 3]);
    arrIndicesBtn = _.shuffle(arrIndices);
}
function pintaPalos() {
    let domPalos = $('#palos');
    domPalos.empty();
    for (var i = 0; i < 4; i++) {
        var domPalo = $(templates['palo' + arrPalosBtn[i]]);
        domPalo.attr('data-id', arrPalosBtn[i]);
        domPalos.append(domPalo);
    }
}
function pintaIndices() {
    let domIndices0 = $('#indices0');
    let domIndices1 = $('#indices1');
    let domIndices2 = $('#indices2');
    domIndices0.empty();
    domIndices1.empty();
    domIndices2.empty();
    var domIndicesX = domIndices0;
    for (var i = 0; i < 13; i++) {
        var domIndice = $(templates['indice' + arrIndicesBtn[i]]);
        if (i >= 10) {
            domIndicesX = domIndices2;
        } else if (i >= 5) {
            domIndicesX = domIndices1;
        }
        domIndice.attr('data-id', arrIndicesBtn[i]);
        domIndicesX.append(domIndice);
        domIndicesX.append(' ');
    }
}
function inicio() {
    var errores = localStorage.getItem('ultimosErrores');
    if (!errores) {
        errores = '0';
    }
    var ultimoTiempo = localStorage.getItem('utimoTiempo');
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
    $('#carta-indice').text(arrIndices[arrBarajaMezclada[contador - 1][0]]);
    $('#carta-palo').html('&' + arrPalos[arrBarajaMezclada[contador - 1][1]] + ';');
    if (arrBarajaMezclada[contador - 1][1] % 2 == 1) {
        $('#carta-palo').addClass('text-danger');
    } else {
        $('#carta-palo').removeClass('text-danger');
    }
    indiceElegido = '';
    paloElegido = '';
    mezclaBtns();
    pintaPalos();
    pintaIndices();
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
function clickBtnIndice(e) {
    let btn = $(e.target);
    if (btn.prop('tagName') == 'BUTTON') {
        indiceElegido = btn.attr('data-id');
        noerror();
        comprobar();
    }
}
function clickBtnPalo(e) {
    let btn = $(e.target);
    if (btn.prop('tagName') == 'BUTTON') {
        paloElegido = btn.attr('data-id');
        noerror();
        comprobar();
    }
}
function comprobar() {
    if (indiceElegido && paloElegido) {
        var siguienteIndice = arrBarajaMezclada[contador - 1][0] - 4;
        var siguientePalo = arrBarajaMezclada[contador - 1][1] + 1;
        if (siguientePalo >= 4) {
            siguientePalo = 0;
        }
        if (siguienteIndice < 0) {
            siguienteIndice += 13;
            siguientePalo += 1;
            if (siguientePalo >= 4) {
                siguientePalo -= 4;
            }
        }
        var blnCorrecto = arrIndices[siguienteIndice] + '-' + siguientePalo == indiceElegido + '-' + paloElegido;
        indiceElegido = '';
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
        $('#siguiente-indice').text('Es la carta ');
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
    $('#siguiente-indice').text('Es la carta ' + indiceElegido);
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
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 4; j++) {
            arrBarajaOrdenada.push([i, j]);
        }
    }
    $('#indices0,#indices1,#indices2').on('click', clickBtnIndice);
    $('#palos').on('click', clickBtnPalo);
}
$(function () {
    load();

    inicio();
})