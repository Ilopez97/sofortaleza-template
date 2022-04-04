<?php
include('assets/includes/header.php');
?>

<head>
    <link type="text/css" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/south-street/jquery-ui.css"
        rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="assets/css/jquery.signature.css">
    <style>
    /*estilos del contenedor de firma autográfa*/
    .kbw-signature {
        width: 400px;
        height: 200px;
    }

    #signature canvas {
        width: 100% !important;
        background-color: white;
        height: auto;
    }
    </style>
</head>
<section>
    <div class="container-all-fd header-section container-fluid">
        <div class="row">
            <div class="col-12 head-title text-center">
                <h1 class="text-white">Bienvenida</h1>
                <h4 class="text-white">Solicitar crédito simple</h4>
                <a id="aIndex" href="#" style="display: none;"></a>
            </div>
        </div>
    </div>
</section>
<section>
    <div class="container mb-4 mt-4">
        <div class="row">
            <div class="col-12 col-md-5">
                <div class="card-in">
                    <h5 class="Nombre_completo"></h5>
                    <p id="Empresaa"></p>
                    <p><span class="green-type">RFC:</span> <span id="RFC"></span></p>
                    <p><span class="green-type">CURP:</span> <span id="CURP"></span></p>
                    <p><span class="green-type">Puesto:</span> <span id="Puesto"></span></p>
                    <p><span class="green-type">Celular:</span> <span class="Celular"></span></p>

                </div>
            </div>

            <div class="col-12 col-md-7 ml-4">
                <div class="card-in">
                    <div class="row">
                        <div class="col-12 col-md-4 text-center">
                            <p><span class="green-type">Crédito disponible hasta:</span></p>
                            <h4 class="Anticipo"></h4>
                        </div>
                        <div class="col-12 col-md-8">
                            <p>Comisión por apertura: <span class="green-type"><?php echo '3.00'; ?>% de tu crédito más
                                    IVA.</span></p>
                            <p>Tasa de interés: <span class="green-type"><?php echo '3.00'; ?>%</span></p>
                            <p>Enganche y/o anticipo: <span class="green-type">$0.00.</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<div class="container">
    <div class="col-12" style="text-align: right;">
        <button type="button" class="btn btn-fd salir">Salir</button>
    </div>
</div>
<!-- Aquí inicia el formulario el cual debe de integrase -->

<section>
    <?php include('modales/modal.php'); ?>

    <div class="container">
        <form id="formDatos" enctype="multipart/form-data">
            <div class="row">
                <div class="col-lg-12">

                    <div class="contact_form" id="contenedor-datos">
                        <div class="row">
                            <div class="col-12">
                                <div class="form_group">
                                    <div class="row">
                                        <input type="hidden" name="idEmp" id="idEmp">
                                        <input type="hidden" name="PEP" id="PEP" value="0">
                                        <input type="hidden" name="NoEmpl" id="NoEmpl">
                                        <input type="hidden" name="banco" id="banco">
                                        <input type="hidden" name="cuenta" id="cuenta">
                                        <input type="hidden" name="email" id="email">
                                        <input type="hidden" name="latitud" id="latitud">
                                        <input type="hidden" name="longitud" id="longitud">
                                        <input type="hidden" name="credito" id="credito">
                                        <div class="form_group" style="display: block;" id="div_datos">
                                            <h4>Completa los siguientes datos</h4>
                                            <p>( <span style="color: red;">*</span> ) Obligatorio</p> <br>
                                            <h5>Datos generales</h5>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Nombre</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="Nombre" id="Nombre" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Apellido Paterno</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="Apaterno" id="Apaterno" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Apellido Materno</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="Amaterno" id="Amaterno" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-3">
                                                    <div class="form_group">
                                                        <label for="">Fecha Nacimiento</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="fechaNac" id="fechaNac" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-3">
                                                    <div class="form_group">
                                                        <label for="">Edad</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="edad" id="edad" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-3">
                                                    <div class="form_group">
                                                        <label for="">Sexo</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="sexo" id="sexo" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-3">
                                                    <div class="form_group">
                                                        <label for="">Entidad Federativa de Nacimiento</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="entidadNac" id="entidadNac" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">País de Nacimiento</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="paisNac" id="paisNac" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Nacionalidad</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="nacionalidad" id="nacionalidad" value="Mexicano(a)"
                                                            readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Ocupación/Profesión</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="profesion" id="profesion" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">CURP</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="curp2" id="curp2" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">RFC</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="rfc2" id="rfc2" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Número de seguro social</label>
                                                        <input type="text" name="nss" id="nss"
                                                            class="form-control-fd-diss form-control">
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Teléfono fijo</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="telFijoSol" id="telFijoSol">
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <label for="">Teléfono celular</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="cel2" id="cel2">
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Correo
                                                            electrónico</label>
                                                        <input type="email" id="email1"
                                                            class="form-control-fd form-control">
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Estado Civil</label>
                                                        <select name="edocivil" id="edocivil">
                                                            <option value="">Seleccione su estado civil</option>
                                                            <option value="Soltero">Soltero</option>
                                                            <option value="Casado">Casado</option>
                                                            <option value="Unión Libre">Unión Libre</option>
                                                            <option value="Otro">Otro</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-4" id="divRegimen" style="display: none;">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Regimén
                                                            matrimonial</label>
                                                        <select name="regimen" id="regimen">
                                                            <option value="">Seleccione su regimén matrimonial</option>
                                                            <option value="Bienes mancomunados">Bienes mancomunados
                                                            </option>
                                                            <option value="Bienes separados">Bienes separados</option>

                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Tipo de
                                                            vivienda</label>
                                                        <select name="vivienda" id="vivienda">
                                                            <option value="">Seleccione su tipo de vivienda</option>
                                                            <option value="Propia">Propia</option>
                                                            <option value="Rentada">Rentada</option>
                                                            <option value="Hipotecada">Hipotecada</option>
                                                            <option value="Vive con familiares">Vive con familiares
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                            <h4>Datos de domicilio</h4>
                                            <div class="row">
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Calle</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="calle" id="calle">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <label for="">No. Interior</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="noint" id="noint">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">No. Exterior</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="noext" id="noext">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Colonia</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="colonia" id="colonia">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">C.P</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="cp" id="cp">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Ciudad</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="ciudad" id="ciudad">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Municipio</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="municipio" id="municipio">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Estado</label>
                                                        <input type="text" class="form-control-fd form-control"
                                                            name="estado" id="estado">
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-4">
                                                    <div class="form_group">
                                                        <label for="">País</label>
                                                        <input type="text" class="form-control-fd-diss form-control"
                                                            name="paisSol" id="paisSol" value="México" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-4">
                                                    <div class="form_group" id="divDestino">
                                                        <i style="color: red;">*</i> <label for="">Destino del
                                                            crédito</label>
                                                        <select name="destino" id="destino"
                                                            class="form-control-fd form-control">
                                                            <option value="">Seleccione el destino de su crédito
                                                            </option>
                                                        </select>
                                                        <a href="javascript:void(0)" id="selecOp"
                                                            style="display: none;">Quiero seleccionar una opción</a>
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-4"></div>
                                                <div class="col-12">
                                                    <div class="form_group">
                                                        <i style="color: red;">*</i> <label for="">Referencias de
                                                            domicilio</label>
                                                        <textarea name="georef" id="georef"
                                                            class="form-control-fd form-control"
                                                            placeholder="Ingrese referencias de su domicilio. Por ejemplo: Casa color verde entre calle Juárez y Galeana, etc."
                                                            cols="30" rows="6"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                            <!-- INICIA SECCIÓN DE SELECCIONAR CANTIDAD -->
                                            <div class="row">
                                                <div id="tabla-credito">

                                                    <div class="form_group" style="display: block;" id="rango_div">
                                                        <div class="col-md-6" style="text-align: left;">
                                                            <h4>¿Cuánto deseas solicitar de tú crédito?</h4>
                                                        </div> <br>
                                                        <div class="col-12 col-md-5" style="text-align:center">
                                                            <h4 for="rango"> <strong id="cant_rango"
                                                                    style="font-size: 22px;">$2000</strong></h4>
                                                            <input type="range" name="rango" id="rango"
                                                                class="form_control" min="1" max="2000" step="1">
                                                            <input type="hidden" name="rango-input" id="rango-input"
                                                                class="form-control">
                                                            <a href="javascript:void(0)" id="cant-credito">Quiero
                                                                ingresar
                                                                la cantidad manualmente</a>
                                                        </div>
                                                        <div class="col-12 col-md-5 mt-5" style="text-align:center">
                                                            <div class="container form_group">
                                                                <select name="plazo-credito" id="plazo-credito"
                                                                    class="form-control-fd form-control">
                                                                    <option value="">Seleccione el plazo de pago su
                                                                        crédito
                                                                    </option>
                                                                    <option value="2">2 Quincenas</option>
                                                                    <option value="3">3 Quincenas</option>
                                                                    <option value="4">4 Quincenas</option>
                                                                    <option value="5">5 Quincenas</option>
                                                                    <option value="6">6 Quincenas</option>
                                                                    <option value="7">7 Quincenas</option>
                                                                    <option value="8">8 Quincenas</option>
                                                                    <option value="9">9 Quincenas</option>
                                                                    <option value="10">10 Quincenas</option>
                                                                    <option value="11">11 Quincenas</option>
                                                                    <option value="12">12 Quincenas</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 col-md-5 mt-5" style="text-align:center">
                                                            <a href="javascript:void(0)" class="btn btn-fd"
                                                                id="btn-pagos">Ver tabla de pagos</a>
                                                        </div>
                                                    </div>

                                                    <div class="form_group">
                                                        <div class="col-12 col-md-12">
                                                            <table class="table table-responsive-md" id="tabla-pagos"
                                                                style="display:block">
                                                                <thead>
                                                                    <tr>
                                                                        <th>No. Pago</th>
                                                                        <th>Saldo Inicial</th>
                                                                        <th>Capital</th>
                                                                        <th>Interés</th>
                                                                        <th>IVA</th>
                                                                        <th>Comisión por Disp.</th>
                                                                        <th>Total a pagar</th>
                                                                        <th>Saldo pendiente</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>

                                                                </tbody>
                                                            </table>
                                                            <p id="CAT" style="display: none;">* CAT <span
                                                                    class="porcenCAT2"></span>% sin IVA para fines
                                                                informativos</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- TERMINA SECCIÓN DE SELECCIONAR CANTIDAD -->
                                            <hr>
                                            <!-- INICIA SECCIÓN DE CARGA DE DOCUMENTOS -->
                                            <div id="fotos" style="display:block">
                                                <h4> Sube los siguientes archivos</h4>
                                                <P>Nota: Asegúrate de que las fotos tomadas a tu IFE/INE sean legibles y
                                                    que no haya ninguna mancha en tu identificación, esto para evitar
                                                    errores de lectura.</P>
                                            </div>
                                            <div class="row">
                                                <div class="col-12 col-md-4">
                                                    <div class="form-group">
                                                        <div class="wrap-custom-file">
                                                            <input type="file" name="ine_frontal" id="ine_frontal"
                                                                accept="image/*;capture=camera">
                                                            <label for="ine_frontal">
                                                                <h5 style="margin-top: 3rem;">
                                                                    Foto INE Frontal </h5>
                                                                <span style="font-size: 10px">Solo se admiten formatos
                                                                    JPEG y PNG</span>
                                                                <i class="fa fa-plus-circle fa-2x"></i>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-4">
                                                    <div class="form-group">
                                                        <div class="wrap-custom-file">
                                                            <input type="file" name="ine_reverso" id="ine_reverso"
                                                                accept="image/*;capture=camera">
                                                            <label for="ine_reverso">
                                                                <h5 style="margin-top: 3rem;">
                                                                    Foto INE Reverso </h5>
                                                                <span style="font-size: 10px">Solo se admiten formatos
                                                                    JPEG y PNG</span></span>
                                                                <i class="fa fa-plus-circle fa-2x"></i>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-4">
                                                    <div class="form-group">
                                                        <div class="wrap-custom-file">
                                                            <input type="file" name="foto_selfie" id="foto_selfie"
                                                                accept="image/*;capture=camera">
                                                            <label for="foto_selfie">
                                                                <h5 style="margin-top: 3rem;">
                                                                    Selfie con tú INE</h5>
                                                                <span style="font-size:10px">Selfie con tú INE en mano
                                                                    (entre barbilla y cuello). Solo se admiten formatos
                                                                    JPEG y PNG</span>
                                                                <i class="fa fa-plus-circle fa-2x"></i> <br> <br>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h5>Datos para validación de vigencia de INE</h5> <br>
                                                <div class="row">
                                                    <div class="col-12 col-md-6">
                                                        <div class="form_group">
                                                            <label for="claveElector" class="">Clave Elector</label>
                                                            <input type="hidden" name="cic" id="cic"
                                                                class="form-control-fd-diss form-control"
                                                                placeholder="Ingresa el número CIC de tú INE">
                                                            <input type="text" name="claveElector" id="claveElector"
                                                                class="form-control-fd-diss form-control input-color"
                                                                placeholder="Clave de Elector" readonly>
                                                            <p>Datos llenados automáticamente</p>
                                                        </div>
                                                    </div>
                                                    <div class="col-12 col-md-6">
                                                        <div class="form_group">
                                                            <label for="ocr" class="">OCR</label>
                                                            <input type="hidden" name="idCiudadano" id="idCiudadano"
                                                                class="form-control-fd-diss form-control"
                                                                placeholder="Ingresa el ID de ciudadano de tú INE">
                                                            <input type="text" name="ocr" id="ocr"
                                                                class="form-control-fd-diss form-control input-color"
                                                                placeholder="OCR" readonly>
                                                            <input type="hidden" name="numeroEmision"
                                                                id="numeroEmision">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12 col-md-6">
                                                <div class="form-group">
                                                    <div class="wrap-custom-file">
                                                        <input type="file" name="foto_comprobante" id="foto_comprobante"
                                                            accept="image/*;capture=camera">
                                                        <label for="foto_comprobante">
                                                            <h5 style="margin-top: 3rem;">
                                                                Foto comprobante de domicilio</h5>
                                                            <span style="font-size: 10px">Solo se admiten formatos JPEG,
                                                                PNG y PDF</span></span>
                                                            <i class="fa fa-plus-circle fa-2x"></i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-6">
                                                <div class="form-group">
                                                    <div class="wrap-custom-file">
                                                        <input type="file" name="foto_cuenta" id="foto_cuenta"
                                                            accept="image/*;capture=camera">
                                                        <label for="foto_cuenta">
                                                            <h5 style="margin-top: 3rem;">
                                                                Foto estado de cuenta bancaria</h5>
                                                            <span style="font-size: 10px">Solo se admiten formatos JPEG,
                                                                PNG y PDF</span></span>
                                                            <i class="fa fa-plus-circle fa-2x"></i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-4"></div>
                                        </div>
                                        <h5>Banco y número de cuenta donde recibirá su crédito</h5> <br>
                                        <div class="row">
                                            <div class="col-12 col-md-6">
                                                <div class="form_group">
                                                    <label for="">Banco</label>
                                                    <input type="text" id="banco1"
                                                        class="form-control-fd-diss form-control" readonly>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-6">
                                                <div class="form_group">
                                                    <label for="">No de cuenta / Clabe</label>
                                                    <input type="number" id="cuenta1"
                                                        class="form-control-fd-diss form-control"
                                                        placeholder="CLABE Interbancaria/No. de Tarjeta" maxlength="18"
                                                        readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- TERMINA SECCIÓN DE CARGA DE DOCUMENTOS -->
                                    <!-- INICIA GRABAR VIDEO -->
                                    <hr>
                                    <div class="row">
                                        <div class="col-12">
                                            <h4 class="pr-4">Da click en el sigueinte botón y captura un video leyendo
                                                el texto que se te presentará.</h4>
                                            <div class="button_box-fd button_box">
                                                <button class="btn-fd btn deneb_btn btn-block" type="button"
                                                    data-bs-toggle="modal" data-bs-target="#exampleModal">Capturar
                                                    video</button>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- TERMINA GRABAR VIDEO-->
                                    <hr>
                                    <!-- INICIA FORMULARIO DE RECONOCIMIENTO DEL CLIENTE -->
                                    <h4>Formulario de reconocimiento del cliente<span id="dots">...</span></h4>
                                    <div id="more" class="sw-text" style="display:none">
                                        <div class="row">
                                            <div class="col-12">
                                                <p class="text-justify"><strong>Persona Políticamente Expuesta:</strong>
                                                    ¿Usted desempeña o ha desempeñado funciones públicas destacadas en
                                                    un país extranjero o en territorio Nacional, considerando entre
                                                    otros, a los jefes de estado o gobierno, líderes políticos,
                                                    funcionarios gubernamentales, judiciales o militares de alta
                                                    jerarquía, altos ejecutivos de empresas estatales o funcionarios o
                                                    miembros importantes de partidos políticos.</p>
                                                <label>SI <input type="radio" name="res1" id="res1"> NO <input
                                                        type="radio" name="res1" id="res11" checked> </label>
                                                <div class="form_group" id="persona_politica" style="display: none;">
                                                    <div class="row mt-4">
                                                        <div class="col-12 col-md-6">
                                                            <input type="text" name="puestoPolitico" id="puestoPolitico"
                                                                class="form-control-fd form-control"
                                                                placeholder="Puesto o cargo">
                                                        </div>
                                                        <div class="col-12 col-md-6">
                                                            <input type="text" name="periodoPolitico"
                                                                id="periodoPolitico"
                                                                class="form-control-fd form-control"
                                                                placeholder="Periodo">
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12">
                                                <p class="text-justify"><strong>Algún familiar</strong> de usted de
                                                    hasta segundo grado de consanguinidad o afinidad (cónyuge,
                                                    concubina, concubinario, padre, madre, hijos, hermanos, abuelos,
                                                    tíos, primos, cuñados, suegros, yernos o nueras) se encuentran en el
                                                    supuesto antes mencionado?</p>
                                                <label>SI <input type="radio" name="res2" id="res2"> NO <input
                                                        type="radio" name="res2" id="res22" checked> </label>
                                                <div id="persona_familiar" style="display: none;">
                                                    <div class="form_group">
                                                        <div class="row mt-4">
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="apaternoFam" id="apaternoFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Paterno">
                                                            </div>
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="amaternoFam" id="amaternoFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Materno">
                                                            </div>
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="nombreFam" id="nombreFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nombre(s)">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="parentescoFam"
                                                                    id="parentescoFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Parentesco">
                                                            </div>
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="puestoFam" id="puestoFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Puesto o Cargo">
                                                            </div>
                                                            <div class="col-12 col-md-4">
                                                                <input type="text" name="periodoFam" id="periodoFam"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Periodo">
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12">

                                                <p class="text-justify">¿El crédito será liquidado o pagado mediante
                                                    recursos proveniente de algún tercero?</p>
                                                <label>SI <input type="radio" name="res3" id="res3"> NO <input
                                                        type="radio" name="res3" id="res33" checked> </label>
                                                <div id="persona_fisica" style="display: none;" class="mt-4">
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="apaternoTercero"
                                                                    id="apaternoTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Paterno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="amaternoTercero"
                                                                    id="amaternoTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Materno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nombreTercero"
                                                                    id="nombreTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nombre(s)">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="date" name="fechaNacTercero"
                                                                    id="fechaNacTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nacionalidadTercero"
                                                                    id="nacionalidadTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nacionalidad">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisTercero" id="paisTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País de Nacimiento">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <select name="generoTercero" id="generoTercero"
                                                                    class="form-control-fd form-control">
                                                                    <option value="">Seleccione un género</option>
                                                                    <option value="MUJER">MUJER</option>
                                                                    <option value="HOMBRE">HOMBRE</option>
                                                                </select>

                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="entidadTercero"
                                                                    id="entidadTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Entidad Federativa de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="rfcTercero" id="rfcTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="RFC">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisOtorgaTercero"
                                                                    id="paisOtorgaTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País que otorgó el RFC">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="identificacionTercero"
                                                                    id="identificacionTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Número de Identificación Fiscal y país que lo otorgó, (En su caso): ">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="curpTercero" id="curpTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="CURP">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="edocivilTercero"
                                                                    id="edocivilTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Estado Civil">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="ocupacionTercero"
                                                                    id="ocupacionTercero"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ocupación y/o Actividad o Profesión">
                                                            </div>
                                                            <div class="col-md-4"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <a href="javascript:void(0)" id="btn_msg">Ver mas</a> <br>
                                    <h5>DECLARACIÓN BAJO PROTESTA DE DECIR VERDAD DEL SOLICITANTE Y/O EL CLIENTE<span
                                            id="dots2">...</span></h5>
                                    <div id="more2" class="sw-text" style="display:none">
                                        <div class="row">
                                            <div class="col-12">
                                                <p class="text-justify">Por este conducto señalo a FACTOR FORTALEZA,
                                                    S.A. de C.V., SOFOM, E.N.R., que toda la información vertida en el
                                                    presente formato es verdadera, correcta y auténtica, así como las
                                                    manifestaciones contenidas en la misma, por lo que en todos los
                                                    actos y operaciones que realizaré con FACTOR FORTALEZA, S.A. de
                                                    C.V., SOFOM, E.N.R., actuaré a nombre propio y por cuenta propia, y
                                                    no por cuenta de algún tercero. Finalmente, manifiesto que los
                                                    recursos con los que se pagará el crédito, comisiones e intereses de
                                                    esta operación son de origen lícito.</p>
                                                <label>SI <input type="radio" name="res4" id="res4" checked> NO <input
                                                        type="radio" name="res4" id="res44"> </label>
                                                <div class="propietario mt-4" style="display: none;">
                                                    <h5><label for="">Identificación del Propietario Real</label></h5>
                                                    <div class="form_group">
                                                        <strong>Persona física</strong>
                                                        <div class="row mt-4">
                                                            <div class="col-md-4">
                                                                <input type="text" name="apaternoPropietario"
                                                                    id="apaternoPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Paterno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="amaternoPropietario"
                                                                    id="amaternoPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Materno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nombrePropietario"
                                                                    id="nombrePropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nombre(s)">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="date" name="fechaNacPropietario"
                                                                    id="fechaNacPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nacionalidadPropietario"
                                                                    id="nacionalidadPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nacionalidad">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisPropietario"
                                                                    id="paisPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País de Nacimiento">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <select name="generoPropietario" id="generoPropietario"
                                                                    class="form-control-fd form-control">
                                                                    <option value="">Seleccione un género</option>
                                                                    <option value="MUJER">MUJER</option>
                                                                    <option value="HOMBRE">HOMBRE</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="entidadPropietario"
                                                                    id="entidadPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Entidad Federativa de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="rfcPropietario"
                                                                    id="rfcPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="RFC">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-6">
                                                                <input type="text" name="paisOtorgaPropietario"
                                                                    id="paisOtorgaPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País que otorgó el RFC">
                                                            </div>
                                                            <div class="col-md-6">
                                                                <input type="text" name="identificacionPropietario"
                                                                    id="identificacionPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Número de Identificación Fiscal y país que lo otorgó, (En su caso): ">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="curpPropietario"
                                                                    id="curpPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="CURP">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="edocivilPropietario"
                                                                    id="edocivilPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Estado Civil">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="ocupacionPropietario"
                                                                    id="ocupacionPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ocupación y/o Actividad o Profesión">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <strong>Datos de domicilio</strong>
                                                    <div class="form_group mt-4">
                                                        <div class="row">
                                                            <div class="col-md-3">
                                                                <input type="text" name="callePropietario"
                                                                    id="callePropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Calle, Avenida o vía de que se trate">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="nointPropietario"
                                                                    id="nointPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="No. Int">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="noextPropietario"
                                                                    id="noextPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="No. Ext">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="coloniaPropietario"
                                                                    id="coloniaPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Colonia o Urbanización">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-3">
                                                                <input type="text" name="municipioPropietario"
                                                                    id="municipioPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Alcaldía o Municipio">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="ciudadPropietario"
                                                                    id="ciudadPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ciudad o Población">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="entidadPropietario_"
                                                                    id="entidadPropietario_"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Entidad Federativa">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="cpPropietario"
                                                                    id="cpPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="C.P">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisPropietario_"
                                                                    id="paisPropietario_"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="telefonoTercero"
                                                                    id="telefonoPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Teléfono">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="correoPropietario"
                                                                    id="correoPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Correo Electrónico">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="propietario mt-4" style="display: none;">
                                                    <div class="form_group">
                                                        <strong>Persona moral</strong>
                                                        <div class="row mt-4">
                                                            <div class="col-md-4">
                                                                <input type="text" name="razonSocialPropietario"
                                                                    id="razonSocialPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Denominación ó Razón Social">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="giroPropietario"
                                                                    id="giroPropietario"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Giro Mercantil">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nacionalidadMoral"
                                                                    id="nacionalidadMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nacionalidad">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="sectorMoral" id="sectorMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Sector de Ind. a la que pertenece">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="negocioMoral" id="negocioMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Tipo Negocio al que pertenece">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="empleadosMoral"
                                                                    id="empleadosMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Número de empleados">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="paginaMoral" id="paginaMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Página Web">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <select name="fielMoral" id="fielMoral">
                                                                    <option value="">¿Conoce su fiel?</option>
                                                                    <option value="">SI</option>
                                                                    <option value="">NO</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="fielNumeroMoral"
                                                                    id="fielNumeroMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Número de FIEL">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisConstMoral"
                                                                    id="paisConstMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País de constitución">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="fechaConstMoral"
                                                                    id="fechaConstMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha Constitución Moral">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="rfcMoral" id="rfcMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="RFC">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="escrituraMoral"
                                                                    id="escrituraMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Escritura Pública Número">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="fechaMoral" id="fechaMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="notarioMoral" id="notarioMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Notario Público Lic.">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="notariaMoral" id="notariaMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Notaría Número">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="ciudadMoral" id="ciudadMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ciudad de Registro">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="lugarMoral" id="lugarMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Lugar de registro.">
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="folioMoral" id="folioMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Folio Mercantil">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="fecharegMoral"
                                                                    id="fecharegMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha Registro">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <strong>Datos de representante legal</strong>
                                                        <div class="row mt-4">
                                                            <div class="col-md-4">
                                                                <input type="text" name="apaternoLegal"
                                                                    id="apaternoLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Paterno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="amaternoLegal"
                                                                    id="amaternoLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Apellido Materno">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nombreLegal" id="nombreLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nombre(s)">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="date" name="fechaNacLegal"
                                                                    id="fechaNacLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Fecha de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="nacionalidadLegal"
                                                                    id="nacionalidadLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Nacionalidad">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisLegal" id="paisLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País de Nacimiento">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <select name="generoLegal" id="generoLegal"
                                                                    class="form-control-fd form-control">
                                                                    <option value="">Seleccione un género</option>
                                                                    <option value="MUJER">MUJER</option>
                                                                    <option value="HOMBRE">HOMBRE</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="entidadLegal" id="entidadLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Entidad Federativa de Nacimiento">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="rfcLegal" id="rfcLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="RFC">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-6">
                                                                <input type="text" name="paisOtorgaLegal"
                                                                    id="paisOtorgaLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País que otorgó el RFC">
                                                            </div>
                                                            <div class="col-md-6">
                                                                <input type="text" name="identificacionLegal"
                                                                    id="identificacionLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Número de Identificación Fiscal y país que lo otorgó, (En su caso): ">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="curpLegal" id="curpLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="CURP">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="edocivilLegal"
                                                                    id="edocivilLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Estado Civil">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="ocupacionLegal"
                                                                    id="ocupacionLegal"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ocupación y/o Actividad o Profesión">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <strong>Datos de domicilio</strong>
                                                    <div class="form_group mt-4">
                                                        <div class="row">
                                                            <div class="col-md-3">
                                                                <input type="text" name="calleMoral" id="calleMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Calle, Avenida o vía de que se trate">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="nointMoral" id="nointMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="No. Int">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="noextMoral" id="noextMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="No. Ext">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="coloniaMoral" id="coloniaMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Colonia o Urbanización">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-3">
                                                                <input type="text" name="municipioMoral"
                                                                    id="municipioMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Alcaldía o Municipio">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="ciudadMoral" id="ciudadMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Ciudad o Población">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="entidadPropietario_"
                                                                    id="entidadPMoral_"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Entidad Federativa">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <input type="text" name="cpMoral" id="cpMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="C.P">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form_group">
                                                        <div class="row">
                                                            <div class="col-md-4">
                                                                <input type="text" name="paisMoral_" id="paisMoral_"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="País">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="teleMoral" id="telefonoMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Teléfono">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <input type="text" name="correoMoral" id="correoMoral"
                                                                    class="form-control-fd form-control"
                                                                    placeholder="Correo Electrónico">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-12 mt-4" style="text-align: justify;">
                                                        <p>
                                                            <strong>Propietario Real:</strong> A aquella persona física
                                                            que, por medio de otra o de cualquier acto o mecanismo,
                                                            obtiene los beneficios derivados de un contrato u Operación
                                                            celebrado con la Entidad y es, en última instancia, el
                                                            verdadero dueño de los recursos, al tener sobre estos
                                                            derechos de uso, disfrute, aprovechamiento, dispersión o
                                                            disposición.
                                                            El término Propietario Real también comprende a aquella
                                                            persona o grupo de personas físicas que ejerzan el Control
                                                            sobre una persona moral, así como, en su caso, a las
                                                            personas que puedan instruir o determinar, para beneficio
                                                            económico propio, los actos susceptibles de realizarse a
                                                            través de Fideicomisos, mandatos o comisiones.
                                                        </p>
                                                    </div>
                                                </div>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <a href="javascript:void(0)" id="btn_msg2">Ver mas</a> <br>
                                    <div class="row mt-4">
                                        <div class="col-12">
                                            <h5>AUTORIZACIÓN PARA SOLICITAR REPORTES DE CRÉDITO</h5>

                                            <p style="text-align: justify;"><label> <input type="checkbox" id="chkAuth"
                                                        value=""></label> <strong id="text-autorizo"
                                                    class="">Autorizo</strong> expresamente a FACTOR FORTALEZA, S.A. de
                                                C.V., SOFOM, E.N.R. “FACTOR FORTALEZA” para que por conducto de sus
                                                funcionarios facultados lleve a cabo investigaciones<span
                                                    id="dots3">...</span>
                                            <div id="more3" class="sw-text" style="display:none"> sobre mi
                                                comportamiento crediticio y/o el comportamiento crediticio de la empresa
                                                a la cual represento (según aplique, persona física o moral) ante la(s)
                                                Sociedad(es) de Información Crediticia con las que tenga celebrado un
                                                contrato para tal propósito. Del mismo modo declaro que conozco la
                                                naturaleza y el alcance de la información que FACTOR FORTALEZA
                                                solicitará, del uso que FACTOR FORTALEZA hará de tal información y que
                                                FACTOR FORTALEZA podrá realizar consultas periódicas sobre mi historial
                                                crediticio o el de empresa a la cual represento, consintiendo que esta
                                                autorización se encuentre vigente por un período de 3 (tres) años
                                                contados a partir de su expedición y, en todo caso, durante el tiempo
                                                que exista una relación jurídica con FACTOR FORTALEZA. El apoderado o
                                                representante legal declara bajo protesta de decir verdad ser
                                                representante legal de la empresa mencionada en esta autorización y
                                                manifiesta que a la fecha de firma de la presente autorización sus
                                                poderes no han sido revocados, limitados, ni modificados en forma
                                                alguna. Está consciente y acepta que este documento quede bajo la
                                                custodia de FACTOR FORTALEZA para efectos de control y cumplimiento del
                                                artículo 28 de la Ley para Regular a las Sociedades de Información
                                                Crediticia, mismo que establece que las Sociedades solo podrán
                                                proporcionar información a un Usuario, cuando éste cuente con la
                                                autorización expresa de EL CLIENTE mediante su firma autógrafa.
                                                </p>
                                            </div>
                                            <a href="javascript:void(0)" id="btn_msg3">Ver mas</a> <br>
                                            <h5>VALIDACIÓN DE LA INFORMACIÓN PARA USO EXCLUSIVO DE FACTOR FORTALEZA SA
                                                DE CV SOFOM ENR <span id="dots4">...</span></h5>
                                            <div id="more4" class="sw-text" style="display:none">
                                                <p style="text-align: justify;">En cumplimiento a lo establecido en las
                                                    Disposiciones de carácter general a que se refieren los artículos
                                                    115 de la Ley de Instituciones de Crédito (LIC) en relación con el
                                                    87-D de la Ley General de Organizaciones y Actividades Auxiliares
                                                    del Crédito y 95-Bis de este último ordenamiento, y para prevenir y
                                                    detectar actos u omisiones, que pudieran ayudar con la comisión de
                                                    los delitos previstos en los artículos 139 Quáter y 400 Bis del
                                                    Código Penal Federal, el Asesor del área de Cumplimiento de FACTOR
                                                    FORTALEZA, S.A. DE C.V, SOFOM, E.N.R., para dichos efectos (cuyo
                                                    nombre y firma se plasman más adelante) cotejó que las imágenes y
                                                    videograbaciones de la documentación que presentó el Solicitante
                                                    fueren correctas contra la base de datos del Instituto Nacional
                                                    Electoral y, que la misma es consistente con la información
                                                    proporcionada por éste en la Solicitud, asimismo se cercioró,
                                                    identificó, y certificó la identidad y validez de la información y
                                                    documentación que el solicitante entregó para la celebración del
                                                    presente Contrato, siendo responsable frente a FACTOR FORTALEZA de
                                                    dichas actividades. Este formato será evidencia de la validación
                                                    requerida por el Anexo 2 de las Disposiciones de carácter general a
                                                    que se refieren los artículos 115 de la LIC en relación con los
                                                    artículos 87-D y 95-Bis de la LGOAAC, referente a Medios de
                                                    Identificación no presenciales.</p>
                                            </div>
                                            <a href="javascript:void(0)" id="btn_msg4">Ver mas</a> <br>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- TERMINA FORMULARIO DE RECONOCIMIENTO DEL CLIENTE -->
                            <hr>
                            <!-- INICIA FIRMA -->
                            <div class="row">
                                <div class="col-12">
                                    <h4>Ingrese su firma para completar la solicitud de su cr&eacute;dito</h4>
                                    <div class="form_group">
                                        <div class="col-md-6">
                                            <label for="signature"><b>Dibuje su firma, por favor.</b></label><br>
                                            <div id="signature"></div>
                                            <br>
                                            <textarea name="firma" id="firma" class="form-control"
                                                style="display:none"></textarea>
                                            <button id="clear" class="btn btn-secondary">Borrar firma</button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- TERMINA FIRMA -->
                            <hr>
                            <!-- INICIA DESCARGABLES -->
                            <div class="row">
                                <h4>Documentos por generar al autorizar tu crédito</h4>
                                <p>Los siguientes formatos solo son ejemplo de los documentos que se te harán llegar a
                                    través de tu correo electrónico. No requeres hacer alguna acción con ellos, son
                                    demostrativos.</p>
                                <div class="col-6 col-md-3">
                                    <div class="form-group">
                                        <div class="wrap-custom-file-down">
                                            <a href="./assets/pdf/contrato.pdf" rel="noopener noreferrer"
                                                target="_blank">
                                                <label for="">
                                                    <h5 style="margin-top: 2rem;">
                                                        Contrato</h5>
                                                    <i class="fa fa-download fa-2x"></i> <br> <br>
                                                </label>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3">
                                    <div class="form-group">
                                        <div class="wrap-custom-file-down">
                                            <a href="./assets/pdf/caratula.pdf" rel="noopener noreferrer"
                                                target="_blank">
                                                <label for="">
                                                    <h5 style="margin-top: 2rem;">
                                                        Carátula</h5>
                                                    <i class="fa fa-download fa-2x"></i> <br> <br>
                                                </label>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3">
                                    <div class="form-group">
                                        <div class="wrap-custom-file-down">
                                            <a href="./assets/pdf/pagare.pdf" rel="noopener noreferrer" target="_blank">
                                                <label for="">
                                                    <h5 style="margin-top: 2rem;">
                                                        Pagaré</h5>
                                                    <i class="fa fa-download fa-2x"></i> <br> <br>
                                                </label>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3">
                                    <div class="form-group">
                                        <div class="wrap-custom-file-down">
                                            <a href="./assets/pdf/mandato.pdf" rel="noopener noreferrer"
                                                target="_blank">
                                                <label for="">
                                                    <h5 style="margin-top: 2rem;">
                                                        Mandato</h5>
                                                    <i class="fa fa-download fa-2x"></i> <br> <br>
                                                </label>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- TERMINA DESCARGABLES -->
                            <div class="button_box-fd button_box mt-4">
                                <button class="btn-fd btn deneb_btn btn-block" id="btn_cont3" type="submit">Guardar
                                    solicitud</button>
                                <button type="button" style="margin-left:20px; max-width:64px"
                                    class="btn btn-sec salir">Salir</button>
                            </div>
                            <div class="row">
                                <div class="col-6" id="camposSol">

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
    </div>
    </div>
    </div>
    </div>
    </form>
    </div>
</section>
<?php
include('assets/includes/footer.php');
?>

<script type="text/javascript">
var signature = $('#signature').signature({
    syncField: '#firma',
    syncFormat: 'PNG',
    background: 'white',
    thickness: 1,
    color: 'blue'
});
$('#clear').click(function(e) {
    e.preventDefault();
    signature.signature('clear');
    $("#firma").val('');
});
</script>