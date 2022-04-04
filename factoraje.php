<?php
include('assets/includes/header.php');
header('Cache-Control: no-cache');
header('Pragma: no-cache');
?>
<section>
    <div class=".container-all-fd bk-home2 container-fluid vh-100">
        <div class="row-fd row flex-row justify-content-center align-items-center">
            <div class="col-pleca-fd col-12 col-sm-6 d-flex flex-column justify-content-center align-items-center">
                <div class="col-son-fd">
                    <h2 class="title-section-w-fd t-large mb-0">Factoraje</h2>
                    <h2 class="title-section-w-fd mb-0">a proveedores</h2>
                    <h5 class="font-color-w" style="letter-spacing: 1.75px;">OFRECEMOS LAS MEJORES SOLUCIONES</h5>
                </div>
                <div class="col-son-fd mt-4">
                    <div class="button_box-fd button_box">
                        <a href="#factoraje" class="btn-fd btn deneb_btn btn-block">Simula tu factoraje</a>
                    </div>
                    <div class="button_box-fd button_box">
                        <a href="login-factoraje.php" class="btn-fd btn deneb_btn btn-block">Solicita tu factoraje</a>
                    </div>

                </div>
            </div>
            <div class="col-12 col-sm-6">
            </div>
        </div>
    </div>
</section>
<section id="factoraje">
    <div class="container-fluid pd-fd">
        <div class="row">
            <div class="col-12 text-center">
                <h2 class="title-section-g-fd">Simulacion de Factoraje</h2>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-12 col-md-3 d-flex flex-column justify-content-center justify-content-between">

            </div>
            <div class="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <table id="listado_factoraje" class="table table-striped" style="width: 700px">
                    <tbody>
                        <tr>
                            <td colspan="3">
                                Total neto de sus facturas
                            </td>
                            <td colspan="6" style="text-align: right;">
                                <div class="row">
                                    <div class="col-md-6">
                                    </div>
                                    <div class="col-md-6">
                                        <input class="form-control" id="total_facturas" type="text" placeholder="$ 0.00">
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th colspan="3" align="right" style="text-align: right;padding-right: 40px;"><input type="hidden" name="factu_selecs" id="factu_selecs" value="0">
                                <!-- span id="factu_selecs_html">0</span> Facturas Seleccionadas -->
                            </th>
                            <th colspan="2" align="right" style="text-align: right;padding-right: 40px;"><b>Valor Factura(s)</b>
                            </th>
                            <td align="right" width="150"><input type="hidden" name="valor_facturas" id="valor_facturas">$<span id="valor_facturas_html">0.00</span></td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;"><b>Comisión</b></th>
                            <td align="right" width="150">8%</td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;"><b>Plazo en dias</b></th>
                            <td align="right" width="150">90</td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;"><b>Taza fija anual</b></th>
                            <td align="right" width="150">36%</td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;border-top: 1px solid #000;">
                                <b>Capital entregado</b>
                            </th>
                            <td align="right" width="150" style="border-top: 1px solid #000;">
                                <input type="hidden" name="capital_entregado" id="capital_entregado">
                                $<span id="capital_entregado_html">0.00</span>
                            </td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;">
                                <b>Interes generado</b>
                            </th>
                            <td align="right" width="150">
                                <input type="hidden" name="interes_generado" id="interes_generado">
                                $<span id="interes_generado_html">0.00</span>
                            </td>
                        </tr>
                        <tr>
                            <th colspan="5" align="right" style="text-align: right;padding-right: 40px;border-bottom: 1px solid #000;">
                                <b>Garantia</b>
                            </th>
                            <td align="right" width="150" style="border-bottom: 1px solid #000;">
                                <input type="hidden" name="garantia" id="garantia">
                                $<span id="garantia_html">0.00</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="6" align="center" width="150">

                                <a href="login-factoraje.php" class="btn-fd btn deneb_btn btn-block">Solicitar Factoraje</a>


                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <div class="col-12 col-md-3 d-flex flex-column justify-content-center justify-content-between">

            </div>
        </div>

    </div>
</section>

<section>
    <div class="bk-home-2 container-fluid pd-fd">
        <div class="row mt-4">
            <div class="col-12 text-center">
                <h1 class="title-section-o-fd">Factoraje a proveedores</h1>
            </div>
        </div>
        <div class="row mt-4 align-items-center justify-content-around">
            <div class="col-6 col-md-2-fd text-center pd-sm-fd">
                <img src="./assets/images/005-technical-support-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                <strong class="font-color-w">TE APOYAMOS PAGANDO TUS FACTURAS</br>DE INMEDIATO</strong>
            </div>
            <div class="col-6 col-md-2-fd text-center pd-sm-fd">
                <img src="./assets/images//001-app-development-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                <strong class="font-color-w">SOLICITA FACTORAJE DE </br>FACTURAS AUTORIZADAS PARA PAGO</strong>
            </div>
            <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                <img src="./assets/images/007-documents-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                <strong class="font-color-w">FIRMA</br>CONTRATO</strong>
            </div>


            <div class="col-6 col-md-2-fd text-center pd-sm-fd">
                <img src="./assets/images/004-loan-sofortaleza-2.svg" class="icon-svg img-fluid" alt="turistore icono">
                <strong class="font-color-w">RECIBE EL EFECTIVO </br></strong>
            </div>
        </div>
    </div>
</section>
<div style="display:none">

    <section id="about">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12 col-md-6 pd-r-fd">
                    <h2 class="title-section-g-fd pd-content-responsive">Acerca de nosotros</h2>
                    <div class="space-content-fd pd-content-responsive">
                        <p class="text-justify-fd">SOFORTALEZA es una empresa 100% mexicana que ofrece servicios financieros de manera digital, rápida, fácil y sin riesgos, con la finalidad de atender las necesidades urgentes o planificadas de cada uno de nuestros usuarios.</p>
                        <p class="text-justify-fd">En SOFORTALEZA, lo que más nos importa es tu bienestar y el de tu familia, por eso, los créditos solicitados siempre serán equivalentes a tus ingresos cuidando no afectar tu economía.</p>
                        <p class="text-justify-fd">Te aseguramos la obtención de fondos en moneda nacional en tiempo real, plazos fijos que se acomoden a tu ritmo de vida y las comisiones más bajas del mercado.</p>
                        <div class="container-flex-row-responsive-col-sm col-12">
                            <div class="button_box-fd button_box w50-fd text-start">
                                <a href="solicitalo-ahora.php" class="btn-fd btn deneb_btn btn-block">Solicitalo ahora</a>
                            </div>
                            <div class="button_box-fd button_box w50-fd text-start">
                                <a href="https://play.google.com/store/apps/details?id=mx.avasis.microfin_factor_fortaleza" target="_blank" class="btn-fd btn deneb_btn btn-block">Descarga la App</a>
                            </div>
                        </div>
                    </div>
                    <img class="img-bk-only-movil-fd" src="assets/images/sofortaleza-acerca.jpg" alt="sofortaleza-acerca">
                </div>
                <div class="col-12 col-md-6 bk-col-home-4">
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="container pd-fd">
            <div class="row bk-home-2 me-2 ms-2">
                <div class="col-12 col-md-7 pd-r0-fd">
                    <strong>
                        <h2 class="title-section-w-fd pd-content-responsive">RECUERDA QUE...</h2>
                    </strong>
                    <p class="font-color-w text-impact pd-content-responsive">Los beneficios de SOFORTALEZA son exclusivos para empleados de las empresas asociadas.</p>
                    <div class="container-flex-row-responsive-col-sm col-12 pd-content-responsive">
                        <div class="button_box-fd button_box w50-fd text-start">
                            <a href="para-empresas.php" class="btn-fd btn deneb_btn btn-block">Conoce más</a>
                        </div>
                    </div>
                    <img class="img-bk-only-movil-fd mt-5" src="assets/images/sofotaleza-home.jpg" alt="sofortaleza">
                </div>
                <div class="col-12 col-md-5 bk-col-home-5">
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="bk-home-4 container-fluid pd-fd">
            <div class="row mt-4">
                <div class="col-12 text-center">
                    <h1 class="title-section-o-fd">SOLO NECESITAS...</h1>
                </div>
            </div>
            <div class="row mt-4 align-items-center justify-content-around">
                <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                    <img src="./assets/images/006-identification-card-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                    <strong class="font-color-w">IDENTIFICACIÓN</br>OFICIAL</strong>
                </div>
                <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                    <img src="./assets/images/007-documents-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                    <strong class="font-color-w">COMPROBANTE</br>DE DOMICILIO</strong>
                </div>
                <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                    <img src="./assets/images/008-incomes-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                    <strong class="font-color-w">COMPROBANTE</br>DE INGRESOS</strong>
                </div>
                <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                    <img src="./assets/images/009-financial-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                    <strong class="font-color-w">CUENTA</br>BANCARIA</strong>
                </div>
                <div class="col-12 col-md-2-fd text-center pd-sm-fd">
                    <img src="./assets/images/010-statement-sofortaleza.svg" class="icon-svg img-fluid" alt="turistore icono">
                    <strong class="font-color-w">HISTORIAL</br>CREDITICIO</strong>
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="container-fluid pd-fd">
            <div class="container">
                <div class="row mt-4">
                    <div class="col-12 text-center">
                        <h2 class="title-section-g-fd">Obtenlo ahora, es fácil y rápido</h2>
                    </div>
                </div>
                <div class="row mt-4 align-items-center justify-content-around">
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/001-login-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 1</strong></h3>
                        <p>Ingresa a la plataforma con el usuario y contraseña que recibiste en el correo electrónico de bienvenida.</p>
                    </div>
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/002-contact-form-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 2</strong></h3>
                        <p>Llena los campos requeridos y carga tu documentación hasta que aparezca el botón “enviar solicitud”.</p>
                    </div>
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/003-calendar-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 3</strong></h3>
                        <p>En un máximo de dos días hábiles uno de nuestros ejecutivos te informará si fue aprobado tu crédito.</p>
                    </div>
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/004-email-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 4</strong></h3>
                        <p>Revisa tu bandeja de correo en dónde recibirás tus documentos de contratación.</p>
                    </div>
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/005-bank-statement-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 5</strong></h3>
                        <p>Se realizará el fondeo de tu préstamo a la cuenta bancaria establecida.</p>
                    </div>
                    <div class="col-12 col-md-4 text-center pd-sm-fd-2">
                        <img src="./assets/images/006-wallet-sofortaleza.svg" class="icon-svg-2 img-fluid" alt="turistore icono">
                        <h3><strong class="font-color-g text-impact">Paso 6</strong></h3>
                        <p>Verás el descuento corresponidente reflejado en tu siguiente pago.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="bk-home-4 container-fluid pd-fd">
            <div class="container">
                <div class="row">
                    <div class="col-12 d-flex flex-column justify-content-center align-items-center text-center">
                        <h2 class="title-section-w-fd title-thin">Contigo en las buenas y en las malas</h2>
                        <p class="font-color-w text-center w70-fd">Para SOFORTALEZA tú eres importante, por eso te facilitamos préstamos rápidos y simples, resolviendo cualquier situación que se te presente.</p>
                    </div>
                </div>
                <div class="row mt-4 justify-content-center align-items-center">
                    <div class="container-flex-row-responsive-col col-12 col-sm-6-fd">
                        <div class="button_box-fd button_box w50-fd text-center">
                            <a href="solicitalo-ahora.php" class="btn-fd btn deneb_btn btn-block">Solicitalo ahora</a>
                        </div>
                        <div class="button_box-fd button_box w50-fd text-center">
                            <a href="https://play.google.com/store/apps/details?id=mx.avasis.microfin_factor_fortaleza" target="_blank" class="btn-fd btn deneb_btn btn-block">Descarga la App</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
<?php
include('assets/includes/footer.php');
?>
<script>
    $(document).ready(function($) {
        //--
        $("#total_facturas").on("keyup", function() {
            var valor = $(this).val();
            calc(valor);
        });
    });

    function calc(valor_facturas) {
        //alert(valor_facturas);
        //--
        $("#valor_facturas").val(valor_facturas);
        $("#valor_facturas_html").html(number_format(valor_facturas, 2));
        //--
        var capital_entregado = valor_facturas * .8;
        //alert("valor_facturas * .8 = " + valor_facturas + " * .8 = " + capital_entregado);
        $("#capital_entregado").val(capital_entregado);
        $("#capital_entregado_html").html(number_format(capital_entregado, 2));
        //--
        var interes = ((capital_entregado * 3 * 12) / 36000) * 90;
        //alert("((" + capital_entregado + " * 3 * 12) / 36000) * 90 = " + interes);
        $("#interes_generado").val(interes);
        $("#interes_generado_html").html(number_format(interes, 2));
        var garantia = valor_facturas - (capital_entregado + interes);
        //alert(garantia);
        $("#garantia").val(garantia);
        $("#garantia_html").html(number_format(garantia, 2));
    }
    //------------------------------------------------------------------------------
    function number_format(amount, decimals) {

        amount += ''; // por si pasan un numero en vez de un string
        amount = parseFloat(amount.replace(/[^0-9\.]/g, '')); // elimino cualquier cosa que no sea numero o punto

        decimals = decimals || 0; // por si la variable no fue fue pasada

        // si no es un numero o es igual a cero retorno el mismo cero
        if (isNaN(amount) || amount === 0)
            return parseFloat(0).toFixed(decimals);

        // si es mayor o menor que cero retorno el valor formateado como numero
        amount = '' + amount.toFixed(decimals);

        var amount_parts = amount.split('.'),
            regexp = /(\d+)(\d{3})/;

        while (regexp.test(amount_parts[0]))
            amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');

        return amount_parts.join('.');
    }
    //-->
</script>