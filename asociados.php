<?php
session_start();
include('assets/includes/header.php'); 
if(isset($_SESSION['token_session'])){
    session_unset();
    session_destroy();
}
?>
<section>
    <div class="container-all-fd bk-asociados container-fluid vh-100 ">
        <div class="container py-5 h-100">
            <div class="row d-flex justify-content-center align-items-center">
                <div id="col-fd" class="col">
                    <div class="card-fd card">
                        <div class="card-body pd-5-fd">
                            <div>
                                <h1 class="title-form-fd" >Actualización de registros de Colaboradores</h1>
                                <div class="contact_form">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="form_group">
                                                <div class="col-12 ">
                                                    <div class="form-outline form-white">
                                                        <label class="form-label-fd form-label" for="rfc_empl">RFC de empresa</label>
                                                        <input type="text" id="rfc" class="form-control-fd form-control" placeholder="Ingrese RFC" required>
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
                                                <button class="btn-fd btn deneb_btn btn-block" id="btn_cont">Buscar</button>
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
    </div>
</section>
<?php
include('assets/includes/footer.php');
?> 
<div>
<script src="js/swals.js"></script>
<script src="js/asociados/login.js"></script>
<script src="js/swal-modals.js"></script>
<script src="js/session.js"></script>
</div>
