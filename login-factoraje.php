<?php
include('assets/includes/header.php'); 
session_start();
if(isset($_SESSION['token_session'])){
    unset($_SESSION['obj_empl']);
    unset($_SESSION['anticipo']);
    unset($_SESSION['empresa']);
    unset($_SESSION['tipo_plazo']);
    unset($_SESSION['periodicidad']);
    unset($_SESSION['token_session']);
    unset($_SESSION['tipo_sesion']);
    unset($_SESSION['latitud']);
    unset($_SESSION['longitud']);
    session_destroy();    
}
?>
<head>
<input type="hidden" id="geoVal">
</head>
<section>
    <?php include('modales/modalCredito.php')?>
    <div class="container-all-fd bk-solicitalo container-fluid vh-100 ">
        <div class="container py-5 h-100">
            <div class="row d-flex justify-content-center align-items-center">
                <div id="col-fd" class="col">
                    <div class="card-fd card">
                        <div class="card-body pd-5-fd">
                            <div>
                                <h1 class="title-form-fd" >Solicita tu factoraje</h1>
                                <div class="contact_form">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="form_group">
                                                <div class="col-12 ">
                                                    <div class="form-outline form-white">
                                                        <label class="form-label-fd form-label" for="rfc_empl">Usuario</label>
                                                        <input type="text" id="rfc_empl" class="form-control-fd form-control" placeholder="Ingrese su usuario" required>
                                                    </div>
                                                </div> <br>
                                                <div class="col-12">
                                                    <label class="form-label-fd form-label" for="rfc_pass">Contraseña</label>
                                                    <input type="password" id="rfc_pass" class="form-control-fd form-control" placeholder="Ingrese su contraseña" required>
                                                </div> <br>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="button_box-fd mt-4 button_box">
                                                <button class="btn-fd btn deneb_btn btn-block" id="btn_cont_factoraje">Ingresar</button>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <a href="javascript:void(0)" class="regFactoraje" class="link-form-fd">Es mi primera vez solicitando un factoraje</a>
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
</section>
<?php
include('assets/includes/footer.php');
?>
    <?php $dirjs = 'jsobfs'; 
            include('config/env.php');
            echo '<script> var url_serv = "'.getenv('server').'/'.getenv('url').'" </script>'
    ?>    
    <script src="assets/js/jq_dateformat.js"></script>
	<script>
		document.write('<script src="<?php echo $dirjs;?>/nomina.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
	</script>
	<script> 
		document.write('<script src="<?php echo $dirjs?>/geolocalizacion.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
	</script>
	<script> 
		document.write('<script src="<?php echo $dirjs?>/session.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
	</script>
	<script> 
		document.write('<script src="<?php echo $dirjs?>/recoverPass.js?version=' + Math.floor(Math.random() * 100) + '"\><\/script>');
	</script>

	<script src="js/createPDF.js"></script>
	

	<script src="js/swals.js"></script>
	<script src="js/swal-modals.js"></script>
