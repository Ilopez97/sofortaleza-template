<?php
session_start();
if(!isset($_SESSION['token_session'])){
   header('Location: asociados.php');
}
include('assets/includes/header.php'); 
include('modales/modalEmp.php');

?>
<head>
<link rel="stylesheet" href="assets/css/style-as.css">
<link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.2.2/css/buttons.dataTables.min.css">
</head>
<section>
    <div class="container-all-fd header-section container-fluid">
        <div class="row">
            <div class="col-12 head-title text-center">
                <h1 class="text-white">Asociados</h1>
                <h4 class="text-white">Actualización de registro de colaboradores</h4>
            </div>
        </div>
    </div>
</section>


<a href="#tablaEmpl" id="aTabla" style="display:none"></a><a href="#tablaEmplParcial" id="aTablaParcial" style="display:none"></a>

<section id="seccionEmpl">
    <div class="container-lg mb-4 mt-4">
        <div class="row">
            <div class="col-12 col-md-5">
                <div class="card-in-as d-flex align-items-center">
                    <div class="form_group" id="info_empresa2">
                        <h3>Datos de la empresa</h3>
                        <input type="hidden" name="nomEmp" id="nomEmp" value="<?php echo $_SESSION['obj_empresa']->{'Nombre'} ?>">
                        <input type='hidden' name="idEmp" id="idEmp" value="<?php echo $_SESSION['obj_empresa']->{'IdEmp'} ?>">
		                <input type='hidden' name="emplActivos" id="emplActivos" value="">
                        <p><span class="green-type">Nombre:</span> <span class="nomEmp"><?php echo $_SESSION['obj_empresa']->{'Nombre'} ?></span></p>
                        <p><span class="green-type">RFC:</span> <span class="rfcEmp"><?php echo $_SESSION['obj_empresa']->{'RFC'} ?></span></p>
                        <p><span class="green-type">Porcentaje de anticipo de nómina:</span> <span class="porcentaje"><?php echo $_SESSION['obj_empresa']->{'Porcentaje'} ?></span></p>
                        <p><span class="green-type">Colaboradores activos:</span> <span name="emplAct" class="emplActivos">0</span></p>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="container">
                    <div class="row justify-content-end">
                        <div class="col-7 col-md-5 col-download-fd">
                            <div class="button_box-as-fd">
                                <a href="https://sofortaleza.com/test/Layout_Colaboradores_MARZO_2022.xlsx" class="btn-as-fd btn-100 btn-download" target="_blank">
                                <img src="./assets/images/download.svg" class="icon-svg-as img-fluid" alt="turistore icono">    
                                Formato de colaboradores
                                </a>
                            </div>
                        </div>
                        <div class="col-5 col-md-5 col-logout-fd">
                            <div class="button_box-as-fd">
                                <button class="btn-as-fd btn-100 btn-logout-fd" type="button" id="btn_2">
                                    <img src="./assets/images/log-out.svg" class="icon-svg-as img-fluid" alt="turistore icono">    
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-12 col-md-5 ml-4 container-buttons-as-fd">
                <div class="button_box-as-fd">
                    <button class="btn-as-fd deneb_btn btn-block" id="updateEmplParcial">Agregar colaboradores (Formato Parcial)</button>
                </div>
                <div class="button_box-as-fd">
                    <button class="btn-as-fd deneb_btn btn-block" id="updateEmpl">Actualizar TODOS los colaboradores (Formato Completo)</button>
                </div>
                <div class="button_box-as-fd">
                    <button class="btn-as-fd deneb_btn btn-block" data-bs-toggle="modal" data-bs-target="#modalallEmp" id="AllEmpl">Ver todos los colaboradores</button>
                </div>
                <div class="button_box-as-fd">
                    <button class="btn-as-fd deneb_btn btn-block"  id="deleteEmpl">Eliminar un colaborador</button>
                </div>
            </div>
            <div class="col-12 col-md-7" style="padding-bottom: 0px; display:none; margin-top: 0px;" id="seccionArchivo">
                <div class="form-control-fd card" style="background: whitesmoke">
                    <div class="card-body" >
                        <div class="contact_form" id="formArchivo">
                            <div class="section_title" style="  text-align: left; max-width:100%">
                                <strong><h5>Actualizar TODOS los colaboradores (Formato Completo)</h5></strong>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="form_group" id="">
                                        <p>Seleccione un formato válido, seguido de la opción 'subir', para después seleccionar 'Actualizar colaboradores'. <br> <strong>Esta opción reemplazará todos los colaboradores existentes en la empresa</strong> </p>
                                    </div>
                                    <div class="form_group">
                                        <input type="file" name="archivo" id="archivo" class="form_control" accept=".xlsx" required>
                                    </div>
                                </div>
                                <div class="col-12" style="display:block">
                                    <div class="button_box-fd mt-4 button_box">
                                        <button class="btn-fd btn deneb_btn btn-block" id="btn_subir">Subir</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
			</div>
            <div class="col-12 col-md-7" style="padding-bottom: 0px; display:none; margin-top: 0px;" id="seccionArchivoParcial">	
                <div class="form-control-fd card" style="background: whitesmoke">
                    <div class="card-body" >
                        <div class="contact_form" id="formArchivo">
                            <div class="section_title" style="  text-align: left; max-width:100%">
                                <strong><h5>Agregar colaboradores (Formato Parcial)</h5></strong>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="form_group" id="">
                                        <p>Seleccione un formato válido, seguido de la opción 'subir', para después seleccionar 'Agregar colaboradores'. <br> <strong>Esta opción agregará los colaboradores del formato a la empresa</strong> </p>
    
                                    </div>
                                    <div class="form_group">
                                        <input type="file" name="archivo" id="archivoParcial" class="form_control" accept=".xlsx" required>
                                    </div>
                                </div>
                                <div class="col-lg-12" style="display:block">
                                    <div class="button_box-fd mt-4 button_box">
                                        <button class="btn-fd btn deneb_btn btn-block" id="btn_subirParcial">Subir</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    </div>
</section>

<section class="deneb_contact cantact_v2 section_padding" id="tablaEmpl"
    style="margin-top: 0px; padding-top: 0px; display: none;">
    <div class="container pt-5" style="border-top: 2px solid #1B4F5D; padding:10px">
        <div class="row">
            <div class="col-lg-12 m-auto">

                <div class="contact_form" style="display:block">
                    <div class="col-12">

                        <div class="row">
                            <div class="col-12">
                                <div class="form_group">
                                    <strong id="count_exis"style="display: none;">
                                    </strong>
                                    <strong id="count_empl" style="display: none;">
                                    </strong>
                                    <strong>
                                        <h4 class="mb-5" style="display: block;">Vista previa de formato (Completo)</h4>
                                    </strong>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div id="formatoIncompleto" style="display: none;">
                    <div class="col-md-6">
                        <p class="text-danger">Formato incorrecto (faltan datos por llenar/ hay datos incorrectos)</p>
                        <button class="btn btn-fd" data-bs-toggle="modal" data-bs-target="#modalEmp">Ver
                            instrucciones</button>
                    </div>
                </div>

                <div class="form-group">
                    <div id="tabla_wrapper" class="">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="table-responsive">

                                    <table class="table-responsive table" id="tabla"
                                        style="text-align: center; background: white; border-radius:20px; width:100%;"
                                        role="grid" aria-describedby="tabla_info">
                                        <thead id="tablehd" class="thead-fd text-white" style="background: #1B4F5D;">
                                        <tr>
                                            <th>NoEmpleado</th>
                                            <th>RFC</th>
                                            <th>RFC Empresa</th>
                                            <th>RFC Pagadora</th>
                                            <th>CURP</th>
                                            <th>Nombres</th>
                                            <th>APaterno</th>
                                            <th>AMaterno</th>
                                            <th>Calle</th>
                                            <th>NoInt</th>
                                            <th>NoExt</th>
                                            <th>Colonia</th>
                                            <th>CP</th>
                                            <th>Ciudad</th>
                                            <th>Municipio</th>
                                            <th>Estado</th>
                                            <th>Fecha Ingreso del Colaborador</th>
                                            <th>Ingreso Neto</th>
                                            <th>Periodicidad del pago</th>
                                            <th>Puesto</th>
                                            <th>Celular</th>
                                            <th>Correo</th>
                                            <th>Banco</th>
                                            <th>CLABE Interbancaria</th>
                                            <th>NSS</th>
                                            <th>Anticipo</th>
                                            <th>Credito a Plazos</th>
                                        </tr>
                                        </thead>
                                        
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>

                <br><br>
                <div class="col-lg-4" style="margin-bottom:40px">
                    <div class="button_box-as-fd">
                        <button class="btn-as-fd deneb_btn btn-block" style="display: block;" id="btn_actualizar"
                            type="button">Actualizar colaboradores</button>
                    </div>
                    <div class="button_box-as-fd">
                        <button class="btn-as-fd deneb_btn btn-block" style="display: none;" id="btn_resumen" type="button">Ver
                            resumen de carga de colaboradores</button>
                    </div>
                    <!--<div class="button_box-as-fd">
                        <button class="deneb_btn btn-block" id="btn_2">Convertir Table en DataTable</button>
                    </div>-->
                </div>


            </div>
        </div>
    </div>
</section>
<section class="deneb_contact cantact_v2 section_padding" id="tablaEmplParcial"
    style="margin-top: 0px; padding-top: 0px; display: none;">
    <div class="container pt-5" style="border-top: 2px solid #1B4F5D; padding:10px">
        <div class="row">
            <div class="col-lg-12 m-auto">

                <div class="contact_form" style="display:block">
                    <div class="col-12">

                        <div class="row">
                            <div class="col-12">
                                <div class="form_group">
                                    <strong id="count_exisParcial"style="display: none;">
                                    </strong>
                                    <strong id="count_emplParcial" style="display: none;">
                                    </strong>
                                    <strong>
                                        <h4 class="mb-5" style="display: block;">Vista previa de formato (Parcial)</h4>
                                    </strong>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div id="formatoIncompletoParcial" style="display: none;">
                    <div class="col-md-6">
                        <p class="text-danger">Formato incorrecto (faltan datos por llenar/ hay datos incorrectos)</p>
                        <button class="btn btn-fd" data-bs-toggle="modal" data-bs-target="#modalEmp">Ver
                            instrucciones</button>
                    </div>
                </div>

                <div class="form-group">
                    <div id="tabla_wrapper" class="">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="table-responsive">

                                    <table class="table-responsive table" id="tablaParcial"
                                        style="text-align: center; background: white; border-radius:20px; width:100%;"
                                        role="grid" aria-describedby="tabla_info">
                                        <thead id="tablehd" class="thead-fd text-white" style="background: #1B4F5D;">
                                        <tr>
                                            <th>NoEmpleado</th>
                                            <th>RFC</th>
                                            <th>RFC Empresa</th>
                                            <th>RFC Pagadora</th>
                                            <th>CURP</th>
                                            <th>Nombres</th>
                                            <th>APaterno</th>
                                            <th>AMaterno</th>
                                            <th>Calle</th>
                                            <th>NoInt</th>
                                            <th>NoExt</th>
                                            <th>Colonia</th>
                                            <th>CP</th>
                                            <th>Ciudad</th>
                                            <th>Municipio</th>
                                            <th>Estado</th>
                                            <th>Fecha Ingreso del Colaborador</th>
                                            <th>Ingreso Neto</th>
                                            <th>Periodicidad del pago</th>
                                            <th>Puesto</th>
                                            <th>Celular</th>
                                            <th>Correo</th>
                                            <th>Banco</th>
                                            <th>CLABE Interbancaria</th>
                                            <th>NSS</th>
                                            <th>Anticipo</th>
                                            <th>Credito a Plazos</th>
                                        </tr>
                                        </thead>
                                        
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>

                <br><br>
                <div class="col-lg-4" style="margin-bottom:40px">
                    <div class="button_box-as-fd">
                        <button class="btn-as-fd deneb_btn btn-block" style="display: block;" id="btn_actualizarParcial"
                            type="button">Actualizar colaboradores</button>
                    </div>
                    <div class="button_box-as-fd">
                        <button class="btn-as-fd deneb_btn btn-block" style="display: none;" id="btn_resumenParcial" type="button">Ver
                            resumen de carga de colaboradores</button>
                    </div>
                    <!--<div class="button_box-as-fd">
                        <button class="deneb_btn btn-block" id="btn_2">Convertir Table en DataTable</button>
                    </div>-->
                </div>


            </div>
        </div>
    </div>
</section>

<?php
include('assets/includes/footer.php');
?>
<script src="assets/excel/excel-0.7.4.js"></script>
	<script src="assets/excel/excel-0.7.7.js"></script>
	<script src="assets/excel/excel.js"></script>
	<script src="assets/js/jq_dateformat.js"></script>
     <script src="https://cdn.datatables.net/buttons/2.2.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.2.2/js/buttons.html5.min.js"></script>
    <?php $dirjs = 'jsobfs'; 
            include('config/env.php');
            echo '<script type="text/javascript"> var url_serv = "'.getenv('server-linux').'/'.getenv('url-linux').'"; console.log(url_serv) </script>';
            echo '<script type="text/javascript"> var url_serv_avasis = "'.getenv('server').'/'.getenv('url').'"; console.log(url_serv_avasis) </script>';
    ?>   
<script>
    document.write('<script src="<?php echo $dirjs;?>/asociados/empresa.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
</script>
<script>
    document.write('<script src="<?php echo $dirjs;?>/asociados/empresaParcial.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
</script>
<script>
    document.write('<script src="<?php echo $dirjs;?>/asociados/empleados.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
</script>
<script>
    document.write('<script src="<?php echo $dirjs;?>/asociados/empleadosParcial.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
</script>
<script src="js/asociados/login.js"></script>
<script src="js/swal-modals.js"></script>
<script src="js/format_fechas.js"></script>


